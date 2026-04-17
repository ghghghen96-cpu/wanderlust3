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
    const allowedHosts = ['localhost', 'wanderlust-ai-planner', 'vercel.app'];
    const hostname = window.location.hostname;
    return allowedHosts.some(host => hostname.includes(host));
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
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photoReference}&key=${GOOGLE_PLACE_API_KEY}`;
      return photoUrl;
    }
    return null;
  } catch (error) {
    console.warn("Google Places image fetch failed, falling back to SerpApi:", error);
    return null;
  }
};

/**
 * Searches for an image using Google Places API (Primary) or SerpApi (Fallback).
 * Includes Level 1 (Memory) and Level 2 (Firestore) Caching.
 */
export const fetchPlaceImage = async (city, place) => {
  if (!city && !place) return null;
  const query = `${city} ${place}`.trim();
  const cacheKey = query.toLowerCase().replace(/\s+/g, '_');
  
  // [Level 1] Memory Cache Check
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  try {
    // [Level 2] Firestore Cache Check
    const cacheDocRef = doc(db, "Place_Images_Cache", cacheKey);
    const cacheSnap = await getDoc(cacheDocRef);
    
    if (cacheSnap.exists()) {
      const cachedUrl = cacheSnap.data().photo_url;
      console.log(`[Cache Hit] Firestore: ${query}`);
      imageCache.set(cacheKey, cachedUrl);
      return cachedUrl;
    }

    // [Level 3] API Fetch (Cache Miss)
    console.log(`[Cache Miss] Calling API: ${query}`);
    let imageUrl = await fetchGooglePlacesImage(query);
    
    // Fallback to SerpApi if Google fails
    if (!imageUrl) {
      console.log("Falling back to SerpApi for query:", query);
      const searchUrl = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query + " scenic view high resolution")}&api_key=${SERPAPI_KEY}`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`;

      const response = await fetch(proxyUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.images_results && data.images_results.length > 0) {
          imageUrl = data.images_results[0].original || data.images_results[0].thumbnail;
        }
      }
    }

    if (imageUrl) {
      // Save to both Memory and Firestore Cache
      imageCache.set(cacheKey, imageUrl);
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

    return null;
  } catch (error) {
    console.error("Error in fetchPlaceImage:", error);
    return null;
  }
};
