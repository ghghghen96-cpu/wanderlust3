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
const ExternalPlaceImage = ({ name, initialUrl, region, className, alt }) => {
    const [imgUrl, setImgUrl] = useState(initialUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        // 이미지가 없거나, Unsplash의 일반적인 플레이스홀더인 경우 fetch 시도
        const isPlaceholder = !initialUrl || (typeof initialUrl === 'string' && (initialUrl.includes('unsplash.com/photo') || initialUrl.includes('loremflickr.com')));
        
        if (isPlaceholder && name) {
            const loadImg = async () => {
                setLoading(true);
                setError(false);
                try {
                    const searchRegion = region || '';
                    const fetched = await fetchPlaceImage(searchRegion, name);
                    
                    if (fetched) {
                        setImgUrl(fetched);
                    } else if (!initialUrl) {
                        setError(true);
                    }
                } catch (e) {
                    console.error("ExternalPlaceImage fetch failed:", name, e);
                    if (!initialUrl) setError(true);
                } finally {
                    setLoading(false);
                }
            };
            loadImg();
        } else {
            // initialUrl이 플레이스홀더가 아닌 실제 이미지인 경우 바로 설정
            setImgUrl(initialUrl);
        }
    }, [name, region, initialUrl]);

    return (
        <div className={`relative overflow-hidden ${className} bg-slate-100`}>
            {/* Loading State */}
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-[2px]"
                    >
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                            Searching Photo...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error or Empty State */}
            {error && !imgUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">No Photo Found</span>
                </div>
            )}

            {/* Main Image */}
            {imgUrl && (
                <motion.img 
                    key={imgUrl}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    src={imgUrl} 
                    alt={alt || name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        // 최종 폴백: 여행 테마 이미지
                        e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800';
                    }}
                />
            )}
        </div>
    );
};

export default ExternalPlaceImage;
