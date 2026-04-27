import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const SERPAPI_KEY = "fe72560f7dfef3bc3e2cf9fb9fd2013f3413405df5c39f0ed558c1b5ffb75be4";
// Google Places API Key (VITE_GOOGLE_PLACE_API_KEY가 없을 경우 Firebase 키 사용)
export const GOOGLE_PLACE_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API_KEY || "AIzaSyBwR9DgMXq1Iwx8vnqiB3GYbD5ikJ5r4Uw";

const imageCache = new Map();

/**
 * 보안 강화: 허용된 호스트인지 확인 (클라이언트 사이드 기초 보안)
 */
const isValidOrigin = () => {
    const allowedHosts = ['localhost', '127.0.0.1', 'wanderlust-ai-planner', 'vercel.app'];
    const hostname = window.location.hostname;
    return allowedHosts.some(host => hostname.includes(host)) || hostname === '';
};

/**
 * 이미지 URL의 유효성을 검사하고 미리 로드합니다.
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
 * Google Places API를 사용하여 고화질 이미지를 가져옵니다.
 */
const fetchGooglePlacesImage = async (query) => {
  if (!isValidOrigin()) return null;
  
  try {
    // 1. Place Search (findplacefromtext)
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=photos,name&key=${GOOGLE_PLACE_API_KEY}`;
    // Vercel 생산 환경에서 corsproxy.io가 종종 차단되어 allorigins 사용으로 변경
    const proxySearchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`;

    const response = await fetch(proxySearchUrl);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.status === 'OK' && data.candidates && data.candidates[0].photos) {
      const photoReference = data.candidates[0].photos[0].photo_reference;
      
      // 2. Place Photo (직접 URL 반환)
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACE_API_KEY}`;
      return photoUrl;
    }
    return null;
  } catch (error) {
    console.warn("Google Places image fetch failed:", error);
    return null;
  }
};

/**
 * Searches for an image using Unsplash (Primary) or Google Places API (Fallback).
 * Includes Level 1 (Memory), Level 1.5 (SessionStorage), and Level 2 (Firestore) Caching.
 */
export const fetchPlaceImage = async (city, place) => {
  if (!city && !place) return null;
  // 검색 키워드 최적화: [도시이름] [장소이름] travel
  const query = `${city || ''} ${place || ''} travel`.trim();
  const cacheKey = query.toLowerCase().replace(/\s+/g, '_');
  
  // [Level 1] Memory Cache Check
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  // [Level 1.5] Session Storage Cache Check
  try {
    const sessionCache = sessionStorage.getItem(`img_${cacheKey}`);
    if (sessionCache) {
      imageCache.set(cacheKey, sessionCache);
      return sessionCache;
    }
  } catch (e) {
    console.warn("Session storage access failed:", e);
  }

  try {
    // [Level 2] Firestore Cache Check
    const cacheDocRef = doc(db, "Place_Images_Cache", cacheKey);
    const cacheSnap = await getDoc(cacheDocRef);
    
    if (cacheSnap.exists()) {
      const cachedUrl = cacheSnap.data().photo_url;
      console.log(`[Cache Hit] Firestore: ${query}`);
      imageCache.set(cacheKey, cachedUrl);
      try { sessionStorage.setItem(`img_${cacheKey}`, cachedUrl); } catch(e){}
      return cachedUrl;
    }

    // [Level 3] API Fetch (Cache Miss) - Hybrid Approach
    console.log(`[Cache Miss] Calling API: ${query}`);
    let imageUrl = null;

    // 1. Try Unsplash API (Primary)
    const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
    try {
        await preloadImage(unsplashUrl);
        imageUrl = unsplashUrl;
        console.log("[Source: Unsplash] Success");
    } catch (unsplashError) {
        console.warn("[Source: Unsplash] Failed, falling back to Google Places");
        // 2. Try Google Places API (Fallback)
        // Google Places는 travel 키워드 없이 정확도를 높이기 위해 원래 키워드로 재설정
        const googleQuery = `${city || ''} ${place || ''}`.trim();
        const googleUrl = await fetchGooglePlacesImage(googleQuery);
        if (googleUrl) {
            try {
                await preloadImage(googleUrl);
                imageUrl = googleUrl;
                console.log("[Source: Google Places] Success");
            } catch (googleError) {
                console.warn("[Source: Google Places] Failed");
            }
        }
    }

    if (imageUrl) {
      // Save to all caches
      imageCache.set(cacheKey, imageUrl);
      try { sessionStorage.setItem(`img_${cacheKey}`, imageUrl); } catch(e){}
      try {
        await setDoc(cacheDocRef, {
            query: query,
            photo_url: imageUrl,
            cachedAt: serverTimestamp()
        });
      } catch (dbError) {
        console.warn("Failed to save image to Firestore cache:", dbError);
      }
      return imageUrl;
    }

    // 모든 API 실패 시 null 반환 (컴포넌트에서 Wanderlust Placeholder 처리)
    return null;
  } catch (error) {
    console.error("Error in fetchPlaceImage:", error);
    return null;
  }
};
