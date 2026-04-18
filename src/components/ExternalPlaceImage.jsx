import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPlaceImage } from '../utils/imageApi';

/**
 * ExternalPlaceImage
 * @param {string} name - 장소 이름
 * @param {string} initialUrl - 초기 이미지 URL (또는 폴백용)
 * @param {string} region - 도시 또는 지역 이름
 * @param {string} className - 추가 CSS 클래스
 * @param {string} alt - 이미지 alt 텍스트
 */
const ExternalPlaceImage = ({ name, placeName, initialUrl, region, className, alt, style }) => {
    const searchName = name || placeName;
    const [imgUrl, setImgUrl] = useState(initialUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        // 플레이스홀더 판별: URL이 없거나, 아주 작은 사이즈(w=20, w=16)의 명시적 플레이스홀더인 경우만 fetch
        const isPlaceholder = !initialUrl || 
            (typeof initialUrl === 'string' && (
                initialUrl.includes('w=20&') || 
                initialUrl.includes('w=16&') || 
                initialUrl === 'w=20' ||
                initialUrl === 'w=16' ||
                initialUrl.includes('placeholder')
            ));
        
        if (isPlaceholder && searchName) {
            const loadImg = async () => {
                setLoading(true);
                setError(false);
                try {
                    const searchRegion = region || '';
                    const fetched = await fetchPlaceImage(searchRegion, searchName);
                    
                    if (fetched) {
                        setImgUrl(fetched);
                    } else if (initialUrl) {
                        setImgUrl(initialUrl);
                    } else {
                        setError(true);
                    }
                } catch (e) {
                    console.error("ExternalPlaceImage fetch failed:", name, e);
                    if (initialUrl) setImgUrl(initialUrl);
                    else setError(true);
                } finally {
                    setLoading(false);
                }
            };
            loadImg();
        } else {
            // initialUrl이 플레이스홀더가 아닌 실제 이미지인 경우 바로 설정
            setImgUrl(initialUrl);
            setLoading(false);
        }
    }, [searchName, region, initialUrl]);

    return (
        <div className={`relative overflow-hidden ${className} bg-gray-200`} style={style}>
            {/* Loading State: Shimmer Skeleton */}
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10"
                    >
                        {/* Shimmer Effect Box */}
                        <div className="w-full h-full animate-shimmer bg-gray-200" />
                        
                        {/* Overlay text for better UX (Optional) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5">
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] animate-pulse">
                                Optimizing View...
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error or Empty State */}
            {error && !imgUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                        <span className="text-gray-400 text-xs text-secondary font-bold">!</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">No Image Found</span>
                </div>
            )}

            {/* Main Image */}
            {imgUrl && (
                <motion.img 
                    key={imgUrl}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src={imgUrl} 
                    alt={alt || searchName}
                    className="w-full h-full object-cover"
                    onLoad={() => setLoading(false)}
                    onError={(e) => {
                        e.target.onerror = null;
                        setError(true);
                        // 최종 폴백: 고화질 여행 테마 이미지
                        e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600';
                    }}
                />
            )}
        </div>
    );
};

export default ExternalPlaceImage;
