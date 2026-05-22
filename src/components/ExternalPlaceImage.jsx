import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPlaceImage, getMemoryCachedImage } from '../utils/imageApi';

/**
 * ExternalPlaceImage
 * - [1순위] 메모리 캐시 즉시 확인 (동기)
 * - [2순위] IndexedDB 영구 캐시 (새로고침 후에도 바로 표시, 비동기지만 매우 빠름)
 * - [3순위] Firestore 캐시
 * - [4순위] Google Places API (고화질 실사진)
 * - [5순위] Unsplash 폴백
 *
 * @param {string} name - 장소 이름 (검색 키워드)
 * @param {string} placeName - name 대체 prop
 * @param {string} initialUrl - 폴백용 정적 이미지 URL
 * @param {string} region - 도시/지역 이름 (검색 정확도 향상)
 * @param {string} className - CSS 클래스
 * @param {string} alt - 이미지 alt 텍스트
 * @param {object} style - 인라인 스타일
 */
const ExternalPlaceImage = ({ name, placeName, initialUrl, region, className, alt, style }) => {
    const searchName = name || placeName;

    // [동기] 메모리 캐시 즉시 확인
    const memoryCached = getMemoryCachedImage(region, searchName);

    const [imgUrl, setImgUrl] = useState(memoryCached || initialUrl || null);
    const [loading, setLoading] = useState(!memoryCached);
    const [error, setError] = useState(false);
    const [source, setSource] = useState(memoryCached ? 'cache' : null);
    const cancelledRef = useRef(false);

    useEffect(() => {
        cancelledRef.current = false;

        // searchName이 없으면 initialUrl만 사용
        if (!searchName) {
            setImgUrl(initialUrl || null);
            setLoading(false);
            if (!initialUrl) setError(true);
            return;
        }

        // [1] 메모리 캐시 히트 → 즉시 반환
        const memCached = getMemoryCachedImage(region, searchName);
        if (memCached) {
            setImgUrl(memCached);
            setLoading(false);
            setSource('cache');
            return;
        }

        // [2~5] 비동기 로드 (IndexedDB → Firestore → Google Places → Unsplash)
        const loadImg = async () => {
            setLoading(true);
            setError(false);

            try {
                // fetchPlaceImage가 내부적으로 모든 캐시 레이어를 순서대로 확인
                const fetched = await fetchPlaceImage(region || '', searchName);

                if (cancelledRef.current) return;

                if (fetched) {
                    setImgUrl(fetched);
                    const src = fetched.includes('maps.googleapis.com') ? 'google_places' : 
                                fetched.includes('unsplash.com') ? 'unsplash' : 'cache';
                    setSource(src);
                } else if (initialUrl) {
                    setImgUrl(initialUrl);
                    setSource('fallback');
                } else {
                    setError(true);
                }
            } catch (e) {
                if (cancelledRef.current) return;
                console.error('ExternalPlaceImage 로드 실패:', searchName, e);
                if (initialUrl) {
                    setImgUrl(initialUrl);
                    setSource('fallback');
                } else {
                    setError(true);
                }
            } finally {
                if (!cancelledRef.current) setLoading(false);
            }
        };

        loadImg();

        return () => { cancelledRef.current = true; };
    }, [searchName, region]);

    return (
        <div className={`relative overflow-hidden ${className || ''} bg-gray-200`} style={style}>
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
                        transition={{ duration: 0.4 }}
                        src={imgUrl}
                        alt={alt || searchName}
                        className="absolute inset-0 w-full h-full object-cover"
                        onLoad={() => setLoading(false)}
                        onError={(e) => {
                            e.target.onerror = null;
                            // Google Places 이미지 로드 실패 시 initialUrl로 재시도
                            if (initialUrl && imgUrl !== initialUrl) {
                                setImgUrl(initialUrl);
                                setSource('fallback');
                            } else {
                                setImgUrl(null);
                                setError(true);
                            }
                        }}
                    />
                    {/* 가독성 향상용 하단 그라데이션 */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                    {/* Google Places 출처 배지 (개발 환경에서만) */}
                    {source === 'google_places' && import.meta.env.DEV && (
                        <div className="absolute top-2 left-2 z-10 bg-blue-600/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                            📍 Google
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ExternalPlaceImage;
