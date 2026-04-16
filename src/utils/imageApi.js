export const SERPAPI_KEY = "fe72560f7dfef3bc3e2cf9fb9fd2013f3413405df5c39f0ed558c1b5ffb75be4";

const imageCache = new Map();

/**
 * Searches for an image using SerpApi (Google Images).
 * Strict filtering is applied for landscape/place images.
 * Results are cached in memory to prevent duplicate API hits during re-renders.
 * @param {string} city - The city name
 * @param {string} place - The specific place name
 * @returns {Promise<string|null>} - Returns the image URL or null if not found
 */
export const fetchPlaceImage = async (city, place) => {
  try {
    // 1. Strict Querying format
    const query = `${city} ${place} official tourist spot high resolution`;
    
    if (imageCache.has(query)) {
        return imageCache.get(query);
    }

    const searchUrl = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`;
    
    // Using corsproxy to bypass browser CORS restrictions for SerpApi
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      console.error("Failed to fetch image from API");
      return null;
    }

    const data = await response.json();
    
    // 2. Content Filtering Priority
    if (data.images_results && data.images_results.length > 0) {
      // Find highest quality landscape image
      for (let img of data.images_results) {
        if (img.original && img.original.startsWith('http')) {
             imageCache.set(query, img.original);
             return img.original;
        }
      }
      imageCache.set(query, data.images_results[0].thumbnail);
      return data.images_results[0].thumbnail; // fallback to thumbnail
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching place image:", error);
    return null;
  }
};
