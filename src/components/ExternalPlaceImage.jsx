import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPlaceImage, getMemoryCachedImage } from '../utils/imageApi';

/**
 * ExternalPlaceImage
 * - [1순위] 메모리/세션 캐시를 즉시 확인합니다 (동기).
 * - [2순위] Google Places API를 통해 이미지를 가져옵니다.
 * - [3순위] 실패 시 initialUrl(Unsplash 등 정적 이미지)로 폴백합니다.
 *
 * @param {string} name - 장소 이름 (검색 키워드로 사용)
 * @param {string} placeName - name 대체 prop
 * @param {string} initialUrl - 폴백용 정적 이미지 URL
 * @param {string} region - 도시 또는 지역 이름 (검색 정확도 향상)
 * @param {string} className - 추가 CSS 클래스
 * @param {string} alt - 이미지 alt 텍스트
 * @param {object} style - 인라인 스타일
 */
const ExternalPlaceImage = ({ name, placeName, initialUrl, region, className, alt, style }) => {
    const searchName = name || placeName;
    
    // [동기식 캐시 확인] 컴포넌트 생성 시점에 이미 알고 있는 이미지는 즉시 표시
    const cached = getMemoryCachedImage(region, searchName);
    
    const [imgUrl, setImgUrl] = useState(cached || null);
    const [loading, setLoading] = useState(!cached);
    const [error, setError] = useState(false);

    useEffect(() => {
        // searchName이 없으면 initialUrl만 사용
        if (!searchName) {
            setImgUrl(initialUrl || null);
            setLoading(false);
            if (!initialUrl) setError(true);
            return;
        }

        // [캐시 히트] 이미 동기적으로 캐시를 로드했으면 API 호출 생략
        const alreadyCached = getMemoryCachedImage(region, searchName);
        if (alreadyCached) {
            setImgUrl(alreadyCached);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadImg = async () => {
            setLoading(true);
            setError(false);

            try {
                // [1순위] Google Places API → 캐시 레이어 포함
                const fetched = await fetchPlaceImage(region || '', searchName);

                if (cancelled) return;

                if (fetched) {
                    setImgUrl(fetched);
                } else if (initialUrl) {
                    // [폴백] 정적 initialUrl (Unsplash 등)
                    setImgUrl(initialUrl);
                } else {
                    setError(true);
                }
            } catch (e) {
                if (cancelled) return;
                console.error("ExternalPlaceImage 로드 실패:", searchName, e);
                if (initialUrl) {
                    setImgUrl(initialUrl);
                } else {
                    setError(true);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadImg();

        return () => { cancelled = true; };
    }, [searchName, region]);  // initialUrl은 폴백이므로 의존성에서 제외 (불필요한 재호출 방지)

    return (
        <div className={`relative overflow-hidden ${className} bg-gray-200`} style={style}>
            {/* 로딩 상태: Shimmer Skeleton */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10"
                    >
                        <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5">
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] animate-pulse">
                                Loading...
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 에러 / 빈 상태 (Wanderlust Placeholder) */}
            {error && !imgUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
                    <div className="flex flex-col items-center p-4 text-center">
                        <span className="text-white text-2xl font-black tracking-widest opacity-80 mb-2">WANDERLUST</span>
                        <div className="w-12 h-1 bg-white/30 rounded-full mb-3" />
                        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Adventure Awaits</span>
                    </div>
                </div>
            )}

            {/* 메인 이미지 */}
            {imgUrl && (
                <>
                    <motion.img
                        key={imgUrl}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        src={imgUrl}
                        alt={alt || searchName}
                        className="absolute inset-0 w-full h-full object-cover"
                        onLoad={() => setLoading(false)}
                        onError={(e) => {
                            e.target.onerror = null;
                            // Google Places 이미지 로드 실패 시 initialUrl로 재시도
                            if (initialUrl && imgUrl !== initialUrl) {
                                setImgUrl(initialUrl);
                            } else {
                                setImgUrl(null);
                                setError(true);
                            }
                        }}
                    />
                    {/* 가독성 향상용 하단 그라데이션 */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                </>
            )}
        </div>
    );
};

export default ExternalPlaceImage;
