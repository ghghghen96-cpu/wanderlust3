import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    X, Upload, CheckCircle2, DollarSign, FileText, Image, ChevronRight 
} from 'lucide-react';
import { publishToMarketplace, uploadThumbnailToStorage } from '../../firebase';

/**
 * PublishModal component for sharing itineraries to the marketplace.
 */
const PublishModal = ({ isOpen, onClose, itinerary, data, flights, hotels, user }) => {
    const { t } = useTranslation('translation', { keyPrefix: 'itinerary' });
    const { t: commonT } = useTranslation('translation');
    const navigate = useNavigate();
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [selectedThumb, setSelectedThumb] = useState(0);
    const [publishing, setPublishing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [publishError, setPublishError] = useState('');
    const [countdown, setCountdown] = useState(3);

    // ── Canvas 이미지 압축 유틸 (최대 800px, JPEG 75%) ──────────────────
    const compressImage = (dataUrl, maxSize = 800, quality = 0.75) => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
                const canvas = document.createElement('canvas');
                canvas.width  = Math.round(img.width  * ratio);
                canvas.height = Math.round(img.height * ratio);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => resolve(dataUrl); // 압축 실패 시 원본 반환
            img.src = dataUrl;
        });
    };
    
    // ─── 이미지 업로드 관련 상태 ─────────────────────────────────────────────────
    const [uploadedImage, setUploadedImage] = useState(null); // 사용자가 업로드한 이미지 DataURL
    const [isUploading, setIsUploading] = useState(false);    // 파일 읽기 중 로딩 상태
    const [isDragOver, setIsDragOver] = useState(false);      // 드래그 오버 강조 표시
    const fileInputRef = useRef(null);                        // 숨김 파일 input 참조

    // 가장 평점이 높은 장소 우선으로 썸네일 자동 추천
    const thumbnailCandidates = useMemo(() => {
        let allItems = [];
        itinerary.forEach(day => {
            day.items.forEach(item => {
                if (item.img) allItems.push(item);
            });
        });
        
        // 내림차순 정렬 (높은 평점 우선)
        allItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        
        const imgs = [];
        allItems.forEach(item => {
            if (!imgs.includes(item.img)) {
                imgs.push(item.img);
            }
        });
        
        return imgs.slice(0, 6); // 최대 6개까지 후보
    }, [itinerary]);

    // 등록 핸들러
    const handlePublish = async () => {
        console.log("--- Publish Process Started ---");

        // 최종 썸네일: 업로드 이미지 우선, 없으면 자동 추천 이미지 사용
        const finalThumbnail = uploadedImage || thumbnailCandidates[selectedThumb] || '';
        
        // 1. 유효성 검사 (Validation)
        if (!price || isNaN(parseFloat(price))) {
            setPublishError(t('publishErrorNoPrice') || 'Please enter a valid price.');
            return;
        }
        if (!description || description.trim().length < 5) {
            setPublishError(t('publishErrorNoDesc') || 'Please enter a detailed description (min 5 chars).');
            return;
        }
        if (!finalThumbnail) {
            setPublishError(t('publishErrorNoThumb') || '썸네일 이미지를 업로드하거나 선택해 주세요.');
            return;
        }

        console.log("Validation passed. Data assembly starting...");
        setPublishing(true);
        setPublishError('');
        
        try {
            // 업로드된 이미지가 DataURL 형태일 경우 Firebase Storage에 업로드 (문서 크기 제한 1MB 방지)
        console.log("Processing thumbnail...");
            // 이미지가 DataURL이면 압축 후 업로드 (원본 그대로는 수 MB → 업로드 수십 초)
            const compressedThumb = finalThumbnail.startsWith('data:image')
                ? await compressImage(finalThumbnail)
                : finalThumbnail;
            const safeThumbnail = await uploadThumbnailToStorage(compressedThumb, user?.uid || 'anon');

            // 1. 기본 메타데이터 구성 (순환 참조 및 undefined 방지)
            const templateBase = {
                creatorUid: user?.uid || 'anonymous',
                creatorName: user?.displayName || commonT('nav.traveler', { defaultValue: 'Traveler' }),
                creatorEmail: user?.email || '',
                creatorAvatar: user?.photoURL || '',
                title: String(description).trim(),
                price: parseFloat(price),
                thumbnail: safeThumbnail,
                destination: String(data.destination || ''),
                region: detectRegion(data.destination),
                category: String(data.travelWith || 'Solo'),
                budget: String(data.pace || 'Moderate'),
                startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
                endDate: data.endDate ? new Date(data.endDate).toISOString() : new Date().toISOString(),
                totalDays: parseInt(itinerary.length) || 0,
                totalSpots: itinerary.reduce((s, d) => s + (d.items?.length || 0), 0),
                focus: Array.isArray(data.focus) ? data.focus : [],
                pace: String(data.pace || 'Moderate'),
                vibe: String(data.vibe || ''),
                publishedAt: new Date().toISOString()
            };

            // 2. 일정 데이터 직렬화
            const days = itinerary.map(day => ({
                dayNum: parseInt(day.dayNum),
                date: day.date instanceof Date ? day.date.toISOString() : String(day.date),
                theme: String(day.theme || ''),
                items: (day.items || []).map(item => ({
                    name: String(item.name || ''),
                    desc: String(item.desc || ''),
                    type: String(item.type || ''),
                    time: String(item.time || ''),
                    img: String(item.img || ''),
                    latitude: item.latitude ? parseFloat(item.latitude) : null,
                    longitude: item.longitude ? parseFloat(item.longitude) : null,
                    rating: item.rating ? parseFloat(item.rating) : null,
                }))
            }));

            // 3. 항공/숙소 데이터 직렬화
            const flightData = (flights || []).map(f => ({
                type: String(f.type || 'Outbound'),
                from: String(f.from || ''),
                to: String(f.to || ''),
                number: String(f.number || ''),
                time: String(f.time || ''),
                notes: String(f.notes || '')
            }));

            const hotelData = (hotels || []).map(h => ({
                name: String(h.name || ''),
                address: String(h.address || ''),
                confirmation: String(h.confirmation || ''),
                checkin: String(h.checkin || ''),
                checkout: String(h.checkout || '')
            }));

            const finalData = {
                ...templateBase,
                itinerary: days,
                flights: flightData,
                hotels: hotelData
            };

            console.log("Final data assembled successfully:", finalData);
            
            // 4. API 호출
            const docId = await publishToMarketplace(finalData);
            console.log("Publish success! Received docId:", docId);
            
            setSuccess(true);

            // 5. 카운트다운 후 리다이렉트 (강제 이동)
            let count = 3;
            setCountdown(count);
            const timer = setInterval(() => {
                count -= 1;
                if (count >= 0) setCountdown(count);
                if (count <= 0) {
                    clearInterval(timer);
                    window.location.href = '/marketplace';
                }
            }, 1000);
            
        } catch (err) {
            console.error('CRITICAL: Publish process failed:', err);
            const errorMsg = err.message || 'Failed to publish. Connection error or invalid data.';
            setPublishError(errorMsg);
        } finally {
            setPublishing(false);
        }
    };

    // 지역 자동 감지 (간단 매핑)
    const detectRegion = (dest) => {
        const d = (dest || '').toLowerCase();
        if (['japan', 'korea', 'seoul', 'tokyo', 'osaka', 'bangkok', 'bali', 'singapore', 'vietnam', 'china', 'beijing', 'shanghai', 'taipei', 'hong kong', '서울', '부산', '도쿄', '오사카', '방콕', '다낭', '하노이', '타이베이', '상하이', '베이징'].some(k => d.includes(k))) return 'Asia';
        if (['paris', 'london', 'rome', 'barcelona', 'amsterdam', 'berlin', 'zurich', 'switzerland', 'interlaken', 'santorini', 'greece', 'italy', 'spain', 'france', 'germany', 'portugal', '파리', '런던', '로마', '피렌체', '바르셀로나', '산토리니', '프라하', '빈', '뮌헨', '베네치아', '밀라노', '리스본'].some(k => d.includes(k))) return 'Europe';
        if (['new york', 'los angeles', 'san francisco', 'miami', 'hawaii', 'usa', 'canada', 'mexico', '뉴욕', '로스앤젤레스', '밴쿠버', '칸쿤'].some(k => d.includes(k))) return 'Americas';
        if (['maldives', 'dubai', 'qatar', 'turkey', 'istanbul', '두바이', '이스탄불'].some(k => d.includes(k))) return 'Middle East';
        if (['sydney', 'melbourne', 'australia', 'new zealand', 'fiji', '시드니', '멜버른', '퀸즈타운'].some(k => d.includes(k))) return 'Oceania';
        if (['cape town', 'morocco', 'kenya', 'egypt', 'africa', '카이로', '케이프타운', '마라케시'].some(k => d.includes(k))) return 'Africa';
        return 'Other';
    };

    const processFile = (file) => {
        if (!file) return;
        if (!file.type.match(/image\/(jpeg|png|gif|webp)/)) {
            setPublishError('JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다.');
            return;
        }
        if (file.size > 20 * 1024 * 1024) { // 20MB로 제한 완화 (압축해서 올림)
            setPublishError('파일 크기가 20MB를 초과합니다.');
            return;
        }
        setIsUploading(true);
        setPublishError('');
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // 압축 적용 (업로드 전 미리 줄여서 FileReader 후 즉시 압축)
                const compressed = await compressImage(e.target.result);
                setUploadedImage(compressed);
            } catch {
                setUploadedImage(e.target.result); // 압축 실패 시 원본
            }
            setSelectedThumb(-1);
            setIsUploading(false);
        };
        reader.onerror = () => {
            setPublishError('이미지를 불러오는 중 오류가 발생했습니다.');
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                {success ? (
                    <div className="p-10 text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                            className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center"
                        >
                            <CheckCircle2 size={40} className="text-green-500" />
                        </motion.div>
                        <h2 className="text-2xl font-black text-secondary">{t('publishSuccess')}</h2>
                        <p className="text-gray-500">{t('publishSuccessDesc')}</p>
                        <p className="text-sm font-bold text-primary bg-primary/10 py-2 rounded-full">
                            {commonT('payment.autoRedirect')} ({countdown}s)
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-colors">
                                {t('publishViewMarket')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="relative bg-gradient-to-br from-secondary via-slate-800 to-slate-900 px-8 py-8 text-white">
                            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                                <X size={22} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <Upload size={20} className="text-secondary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">{t('publishTitle')}</h2>
                                    <p className="text-white/60 text-xs font-bold">{t('publishSubtitle')}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">{data.destination}</span>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">{itinerary.length} {t('days')}</span>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">{(itinerary || []).reduce((s, d) => s + (d.items?.length || 0), 0)} {t('spots')}</span>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign size={14} className="text-primary" /> {t('publishPrice')}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    placeholder={t('publishPricePlaceholder')}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-gray-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} className="text-primary" /> {t('publishDesc')}
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={t('publishDescPlaceholder')}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-gray-300"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Image size={14} className="text-primary" /> SELECT THUMBNAIL
                                </label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />

                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                                        isDragOver
                                            ? 'border-primary bg-primary/5 scale-[1.01] shadow-md shadow-primary/10'
                                            : uploadedImage
                                                ? 'border-green-400 bg-green-50/50'
                                                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50/60'
                                    }`}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2 py-5">
                                            <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            <span className="text-xs text-gray-400 font-bold">이미지 불러오는 중...</span>
                                        </div>
                                    ) : uploadedImage ? (
                                        <div className="flex items-center gap-4 px-4 py-3">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={uploadedImage}
                                                    alt="Thumb"
                                                    className="w-20 h-14 object-cover rounded-xl border-2 border-green-400 shadow-md"
                                                />
                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow">
                                                    <CheckCircle2 size={12} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-xs font-black text-green-700 flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> 업로드 완료
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">클릭하여 교체</p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setSelectedThumb(0); }}
                                                    className="mt-1.5 text-[10px] text-red-400 hover:text-red-600 font-bold flex items-center gap-0.5 transition-colors"
                                                >
                                                    <X size={10} /> 삭제
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 py-5">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${ isDragOver ? 'bg-primary/20' : 'bg-gray-100'}`}>
                                                <Upload size={20} className={isDragOver ? 'text-primary' : 'text-gray-400'} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-gray-600">내 사진 업로드하기</p>
                                                <p className="text-[10px] text-gray-400">JPG, PNG, GIF</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {thumbnailCandidates.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-3 my-1">
                                            <div className="flex-1 h-px bg-gray-100" />
                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">OR CHOOSE FROM ITINERARY AI</span>
                                            <div className="flex-1 h-px bg-gray-100" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2.5">
                                            {thumbnailCandidates.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => { setSelectedThumb(idx); setUploadedImage(null); }}
                                                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                                                        !uploadedImage && selectedThumb === idx
                                                            ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30'
                                                            : 'border-gray-200 hover:border-primary/40'
                                                    }`}
                                                >
                                                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                                    {!uploadedImage && selectedThumb === idx && (
                                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                            <CheckCircle2 size={22} className="text-white drop-shadow-lg" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {publishError && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold text-center">
                                    {publishError}
                                </div>
                            )}

                            <button
                                onClick={handlePublish}
                                disabled={publishing || isUploading || !price || !description}
                                className="w-full py-4 bg-gradient-to-r from-primary to-amber-400 text-secondary font-black text-lg rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3"
                            >
                                {publishing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                                        {t('publishSubmitting')}
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        {t('publishSubmit')}
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default PublishModal;
