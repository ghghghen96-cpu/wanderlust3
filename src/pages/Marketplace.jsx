import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import PaymentModal from '../components/PaymentModal';
import { Star, MapPin, SlidersHorizontal, CheckCircle2, Sliders, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, getUserPurchases, recordPurchase, getMarketplaceTemplates } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Mock Data
const MOCK_TEMPLATES = [
    {
        id: 1,
        title: "Santorini 4 Days Romance & Wine",
        creator: "@wanderlust_sarah",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        rating: 4.9,
        reviews: 128,
        price: 9.99,
        region: "Europe",
        budget: "Luxury",
        category: "Couple",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop",
        tags: ["Best Seller", "Couple"],
        itinerary: [
            { dayNum: 1, theme: "Arrival & Sunset Wine", items: [{ name: "Oia Sunset View", desc: "Enjoy the world-famous sunset.", time: "18:00", type: "Sightseeing" }] },
            { dayNum: 2, theme: "Volcano Tour", items: [{ name: "Nea Kameni", desc: "Hike up the active volcano.", time: "10:00", type: "Activity" }] }
        ]
    },
    {
        id: 2,
        title: "Tokyo Local Food & Neon Lights",
        creator: "@foodie_jinny",
        avatar: "https://i.pravatar.cc/150?u=jinny",
        rating: 4.8,
        reviews: 94,
        price: 4.99,
        region: "Asia",
        budget: "Moderate",
        category: "Solo",
        image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=800&auto=format&fit=crop",
        tags: ["Foodie"],
        itinerary: [
            { dayNum: 1, theme: "Neon Lights", items: [{ name: "Shinjuku Station", desc: "Explore the bustling station area.", time: "19:00", type: "Sightseeing" }] },
            { dayNum: 2, theme: "Local Food", items: [{ name: "Tsukiji Outer Market", desc: "Fresh sushi and street food.", time: "08:00", type: "Dining" }] }
        ]
    },
    {
        id: 3,
        title: "Bali Hidden Gems & Ocean Villas",
        creator: "@bali_vibes",
        avatar: "https://i.pravatar.cc/150?u=bali",
        rating: 4.7,
        reviews: 210,
        price: 12.50,
        region: "Asia",
        budget: "Budget",
        category: "Family",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop",
        tags: ["Family", "Hot"]
    },
    {
        id: 4,
        title: "Swiss Alps Solo Hiking Routes",
        creator: "@mountain_hiker",
        avatar: "https://i.pravatar.cc/150?u=hiker",
        rating: 5.0,
        reviews: 45,
        price: 15.00,
        region: "Europe",
        budget: "Luxury",
        category: "Solo",
        image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop",
        tags: ["Adventure"]
    },
    {
        id: 5,
        title: "NYC Weekend Architecture Getaway",
        creator: "@urban_traveler",
        avatar: "https://i.pravatar.cc/150?u=urban",
        rating: 4.6,
        reviews: 312,
        price: 7.99,
        region: "Americas",
        budget: "Moderate",
        category: "Couple",
        image: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?q=80&w=800&auto=format&fit=crop",
        tags: ["City"]
    },
    {
        id: 6,
        title: "Costa Rica Deep Nature Retreat",
        creator: "@eco_tours",
        avatar: "https://i.pravatar.cc/150?u=eco",
        rating: 4.9,
        reviews: 87,
        price: 11.99,
        region: "Americas",
        budget: "Moderate",
        category: "Family",
        image: "https://images.unsplash.com/photo-1518182170546-076616fdcd87?q=80&w=800&auto=format&fit=crop",
        tags: ["Nature", "Eco"]
    },
    {
        id: 7,
        title: "Kyoto Autumn Leaves & Temples",
        creator: "@zen_master",
        avatar: "https://i.pravatar.cc/150?u=zen",
        rating: 4.9,
        reviews: 145,
        price: 6.50,
        region: "Asia",
        budget: "Moderate",
        category: "Solo",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
        tags: ["Culture"]
    },
    {
        id: 8,
        title: "Maldives Honeymoon Overwater Cabin",
        creator: "@luxury_escapes",
        avatar: "https://i.pravatar.cc/150?u=lux",
        rating: 5.0,
        reviews: 212,
        price: 29.99,
        region: "Asia",
        budget: "Luxury",
        category: "Couple",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
        tags: ["Honeymoon", "Best Seller"]
    }
];

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
        const dbItems = dbTemplates.map(t => ({
            ...t,
            creator: t.creatorName || t.creatorEmail || "Anonymous",
            avatar: t.creatorAvatar || `https://i.pravatar.cc/150?u=${t.creatorUid || t.id}`
        }));
        return [...dbItems, ...MOCK_TEMPLATES];
    }, [dbTemplates]);

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

    const handlePurchaseSuccess = async (plan) => {
        if (!user) return;
        try {
            // 결제 성공 기록 (Firebase)
            await recordPurchase(user.uid, plan);
            
            // 타입 일치를 위해 모두 문자열로 저장
            setPurchasedIds(prev => [...prev, String(plan.id)]);
            
            // 모달을 성공적으로 닫고 상세 페이지로 이동
            setIsModalOpen(false);
            
            // 데이터 무결성을 위해 plan 객체를 다시 한번 체크하여 navigate
            const templateData = { ...plan };
            navigate(`/template/${plan.id}`, { 
                state: { template: templateData },
                replace: true // 뒤로 가기 시 결제 페이지가 아닌 목록으로 오도록 replace 사용 고려
            });
        } catch (error) {
            console.error("Purchase recording failed", error);
            alert(t('marketplace.purchaseError'));
            setIsModalOpen(false); // 에러 발생 시에도 일단 모달은 닫음
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
                                                    />
                                                    <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start">
                                                        <div className="flex flex-col gap-1.5">
                                                            {template.tags && template.tags.map(tag => (
                                                                <span key={tag} className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-sm border border-white/10 w-max">
                                                                    {t('tags.' + tag) || tag}
                                                                </span>
                                                            ))}
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

            {isModalOpen && selectedPlan && (
                <PaymentModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    plan={selectedPlan}
                    onSuccess={handlePurchaseSuccess}
                    user={user}
                />
            )}
        </div>
    );
};

export default Marketplace;
