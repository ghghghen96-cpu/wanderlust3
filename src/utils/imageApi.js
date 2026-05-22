import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const SERPAPI_KEY = "fe72560f7dfef3bc3e2cf9fb9fd2013f3413405df5c39f0ed558c1b5ffb75be4";
// Google Places API Key
export const GOOGLE_PLACE_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API_KEY || "AIzaSyBwR9DgMXq1Iwx8vnqiB3GYbD5ikJ5r4Uw";

// ────────────────────────────────────────────────
// 레벨 1: 메모리 캐시 (앱 실행 중 가장 빠름)
// ────────────────────────────────────────────────
const memoryCache = new Map();

// ────────────────────────────────────────────────
// 레벨 2: IndexedDB 영구 캐시 (새로고침 후에도 즉시 표시)
// ────────────────────────────────────────────────
const IDB_NAME = 'wanderlust_place_images';
const IDB_STORE = 'images';
const IDB_VERSION = 1;

let idbPromise = null;

const openIDB = () => {
    if (idbPromise) return idbPromise;
    idbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') { resolve(null); return; }
        const req = indexedDB.open(IDB_NAME, IDB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(IDB_STORE)) {
                const store = db.createObjectStore(IDB_STORE, { keyPath: 'key' });
                store.createIndex('cachedAt', 'cachedAt', { unique: false });
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => { console.warn('[IDB] 열기 실패'); resolve(null); };
    });
    return idbPromise;
};

/** IndexedDB에서 이미지 URL 읽기 */
const getFromIDB = async (key) => {
    try {
        const idb = await openIDB();
        if (!idb) return null;
        return new Promise((resolve) => {
            const tx = idb.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get(key);
            req.onsuccess = () => {
                const result = req.result;
                // 30일 초과 캐시는 무효화
                if (result && Date.now() - result.cachedAt < 30 * 24 * 60 * 60 * 1000) {
                    resolve(result.url);
                } else {
                    resolve(null);
                }
            };
            req.onerror = () => resolve(null);
        });
    } catch { return null; }
};

/** IndexedDB에 이미지 URL 저장 */
const saveToIDB = async (key, url, source) => {
    try {
        const idb = await openIDB();
        if (!idb) return;
        const tx = idb.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put({ key, url, source, cachedAt: Date.now() });
    } catch (e) {
        console.warn('[IDB] 저장 실패:', e);
    }
};

/** 캐시 키 생성 */
const makeCacheKey = (city, place) => {
    return `${city || ''}_${place || ''}`.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_가-힣]/g, '');
};

// ────────────────────────────────────────────────
// 메모리 캐시 즉시 조회 (동기, 컴포넌트 초기화용)
// ────────────────────────────────────────────────
export const getMemoryCachedImage = (city, place) => {
    if (!city && !place) return null;
    const key = makeCacheKey(city, place);
    return memoryCache.get(key) || null;
};

/** 모든 캐시 레벨에 일괄 저장 */
const saveToAllCaches = async (key, url, source) => {
    memoryCache.set(key, url);
    saveToIDB(key, url, source);
    // Firestore 백그라운드 저장
    try {
        const cacheDocRef = doc(db, "Place_Images_Cache", key);
        setDoc(cacheDocRef, {
            query: key,
            photo_url: url,
            source,
            cachedAt: serverTimestamp()
        }, { merge: true }).catch(() => {});
    } catch {}
};

// ────────────────────────────────────────────────
// 허용된 호스트 확인 (보안)
// ────────────────────────────────────────────────
const isValidOrigin = () => {
    const allowedHosts = ['localhost', '127.0.0.1', 'wanderlust-ai-planner', 'vercel.app'];
    const hostname = window.location.hostname;
    return allowedHosts.some(host => hostname.includes(host)) || hostname === '';
};

/** 이미지 URL 프리로드 */
const preloadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
});

// ────────────────────────────────────────────────
// Google Places API - 이미지 가져오기
// ────────────────────────────────────────────────
export const fetchGooglePlacesImage = async (query) => {
    if (!isValidOrigin()) return null;
    try {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=photos,name,place_id&key=${GOOGLE_PLACE_API_KEY}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`;

        const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) return null;

        const data = await response.json();
        if (data.status === 'OK' && data.candidates?.[0]?.photos?.[0]) {
            const photoReference = data.candidates[0].photos[0].photo_reference;
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACE_API_KEY}`;
            return photoUrl;
        }
        return null;
    } catch (error) {
        console.warn('[Google Places] 이미지 가져오기 실패:', error);
        return null;
    }
};

// ────────────────────────────────────────────────
// Unsplash 폴백
// ────────────────────────────────────────────────
const fetchUnsplashImage = async (query) => {
    const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
    try {
        await preloadImage(url);
        return url;
    } catch {
        return null;
    }
};

// ────────────────────────────────────────────────
// 메인 API: 장소 이미지 가져오기
// 우선순위: 메모리 캐시 → IndexedDB(영구) → Firestore → Google Places → Unsplash
// ────────────────────────────────────────────────
export const fetchPlaceImage = async (city, place) => {
    if (!city && !place) return null;

    const googleQuery = `${city || ''} ${place || ''}`.trim();
    const key = makeCacheKey(city, place);

    // [1] 메모리 캐시 (동기)
    const memCached = memoryCache.get(key);
    if (memCached) return memCached;

    // [2] IndexedDB 영구 캐시 (새로고침 후에도 즉시 표시)
    const idbCached = await getFromIDB(key);
    if (idbCached) {
        memoryCache.set(key, idbCached); // 메모리에도 올림
        return idbCached;
    }

    try {
        // [3] Firestore 캐시
        const cacheDocRef = doc(db, "Place_Images_Cache", key);
        const cacheSnap = await getDoc(cacheDocRef);
        if (cacheSnap.exists()) {
            const cachedUrl = cacheSnap.data().photo_url;
            if (cachedUrl) {
                console.log(`[Cache Hit] Firestore: ${googleQuery}`);
                memoryCache.set(key, cachedUrl);
                await saveToIDB(key, cachedUrl, cacheSnap.data().source || 'firestore');
                return cachedUrl;
            }
        }

        // [4] Google Places API (우선)
        console.log(`[Cache Miss] Google Places API 호출: ${googleQuery}`);
        let imageUrl = null;

        const googleUrl = await fetchGooglePlacesImage(googleQuery);
        if (googleUrl) {
            try {
                await preloadImage(googleUrl);
                imageUrl = googleUrl;
                console.log('[Source: Google Places] ✅ 성공:', googleQuery);
            } catch {
                console.warn('[Source: Google Places] 이미지 로드 실패 → Unsplash 폴백');
            }
        }

        // [5] Unsplash 폴백
        if (!imageUrl) {
            imageUrl = await fetchUnsplashImage(`${googleQuery} travel`);
            if (imageUrl) console.log('[Source: Unsplash] 폴백 사용:', googleQuery);
        }

        if (imageUrl) {
            const source = imageUrl.includes('maps.googleapis.com') ? 'google_places' : 'unsplash';
            await saveToAllCaches(key, imageUrl, source);
            return imageUrl;
        }

        return null;

    } catch (error) {
        console.error('fetchPlaceImage 오류:', error);
        return null;
    }
};

// ────────────────────────────────────────────────
// 배치 프리페치: 여러 장소 이미지를 병렬로 미리 캐싱
// 일정 생성 직후 호출하여 모든 활동 이미지를 백그라운드에서 미리 저장
// ────────────────────────────────────────────────
export const prefetchActivityImages = async (activities, destination) => {
    if (!activities || !destination) return;

    const unique = new Map();
    activities.forEach(day => {
        (day.activities || []).forEach(act => {
            const key = makeCacheKey(destination, act.name);
            if (!unique.has(key) && !memoryCache.has(key)) {
                unique.set(key, { city: destination, place: act.name });
            }
        });
    });

    const entries = [...unique.values()];
    if (entries.length === 0) return;

    console.log(`[Prefetch] ${entries.length}개 장소 이미지 백그라운드 캐싱 시작`);

    // 3개씩 병렬 처리 (API 한도 고려)
    for (let i = 0; i < entries.length; i += 3) {
        const batch = entries.slice(i, i + 3);
        await Promise.allSettled(batch.map(({ city, place }) => fetchPlaceImage(city, place)));
        // API 호출 간 짧은 지연
        if (i + 3 < entries.length) await new Promise(r => setTimeout(r, 300));
    }

    console.log(`[Prefetch] ✅ ${entries.length}개 이미지 캐싱 완료`);
};
