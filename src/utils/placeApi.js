// src/utils/placeApi.js
// 구글 플레이스 API를 활용한 위치 기반 실시간 식당 추천 유틸리티

/**
 * Google Maps JS SDK를 동적으로 로드합니다.
 * 이미 로드되어 있다면 재사용합니다.
 */
const loadGoogleMapsScript = (apiKey) => {
    return new Promise((resolve, reject) => {
        // 이미 로드된 경우 즉시 반환
        if (window.google && window.google.maps && window.google.maps.places) {
            resolve(window.google.maps);
            return;
        }
        // 로드 중인 경우 폴링으로 대기
        if (document.getElementById('google-maps-script')) {
            const check = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.places) {
                    clearInterval(check);
                    resolve(window.google.maps);
                }
            }, 100);
            // 10초 타임아웃
            setTimeout(() => { clearInterval(check); reject(new Error('Google Maps 로드 타임아웃')); }, 10000);
            return;
        }
        // 최초 로드
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = () => reject(new Error('Google Maps 스크립트 로드 실패'));
        document.head.appendChild(script);
    });
};

/**
 * 사용자 취향(diningPreferences)에 따라 검색 파라미터를 매핑합니다.
 * @param {string[]} diningPreferences - 식사 취향 배열
 * @returns {{ type: string, minPriceLevel: number, maxPriceLevel: number }}
 */
const getDiningParams = (diningPreferences = []) => {
    const prefs = diningPreferences.map(p => p.toLowerCase());

    if (prefs.some(p => p.includes('fine'))) {
        // 파인 다이닝: 레스토랑, 가격대 3~4
        return { type: 'restaurant', minPriceLevel: 3, maxPriceLevel: 4 };
    }
    if (prefs.some(p => p.includes('street'))) {
        // 스트릿 푸드: 포장/테이크아웃, 가격대 0~1
        return { type: 'meal_takeaway', minPriceLevel: 0, maxPriceLevel: 1 };
    }
    // 캐주얼 (기본): 레스토랑, 가격대 1~2
    return { type: 'restaurant', minPriceLevel: 1, maxPriceLevel: 2 };
};

/**
 * 단일 nearbySearch 요청을 Promise로 래핑합니다.
 * @param {object} service - PlacesService 인스턴스
 * @param {object} request - nearbySearch 요청 파라미터
 * @param {object} maps - google.maps 객체
 * @param {number} minRating - 최소 평점
 * @param {number} minReviews - 최소 리뷰 수
 * @returns {Promise<Array>} - 필터링된 장소 배열
 */
const searchNearby = (service, request, maps, minRating, minReviews) => {
    return new Promise((resolve) => {
        service.nearbySearch(request, (results, status) => {
            if (status === maps.places.PlacesServiceStatus.OK && results) {
                const filtered = results
                    .filter(place =>
                        (place.rating || 0) >= minRating &&
                        (place.user_ratings_total || 0) >= minReviews
                    )
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
                resolve(filtered);
            } else {
                resolve([]); // 결과 없음 또는 에러 → 빈 배열
            }
        });
    });
};

/**
 * 구글 플레이스 API를 활용하여 위치 기반 실제 식당 추천 리스트를 가져옵니다.
 *
 * 검색 전략 (단계별 Fallback):
 *  1단계: 반경 500m, 평점 4.2 이상, 리뷰 100개 이상
 *  2단계: 반경 1km,  평점 4.2 이상, 리뷰 100개 이상
 *  3단계: 반경 2km,  평점 4.0 이상, 리뷰 50개 이상 (기준 완화)
 *
 * @param {number} lat - 기준 위도
 * @param {number} lng - 기준 경도
 * @param {string[]} diningPreferences - 식사 취향 (예: ['Street Food', 'Casual Dining'])
 * @returns {Promise<Array>} - 정규화된 장소 객체 배열
 */
export const fetchRealRestaurants = async (lat, lng, diningPreferences = []) => {
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

    if (!GOOGLE_API_KEY) {
        console.warn('[PlaceAPI] VITE_GOOGLE_PLACE_API_KEY 환경 변수가 없습니다. 더미 데이터로 대체합니다.');
        return [];
    }
    if (!lat || !lng) {
        console.warn('[PlaceAPI] 위도/경도가 유효하지 않습니다.');
        return [];
    }

    try {
        const maps = await loadGoogleMapsScript(GOOGLE_API_KEY);
        const service = new maps.places.PlacesService(document.createElement('div'));
        const { type, minPriceLevel, maxPriceLevel } = getDiningParams(diningPreferences);
        const location = new maps.LatLng(lat, lng);

        const makeRequest = (radius) => ({
            location,
            radius,
            type,
            minPriceLevel,
            maxPriceLevel,
        });

        // === 1단계: 반경 500m, 평점 4.2+, 리뷰 100+ ===
        let results = await searchNearby(service, makeRequest(500), maps, 4.2, 100);
        if (results.length > 0) {
            console.log(`[PlaceAPI] ✅ 500m 이내 ${results.length}곳 발견`);
            return normalizeResults(results, maps);
        }

        // === 2단계: 반경 1km, 평점 4.2+, 리뷰 100+ ===
        console.log('[PlaceAPI] 500m 이내 결과 없음 → 1km로 확장');
        results = await searchNearby(service, makeRequest(1000), maps, 4.2, 100);
        if (results.length > 0) {
            console.log(`[PlaceAPI] ✅ 1km 이내 ${results.length}곳 발견`);
            return normalizeResults(results, maps);
        }

        // === 3단계: 반경 2km, 평점 4.0+, 리뷰 50+ (기준 완화) ===
        console.log('[PlaceAPI] 1km 이내 결과 없음 → 2km + 기준 완화');
        results = await searchNearby(service, makeRequest(2000), maps, 4.0, 50);
        if (results.length > 0) {
            console.log(`[PlaceAPI] ✅ 2km 이내 (완화 기준) ${results.length}곳 발견`);
            return normalizeResults(results, maps);
        }

        console.warn('[PlaceAPI] 모든 Fallback 단계에서 결과를 찾지 못했습니다.');
        return [];

    } catch (error) {
        console.error('[PlaceAPI] 식당 검색 중 오류:', error);
        return [];
    }
};

/**
 * 구글 PlacesService 결과를 UI에서 사용하기 쉬운 형태로 정규화합니다.
 * @param {Array} results - nearbySearch 결과 배열
 * @param {object} maps - google.maps 객체
 * @returns {Array} - 정규화된 객체 배열
 */
const normalizeResults = (results, maps) => {
    return results.map(place => {
        // 대표 사진 URL (최대 너비 600px)
        const photoUrl = place.photos && place.photos.length > 0
            ? place.photos[0].getUrl({ maxWidth: 600 })
            : null;

        // 구글 지도 상세 페이지 URL (place_id 기반 → 가장 정확한 링크)
        const mapsUrl = place.place_id
            ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;

        return {
            name: place.name,
            rating: place.rating || null,
            reviewCount: place.user_ratings_total || 0,
            priceLevel: place.price_level ?? null,
            photoUrl,
            placeId: place.place_id || null,
            mapsUrl,
            latitude: place.geometry?.location?.lat() || null,
            longitude: place.geometry?.location?.lng() || null,
            // vicinity: 간략 주소 (현지인 팁으로 활용)
            vicinity: place.vicinity || null,
            // types: 장소 카테고리
            types: place.types || [],
        };
    });
};
