import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import PaymentModal from '../components/PaymentModal';
import { Star, MapPin, SlidersHorizontal, CheckCircle2, Sliders, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, getUserPurchases, recordPurchase, getMarketplaceTemplates } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { MOCK_TEMPLATES } from '../data/marketplaceData';

// 목적지ID 기반 대표 이미지 (안정적인 Unsplash URL로 교체)
const DEST_IMAGES = {
    seoul: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=800",
    tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800",
    osaka: "https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=800",
    kyoto: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
    bangkok: "https://images.unsplash.com/photo-1583307812975-22ae42713e38?q=80&w=800",
    bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
    singapore: "https://images.unsplash.com/photo-1525625232747-076121f17671?q=80&w=800",
    paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800",
    london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800",
    rome: "https://images.unsplash.com/photo-1515542622106-78b28af7815f?q=80&w=800",
    barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800",
    amsterdam: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=800",
    prague: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800",
    istanbul: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
    newyork: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800",
    sydney: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800",
    taipei: "https://images.unsplash.com/photo-1552233319-39956247343e?q=80&w=800",
    danang: "https://images.unsplash.com/photo-1559592442-7e182c9403db?q=80&w=800",
    beijing: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800",
    hongkong: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=800",
    jeju: "https://images.unsplash.com/photo-1574163486518-e379df14ac01?q=80&w=800",
    busan: "https://images.unsplash.com/photo-1578637387939-43c525550085?q=80&w=800",
    maldives: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
    santorini: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800",
    DEFAULT: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800"
};

// destination 텍스트 또는 destinationId를 기반으로 "업로드 여부에 상관없이" 항상 기본 제공 고화질 이미지 반환 (Fallback 전용)
const getFallbackImage = (tmpl) => {
    const destId = (tmpl.destinationId || '').toLowerCase();
    if (destId && DEST_IMAGES[destId]) return DEST_IMAGES[destId];

    const dest = (tmpl.destination || '').toLowerCase();
    const matchedKey = Object.keys(DEST_IMAGES).find(k =>
        k !== 'DEFAULT' && (dest.includes(k) || dest.includes(k.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()))
    );
    if (matchedKey) return DEST_IMAGES[matchedKey];

    return DEST_IMAGES.DEFAULT;
};

// 화면에 최초로 보여줄 이미지 (1차적으로 매핑)
const getTemplateImage = (tmpl) => {
    // 1. 업로드된 이미지가 정상적인 URL인 경우 (하지만 이 URL이 깨져있을 수 있으므로 onError 대비 필요)
    const stored = tmpl.thumbnail || tmpl.image;
    if (stored && !stored.startsWith('data:') && stored.startsWith('http')) return stored;

    // 없으면 Fallback과 동일하게 동작
    return getFallbackImage(tmpl);
};

const SkeletonCard = () => (
    <div className="bg-[#1E293B] rounded-2xl overflow-hidden border border-[#334155] flex flex-col h-[380px] animate-pulse">
        <div className="h-48 bg-slate-700/50 w-full" />
        <div className="p-5 flex flex-col flex-1 gap-4">
            <div className="w-1/3 h-3 bg-slate-700/50 rounded" />
            <div className="w-full h-5 bg-slate-700/50 rounded" />
            <div className="w-2/3 h-5 bg-slate-700/50 rounded" />
            <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#334155]">
                <div className="w-1/4 h-6 bg-slate-700/50 rounded" />
                <div className="w-1/3 h-8 bg-slate-700/50 rounded-lg" />
            </div>
        </div>
    </div>
);

const Marketplace = () => {
    const { t } = useTranslation();
    
    // Filters State
    const [selectedRegion, setSelectedRegion] = useState("All");
    const [selectedBudget, setSelectedBudget] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchasedIds, setPurchasedIds] = useState([]);
    const processingRef = useRef(false);
    
    // User & Auth State
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [dbTemplates, setDbTemplates] = useState([]);

    // Fetch templates from Firestore
    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            const data = await getMarketplaceTemplates();
            setDbTemplates(data);
            setIsLoading(false);
        };
        fetchTemplates();
    }, []);

    // Fetch user and purchases (Firestore)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                const purchases = await getUserPurchases(u.uid);
                // templateId가 숫자일 수도, 문자열일 수도 있어서 양첨 모두 문자열로 저장
                setPurchasedIds(purchases.map(p => String(p.templateId)));
            } else {
                setPurchasedIds([]); // 로그아웃 시 리셋
            }
        });
        return () => unsubscribe();
    }, []);

    const regions = ["All", "Asia", "Europe", "Americas"];
    const budgets = ["All", "Budget", "Moderate", "Luxury"];
    const categories = ["All", "Couple", "Family", "Solo"];

    // Filter Logic - Simulate loading whenever filters change
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600); 
        return () => clearTimeout(timer);
    }, [selectedRegion, selectedBudget, selectedCategory]);

    const ALL_TEMPLATES = useMemo(() => {
        const dbItems = dbTemplates.map(tmpl => {
            // DB에서 가져온 제목 및 목적지 키 정제화
            let rawTitle = tmpl.title;
            let rawDest = tmpl.destination || '';
            
            // 만약 타이틀이 아예 없거나, 번역 키 형태라면 목적지 필드로 대체 시도
            if (!rawTitle || (rawTitle.includes('.') && rawTitle.toLowerCase().startsWith('survey'))) {
                rawTitle = rawDest;
            }

            // 대체한 타이틀(목적지 텍스트)이 여전히 번역 키라면 t() 함수로 변환
            let translatedTitle = rawTitle;
            if (rawTitle && rawTitle.includes('survey.destinations.')) {
                // Translated Name + "Itinerary" 형태로 조합 (원하는 언어로 깔끔하게 노출)
                translatedTitle = t(rawTitle) + " " + (t('marketplace.itinerary') || "Itinerary");
            } else if (!translatedTitle) {
                translatedTitle = "Travel Itinerary";
            }

            return {
                ...tmpl,
                image: getTemplateImage(tmpl), // DB에 있던 이미지 우선 시도
                fallbackImage: getFallbackImage(tmpl), // 로딩 실패 시 DB 이미지 무시하고 무조건 제공 이미지로 교체
                title: translatedTitle,
                creator: tmpl.creatorName || tmpl.creatorEmail || "Anonymous",
                avatar: tmpl.creatorAvatar || `https://i.pravatar.cc/150?u=${tmpl.creatorUid || tmpl.id}`
            };
        });
        return [...dbItems, ...MOCK_TEMPLATES];
    }, [dbTemplates, t]);

    const filteredTemplates = useMemo(() => {
        return ALL_TEMPLATES.filter(template => {
            const matchRegion = selectedRegion === "All" || template.region === selectedRegion;
            const matchBudget = selectedBudget === "All" || template.budget === selectedBudget;
            const matchCategory = selectedCategory === "All" || template.category === selectedCategory;
            return matchRegion && matchBudget && matchCategory;
        });
    }, [ALL_TEMPLATES, selectedRegion, selectedBudget, selectedCategory]);

    const handleBuyClick = (plan) => {
        if (!user) {
            if (window.confirm(t('marketplace.loginRequired'))) {
                navigate('/login');
            }
            return;
        }
        // 자신이 만든 템플릿은 구매창 없이 바로 열람
        if (plan.creatorUid === user.uid) {
            navigate(`/template/${plan.id}`, { state: { template: plan } });
            return;
        }
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handlePurchaseSuccess = async (purchasedPlan) => {
        if (!user || !purchasedPlan || processingRef.current) return;
        
        processingRef.current = true;
        const targetId = purchasedPlan.id;
        
        console.log("Purchase process started for:", targetId);
        
        try {
            // 1. 상태 업데이트 (즉시)
            setPurchasedIds(prev => [...prev, String(targetId)]);
            
            // 2. DB 기록 진행 (완료 대기)
            await recordPurchase(user.uid, purchasedPlan);
            console.log("DB Record success");

            // 3. 성공 알림 및 리다이렉트
            console.log('[Marketplace] Purchase success. Redirect timer started (3s fallback)...');
            setTimeout(() => {
                if (window.location.pathname !== '/mypage') {
                    console.log('[Marketplace] Fallback redirect executing...');
                    window.location.href = '/mypage';
                }
            }, 3000);

            // 성공 시 onClose 핸들러를 임시로 교체하여 수동 클릭 시 즉시 이동하게 함
            // (이 로직은 handlePurchaseSuccess 내부에서만 유효하게 처리하거나, Modal props를 통해 주입)
        } catch (err) {
            console.error('Error in handlePurchaseSuccess:', err);
            alert(t('payment.errorOccurred') || "An error occurred during purchase processing.");
        } finally {
            processingRef.current = false;
        }
    };

    const handleCardClick = (template) => {
        const templateIdStr = String(template.id);
        const isOwned = purchasedIds.includes(templateIdStr);
        const isCreator = user && template.creatorUid === user.uid;

        if (isOwned || isCreator) {
            navigate(`/template/${template.id}`, { state: { template } });
        } else {
            handleBuyClick(template);
        }
    };

    return (
        <div className="min-h-screen bg-[#111111] font-sans text-slate-100">
            <Navbar />

            {/* Header Area */}
            <div className="pt-28 pb-12 px-6 md:px-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-[#FF8A71]/20 to-[#FF6B9B]/20 blur-[120px] rounded-full pointer-events-none" />
                <h1 className="text-4xl md:text-6xl font-serif mb-4 text-white relative z-10 italic">
                    {t('marketplace.title') || "Discover Experiences"}
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto relative z-10 text-sm md:text-base">
                    {t('marketplace.subtitle') || "Explore hand-crafted itineraries curated by travel experts and wanderers."}
                </p>
            </div>

            {/* Main Layout */}
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 pb-24">
                
                {/* Top Pill-Shaped Filter Bar */}
                <div className="mb-10 w-full flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 bg-[#1E293B]/80 backdrop-blur-md p-2 rounded-full border border-[#334155] shadow-lg overflow-x-auto w-full md:w-auto hide-scrollbar">
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold tracking-wider transition-colors shrink-0 ${isFilterOpen ? 'bg-gradient-to-r from-[#FF8A71] to-[#FF6B9B] text-white' : 'text-slate-300 hover:bg-[#334155]'}`}
                        >
                            <Sliders size={16} /> {t('marketplace.filters')}
                        </button>
                        
                        <div className="h-6 w-px bg-[#334155] shrink-0" />
                        
                        {regions.slice(1).map(r => (
                            <button
                                key={r}
                                onClick={() => setSelectedRegion(r === selectedRegion ? "All" : r)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
                                    selectedRegion === r ? 'bg-white/10 text-white border border-white/20' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {t('regions.' + r)}
                            </button>
                        ))}
                    </div>
                    
                    <span className="text-slate-500 font-medium text-sm w-full text-right md:w-auto">
                        {t('marketplace.resultsCount', { count: filteredTemplates.length })}
                    </span>
                </div>

                {/* Collapsible Deep Filter Panel */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            className="bg-[#1E293B]/90 backdrop-blur-xl border border-[#334155] rounded-3xl p-6 md:p-8 mb-10 overflow-hidden shadow-2xl"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">{t('marketplace.region')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {regions.map(r => (
                                            <button 
                                                key={r}
                                                onClick={() => setSelectedRegion(r)}
                                                className={`px-4 py-2 rounded-lg text-sm border font-medium transition-all ${selectedRegion === r ? 'border-[#FF8A71] bg-[#FF8A71]/10 text-[#FF8A71]' : 'border-[#334155] text-slate-300 hover:bg-[#334155]'}`}
                                            >
                                                {t('regions.' + r)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">{t('marketplace.theme')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(c => (
                                            <button 
                                                key={c}
                                                onClick={() => setSelectedCategory(c)}
                                                className={`px-4 py-2 rounded-lg text-sm border font-medium transition-all ${selectedCategory === c ? 'border-[#FF8A71] bg-[#FF8A71]/10 text-[#FF8A71]' : 'border-[#334155] text-slate-300 hover:bg-[#334155]'}`}
                                            >
                                                {t('categories.' + c)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">{t('marketplace.budget')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {budgets.map(b => (
                                            <button 
                                                key={b}
                                                onClick={() => setSelectedBudget(b)}
                                                className={`px-4 py-2 rounded-lg text-sm border font-medium transition-all ${selectedBudget === b ? 'border-[#FF8A71] bg-[#FF8A71]/10 text-[#FF8A71]' : 'border-[#334155] text-slate-300 hover:bg-[#334155]'}`}
                                            >
                                                {t('budgets.' + b)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grouped Grid Layout */}
                <div className="space-y-16">
                    {regions.filter(r => selectedRegion === "All" || r === selectedRegion).map(regionName => {
                        if (regionName === "All") return null;
                        
                        const templatesInRegion = filteredTemplates.filter(t => t.region === regionName);
                        if (templatesInRegion.length === 0) return null;

                        return (
                            <section key={regionName} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl md:text-3xl font-serif italic text-white shrink-0">
                                        {t('regions.' + regionName)}
                                    </h2>
                                    <div className="h-px bg-gradient-to-r from-[#334155] to-transparent flex-1" />
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {isLoading ? (
                                        Array.from({ length: 4 }).map((_, idx) => <SkeletonCard key={`skel-${regionName}-${idx}`} />)
                                    ) : (
                                        templatesInRegion.map((template) => (
                                            <motion.div 
                                                key={template.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4 }}
                                                className="group bg-[#1E293B]/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-[#334155]/60 hover:border-[#FF8A71]/50 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-15px_rgba(255,138,113,0.3)] cursor-pointer"
                                                onClick={() => handleCardClick(template)}
                                            >
                                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
                                                    <img 
                                                        src={template.image} 
                                                        alt={template.title} 
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            // 로딩 실패 시 이미 검증된 fallbackImage로 확실하게 교체
                                                            e.target.src = template.fallbackImage;
                                                        }}
                                                    />
                                                    <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start">
                                                        <div className="flex flex-col gap-1.5">
                                                            {template.tags && template.tags.map(tag => {
                                                                // 태그가 'survey.destinations.xxx' 인 경우의 다국어 처리
                                                                let displayTag = tag;
                                                                if (tag.includes('survey.')) {
                                                                    displayTag = t(tag);
                                                                } else {
                                                                    displayTag = t('tags.' + tag, { defaultValue: tag });
                                                                }
                                                                return (
                                                                    <span key={tag} className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-sm border border-white/10 w-max">
                                                                        {displayTag}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="bg-[#111111]/80 backdrop-blur-md px-2.5 py-1 flex items-center gap-1 rounded-lg text-xs font-bold text-white shadow-sm border border-white/10">
                                                            <Star size={12} className="text-[#FF8A71] fill-[#FF8A71]" />
                                                            {template.rating} 
                                                            <span className="text-slate-400 font-normal">({template.reviews})</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-5 flex flex-col flex-1 relative">
                                                    <div className="absolute -top-6 right-5 border-[3px] border-[#1E293B] rounded-full overflow-hidden w-12 h-12 shadow-lg bg-slate-800">
                                                        <img src={template.avatar} alt={template.creator} className="w-full h-full object-cover" />
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-2">
                                                        <MapPin size={12} className="text-[#FF8A71]" /> {t('regions.' + template.region)}
                                                        <span className="text-slate-600">•</span>
                                                        {t('budgets.' + template.budget)}
                                                    </div>
                                                    
                                                    <h3 className="text-lg font-bold text-white mb-1 leading-snug pr-8 line-clamp-2">{template.title}</h3>
                                                    <p className="text-slate-400 text-xs font-medium mb-5">{template.creator}</p>
                                                    
                                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#334155]/60">
                                                        <div className="text-xl font-bold bg-gradient-to-r from-[#FF8A71] to-[#FF6B9B] bg-clip-text text-transparent">
                                                            ${template.price}
                                                        </div>
                                                        
                                                        {/* 자신이 만든 템플릿: MY TEMPLATE 배지 */}
                                                        {user && template.creatorUid === user.uid ? (
                                                            <div className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-400/20 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1">
                                                                <CheckCircle2 size={14} /> My Template
                                                            </div>
                                                        ) : purchasedIds.includes(String(template.id)) ? (
                                                            <div className="px-4 py-1.5 bg-[#FF8A71]/10 text-[#FF8A71] border border-[#FF8A71]/20 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1">
                                                                <CheckCircle2 size={14} /> {t('marketplace.owned')}
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleBuyClick(template); }}
                                                                className="px-4 py-1.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors duration-300 group-hover:border-[#FF8A71]/50 group-hover:text-[#FF8A71]"
                                                            >
                                                                {t('marketplace.buyTemplate')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </section>
                        );
                    })}

                    {!isLoading && filteredTemplates.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-[#1E293B] flex items-center justify-center mx-auto mb-4">
                                <Search className="text-slate-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('marketplace.noMatches')}</h3>
                            <p className="text-slate-400 mb-6">{t('marketplace.noMatchesDesc')}</p>
                            <button 
                                onClick={() => { setSelectedRegion('All'); setSelectedBudget('All'); setSelectedCategory('All'); }}
                                className="px-6 py-2 rounded-full border border-[#FF8A71] text-[#FF8A71] font-bold tracking-wide hover:bg-[#FF8A71]/10 transition-colors"
                            >
                                {t('marketplace.clearFilters')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 결제 모달 */}
            {selectedPlan && (
                <PaymentModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        // 만약 결제가 성공한 상태에서 닫기를 누르면(버튼 클릭 포함), 리다이렉트 타이머를 기다리지 않고 즉시 이동
                        const isPaid = purchasedIds.includes(String(selectedPlan.id));
                        if (isPaid) {
                            navigate(`/template/${selectedPlan.id}`, { 
                                state: { template: selectedPlan },
                                replace: true 
                            });
                        }
                        setIsModalOpen(false);
                    }}
                    plan={selectedPlan}
                    user={user}
                    onSuccess={handlePurchaseSuccess}
                />
            )}
        </div>
    );
};

export default Marketplace;
