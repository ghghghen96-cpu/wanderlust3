export const SERPAPI_KEY = "fe72560f7dfef3bc3e2cf9fb9fd2013f3413405df5c39f0ed558c1b5ffb75be4";
// Google Places API Key (VITE_GOOGLE_PLACE_API_KEY가 없을 경우 Firebase 키 사용)
export const GOOGLE_PLACE_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API_KEY || "AIzaSyBwR9DgMXq1Iwx8vnqiB3GYbD5ikJ5r4Uw";

const imageCache = new Map();

/**
 * Google Places API를 사용하여 고화질 이미지를 가져옵니다.
 */
const fetchGooglePlacesImage = async (query) => {
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
      // Note: Google Places Photo API는 리다이렉션을 통해 이미지를 바로 보여주므로, 
      // HTML 이미지 태그에 바로 넣거나, 최종 리다이렉트된 URL을 가져와야 합니다.
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photoReference}&key=${GOOGLE_PLACE_API_KEY}`;
      
      // corsproxy를 거치면 이미지 바이너리가 오므로, 
      // 클라이언트에서 <img src={photoUrl}> 로 직접 쓸 수 있게 이 URL을 반환해도 되지만,
      // 캐싱 및 유효성 확인을 위해 head 요청 등으로 체크할 수도 있습니다.
      // 여기서는 직접 URL을 반환합니다. (Google API는 CORS 정책에 따라 이미지 로드가 가능할 수 있음)
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
 */
export const fetchPlaceImage = async (city, place) => {
  const query = `${city} ${place} scenic view`;
  
  if (imageCache.has(query)) {
    return imageCache.get(query);
  }

  try {
    // 1. Google Places API 시도
    let imageUrl = await fetchGooglePlacesImage(`${city} ${place}`);
    
    // 2. 실패 시 SerpApi 시도
    if (!imageUrl) {
      console.log("Falling back to SerpApi for query:", query);
      const searchUrl = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query + " high resolution")}&api_key=${SERPAPI_KEY}`;
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
      imageCache.set(query, imageUrl);
      return imageUrl;
    }

    return null;
  } catch (error) {
    console.error("Error in fetchPlaceImage:", error);
    return null;
  }
};
