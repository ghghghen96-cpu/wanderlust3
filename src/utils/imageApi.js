import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const SERPAPI_KEY = "fe72560f7dfef3bc3e2cf9fb9fd2013f3413405df5c39f0ed558c1b5ffb75be4";
// Google Places API Key
export const GOOGLE_PLACE_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API_KEY || "AIzaSyBwR9DgMXq1Iwx8vnqiB3GYbD5ikJ5r4Uw";

const imageCache = new Map();
const sessionCachePrefix = "img_v2_";

/**
 * [Level 1] 메모리 캐시에서 즉시 이미지를 가져옵니다.
 * (컴포넌트 초기화 시 동기적으로 사용 가능)
 */
export const getMemoryCachedImage = (city, place) => {
    if (!city && !place) return null;
    const query = `${city || ''} ${place || ''}`.trim();
    const cacheKey = query.toLowerCase().replace(/\s+/g, '_');
    
    // 1. 메모리 캐시 확인
    if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);
    
    // 2. 세션 스토리지 확인 (동기적)
    try {
        const stored = sessionStorage.getItem(`${sessionCachePrefix}${cacheKey}`);
        if (stored) {
            imageCache.set(cacheKey, stored);
            return stored;
        }
    } catch (e) {}
    
    return null;
};

/**
 * 허용된 호스트인지 확인 (기초 보안)
 */
const isValidOrigin = () => {
    const allowedHosts = ['localhost', '127.0.0.1', 'wanderlust-ai-planner', 'vercel.app'];
    const hostname = window.location.hostname;
    return allowedHosts.some(host => hostname.includes(host)) || hostname === '';
};

/**
 * 이미지 URL 유효성 검사 및 미리 로드
 */
const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = url;
    });
};

/**
 * [1순위] Google Places API를 사용하여 고화질 이미지를 가져옵니다.
 * Place Text Search → Place Photo 순서로 진행합니다.
 */
export const fetchGooglePlacesImage = async (query) => {
    if (!isValidOrigin()) return null;

    try {
        // 1단계: Place Text Search로 photo_reference 획득
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=photos,name,place_id&key=${GOOGLE_PLACE_API_KEY}`;
        // CORS 우회 프록시 (allorigins.win)
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`;

        const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) return null;

        const data = await response.json();
        if (data.status === 'OK' && data.candidates?.[0]?.photos?.[0]) {
            const photoReference = data.candidates[0].photos[0].photo_reference;

            // 2단계: photo_reference로 실제 이미지 URL 생성
            // Place Photo API는 리다이렉트 URL을 반환하므로 직접 src에 넣어도 동작
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACE_API_KEY}`;
            return photoUrl;
        }
        return null;
    } catch (error) {
        console.warn("[Google Places] 이미지 가져오기 실패:", error);
        return null;
    }
};

/**
 * [2순위 폴백] Unsplash를 통한 이미지 검색
 */
const fetchUnsplashImage = async (query) => {
    const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
    try {
        await preloadImage(unsplashUrl);
        console.log("[Source: Unsplash] 폴백 성공");
        return unsplashUrl;
    } catch {
        console.warn("[Source: Unsplash] 폴백 실패");
        return null;
    }
};

/**
 * 장소 이미지를 가져옵니다.
 * 우선순위: [캐시] → [Google Places API] → [Unsplash 폴백]
 *
 * @param {string} city - 도시 이름
 * @param {string} place - 장소 이름
 * @returns {Promise<string|null>} 이미지 URL
 */
export const fetchPlaceImage = async (city, place) => {
    if (!city && !place) return null;

    // 검색 키워드: 도시 + 장소명
    const googleQuery = `${city || ''} ${place || ''}`.trim();
    const unsplashQuery = `${googleQuery} travel`;
    const cacheKey = googleQuery.toLowerCase().replace(/\s+/g, '_');

    // [Level 1] 메모리 캐시 및 세션 캐시 (동기적 확인 가능)
    const cached = getMemoryCachedImage(city, place);
    if (cached) return cached;

    try {
        // [Level 2] Firestore 캐시
        const cacheDocRef = doc(db, "Place_Images_Cache", cacheKey);
        const cacheSnap = await getDoc(cacheDocRef);

        if (cacheSnap.exists()) {
            const cachedUrl = cacheSnap.data().photo_url;
            console.log(`[Cache Hit] Firestore: ${googleQuery}`);
            imageCache.set(cacheKey, cachedUrl);
            try { sessionStorage.setItem(`img_${cacheKey}`, cachedUrl); } catch (e) { }
            return cachedUrl;
        }

        // [Level 3] API 직접 호출 - Google Places 우선 → Unsplash 폴백
        console.log(`[Cache Miss] API 호출: ${googleQuery}`);
        let imageUrl = null;

        // 1순위: Google Places API
        const googleUrl = await fetchGooglePlacesImage(googleQuery);
        if (googleUrl) {
            try {
                await preloadImage(googleUrl);
                imageUrl = googleUrl;
                console.log("[Source: Google Places] 성공");
            } catch {
                console.warn("[Source: Google Places] 이미지 로드 실패, Unsplash로 폴백");
            }
        }

        // 2순위 폴백: Unsplash
        if (!imageUrl) {
            imageUrl = await fetchUnsplashImage(unsplashQuery);
        }

        if (imageUrl) {
            // 모든 캐시 레벨에 저장
            imageCache.set(cacheKey, imageUrl);
            try { sessionStorage.setItem(`${sessionCachePrefix}${cacheKey}`, imageUrl); } catch (e) { }
            try {
                await setDoc(cacheDocRef, {
                    query: googleQuery,
                    photo_url: imageUrl,
                    source: imageUrl.includes('maps.googleapis.com') ? 'google_places' : 'unsplash',
                    cachedAt: serverTimestamp()
                });
            } catch (dbError) {
                console.warn("Firestore 캐시 저장 실패:", dbError);
            }
            return imageUrl;
        }

        // 모든 소스 실패 시 null (컴포넌트에서 플레이스홀더 처리)
        return null;

    } catch (error) {
        console.error("fetchPlaceImage 오류:", error);
        return null;
    }
};
