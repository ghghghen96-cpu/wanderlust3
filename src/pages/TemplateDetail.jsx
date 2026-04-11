import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Star, Calendar, Clock, Compass, Tag, BedDouble, Plane } from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MOCK_TEMPLATES } from '../data/marketplaceData';

const TemplateDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [template, setTemplate] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const loadTemplate = async () => {
            if (location.state && location.state.template) {
                setTemplate(location.state.template);
            } else if (id) {
                // state가 없는 경우 Firestore에서 직접 조회 (새로고침 대응)
                setIsFetching(true);
                try {
                    // 1. Marketplace_Templates에서 조회
                    const docRef = doc(db, "Marketplace_Templates", id);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        setTemplate({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        // 2. Firestore에 없다면 로컬 MOCK_TEMPLATES에서 검색 (테스트용 템플릿 대응)
                        const mockItem = MOCK_TEMPLATES.find(t => t.id.toString() === id.toString());
                        if (mockItem) {
                            setTemplate(mockItem);
                        } else {
                            console.warn("No such template in Marketplace or MOCK data!");
                            navigate('/marketplace');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching template:", error);
                    // 에러 발생 시에도 일단 목업에서 찾아봄
                    const mockItem = MOCK_TEMPLATES.find(t => t.id.toString() === id.toString());
                    if (mockItem) {
                        setTemplate(mockItem);
                    } else {
                        navigate('/marketplace');
                    }
                } finally {
                    setIsFetching(false);
                }
            } else {
                navigate('/marketplace');
            }
        };

        loadTemplate();
    }, [id, location.state, navigate]);

    if (isFetching || !template) {
        return (
            <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8A71]"></div>
                <p className="text-slate-400 animate-pulse">{t('marketplace.loading') || 'Loading template...'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafaf9] font-sans">
            <Navbar />
            
            {/* Header Hero Section */}
            <div className="relative pt-24 pb-16 px-6 md:px-12 bg-gradient-to-br from-[#1c1917] to-[#44403c] text-white">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
                        >
                            <ArrowLeft size={16} /> {t('survey.back')}
                        </button>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-4 text-xs font-bold tracking-widest uppercase">
                            <MapPin size={12} className="text-[#FBBF24]" /> {t(`regions.${template.region}`, { defaultValue: template.region })}
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-serif italic mb-4 leading-tight">
                            {template.title}
                        </h1>
                        
                        <p className="text-white/70 text-lg mb-6 max-w-2xl leading-relaxed">
                            {template.description || t('myPage.historySubtitle')}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="text-white/50">{t('itinerary.from')}</span>
                                <span className="font-bold text-[#FBBF24]">{template.creator || t('myPage.traveler')}</span>
                            </div>
                            {template.budget && (
                                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                                    <span className="text-white/50">{t('marketplace.budget')}:</span>
                                    <span className="font-bold">{t(`budgets.${template.budget}`, { defaultValue: template.budget })}</span>
                                </div>
                            )}
                            {template.category && (
                                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                                    <span className="text-white/50">{t('landing.earnCategory')}:</span>
                                    <span className="font-bold">
                                        {t(`categories.${template.category}`, { defaultValue: template.category })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
                <div className="bg-white rounded-3xl shadow-sm border border-[#e7e5e4] p-8 md:p-12">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#e7e5e4]">
                        <h2 className="text-2xl font-serif italic text-[#1c1917]">{t('itinerary.journeyOverview')}</h2>
                    </div>
                    
                    {template.itinerary && template.itinerary.length > 0 ? (
                        <div className="space-y-12">
                            {template.itinerary.map((dayPlan, index) => (
                                <div key={index} className="relative">
                                    <h3 className="text-xl font-bold text-[#1c1917] mb-6 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 text-[#000] flex items-center justify-center font-bold">
                                            {dayPlan.dayNum}
                                        </div>
                                        {t('itinerary.dayLabel')} {dayPlan.dayNum} - {dayPlan.theme || t('itinerary.themeDefault')}
                                    </h3>
                                    
                                    <div className="space-y-4 pl-5 border-l-2 border-[#e7e5e4] ml-5">
                                        {dayPlan.items && dayPlan.items.length > 0 ? (
                                            dayPlan.items.map((item, idx) => (
                                                <div key={item.id || idx} className="relative pl-6 pb-2">
                                                    <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-[#FF8A71]" />
                                                    <div className="bg-[#f5f5f5] rounded-2xl p-5 border border-[#e7e5e4]">
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <h4 className="font-bold text-lg text-[#1c1917]">{item.name}</h4>
                                                            <span className="text-sm font-bold text-[#000] bg-[#FBBF24] px-2.5 py-1 rounded-lg">
                                                                {item.time || "--:--"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[#78716c] mb-3">{item.desc}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#a8a29e] bg-white border border-[#e7e5e4] px-2 py-1 rounded-md">
                                                                {item.type || t('itinerary.colActivity')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="pl-6 text-sm text-[#a8a29e] italic">{t('itinerary.emptyActs')}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400 italic">
                            {t('itinerary.emptyActs') || 'No itinerary data available for this template.'}
                        </div>
                    )}
                </div>

                {/* 하단 CTA 섹션 */}
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-serif italic mb-4 text-[#1c1917]">
                        {t('itinerary.readyToWander') || 'Ready to start your own journey?'}
                    </h3>
                    <p className="text-[#44403c]/60 max-w-lg mx-auto mb-8 text-sm">
                        {t('itinerary.readySubtitle') || 'Create a personalized travel plan designed just for you with our AI.'}
                    </p>
                    <button 
                        onClick={() => navigate('/survey')}
                        className="px-8 py-3 bg-[#1c1917] text-white font-bold rounded-xl hover:bg-[#FF8A71] transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-[#FF8A71]/20"
                    >
                        {t('landing.heroButton') || t('nav.createTrip')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateDetail;
