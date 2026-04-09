import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, ArrowRight, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import { auth, listenToUserEarnings, updateCreatorEarnings, requestPayout } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import PayoutModal from '../components/PayoutModal';
// ─── 히어로 섹션 ──────────────────────────────────────────────────
const HeroSection = ({ slides, currentSlide, setCurrentSlide }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <section style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
            {/* ── 배경 슬라이드쇼 ── */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute', inset: 0,
                        transition: 'opacity 2s ease-in-out',
                        opacity: index === currentSlide ? 1 : 0,
                        zIndex: index === currentSlide ? 1 : 0,
                    }}
                >
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.65) 100%)',
                        zIndex: 2
                    }} />
                    <img
                        src={slide.image}
                        alt={t(slide.locKey)}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transform: index === currentSlide ? 'scale(1.08)' : 'scale(1)',
                            transition: 'transform 8s ease-out'
                        }}
                    />
                </div>
            ))}

            {/* ── 중앙 콘텐츠 ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', textAlign: 'center', padding: '0 24px'
            }}>
                {/* 위쪽 소제목 */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    color: 'rgba(255,255,255,0.65)', fontSize: '12px',
                    letterSpacing: '0.4em', textTransform: 'uppercase',
                    marginBottom: '28px', fontFamily: 'sans-serif'
                }}>
                    <Compass size={13} color="#FBBF24" />
                    <span>{t('landing.subtitle')}</span>
                </div>

                {/* 세련된 WanderLust 로고 */}
                <div style={{ marginBottom: '10px' }}>
                    <h1 style={{
                        fontSize: 'clamp(52px, 10vw, 120px)',
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontStyle: 'italic',
                        fontWeight: 'bold',
                        color: 'transparent',
                        background: 'linear-gradient(135deg, #ffffff 0%, #e8d5b7 50%, #ffffff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        textShadow: 'none',
                        filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))',
                        marginBottom: '0px',
                    }}>
                        WanderLust
                    </h1>
                    {/* 로고 아래 황금 라인 */}
                    <div style={{
                        height: '2px',
                        background: 'linear-gradient(to right, transparent, #FBBF24, transparent)',
                        margin: '10px auto 0',
                        width: '60%',
                    }} />
                </div>

                {/* 태그라인 */}
                <p style={{
                    color: 'rgba(255,255,255,0.8)', fontSize: '16px',
                    fontFamily: 'sans-serif', fontWeight: 300,
                    marginBottom: '18px', letterSpacing: '0.15em',
                    textTransform: 'uppercase'
                }}>
                    {t('landing.tagline')}
                </p>

                {/* 서브 설명 */}
                <p style={{
                    color: 'rgba(255,255,255,0.65)', fontSize: '17px',
                    fontFamily: 'sans-serif', fontWeight: 300,
                    marginBottom: '52px', maxWidth: '520px', lineHeight: 1.7
                }}>
                    {t('landing.description')}
                </p>

                {/* CTA 버튼 */}
                <button
                    onClick={() => navigate('/survey')}
                    className="
                        px-8 py-5 md:px-16 md:py-8 
                        bg-white/10 backdrop-blur-md 
                        border-[1.5px] border-white/50 rounded-full 
                        cursor-pointer flex items-center justify-center gap-3 md:gap-4 
                        transition-all duration-300 shadow-xl
                        hover:bg-white/20 hover:border-amber-400 hover:shadow-2xl hover:-translate-y-1
                    "
                >
                    <span className="text-white text-xl sm:text-2xl md:text-4xl lg:text-[36px] font-bold font-serif tracking-widest uppercase whitespace-nowrap">
                        {t('landing.ctaBig')}
                    </span>
                    <ArrowRight className="w-5 h-5 md:w-8 md:h-8 text-white" />
                </button>

                {/* 위치 태그 */}
                <div style={{
                    marginTop: '52px',
                    color: 'rgba(255,255,255,0.45)', fontSize: '12px',
                    fontFamily: 'sans-serif', letterSpacing: '0.25em', textTransform: 'uppercase'
                }}>
                    {t(slides[currentSlide]?.locKey)}
                </div>
            </div>

            {/* 슬라이드 인디케이터 */}
            <div style={{
                position: 'absolute', bottom: '40px', left: '50%',
                transform: 'translateX(-50%)', zIndex: 10,
                display: 'flex', gap: '12px'
            }}>
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        style={{
                            height: '2px', border: 'none', cursor: 'pointer',
                            borderRadius: '9999px', background: 'white',
                            opacity: idx === currentSlide ? 1 : 0.3,
                            width: idx === currentSlide ? '56px' : '24px',
                            transition: 'all 0.4s', padding: 0
                        }}
                    />
                ))}
            </div>
        </section>
    );
};

// ─── 메인 랜딩 컴포넌트 ───────────────────────────────────────────
const Landing = () => {
    const { t } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);

    // 사용자 수익 상태
    const [earnings, setEarnings] = useState({
        currentBalance: 0,
        totalEarnings: 0,
        templatesSold: 0
    });

    // Travel-to-Earn Form States
    const [selectedPlan, setSelectedPlan] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    // Payout Modal State
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

    const handlePayoutConfirm = async (balance, bankInfo) => {
        if (!auth.currentUser) return;
        try {
            await requestPayout(auth.currentUser.uid, balance, bankInfo);
            // Local state is updated via listenToUserEarnings automatically!
        } catch (error) {
            console.error("Payout error", error);
            throw error;
        }
    };

    const mockPlans = [
        { id: 'p1', title: t('landing.mockPlan1') },
        { id: 'p2', title: t('landing.mockPlan2') },
        { id: 'p3', title: t('landing.mockPlan3') }
    ];

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!selectedPlan || !price || !category) return;
        setIsPublishing(true);
        setTimeout(async () => {
            setIsPublishing(false);
            setIsPublished(true);
            
            // 데모용으로 Publish 시 수익을 즉시 반영하여 실시간 업데이트 시연
            if (auth.currentUser) {
                await updateCreatorEarnings(auth.currentUser.uid, parseFloat(price));
            }

            setTimeout(() => {
                setIsPublished(false);
                setSelectedPlan('');
                setPrice('');
                setDescription('');
                setCategory('');
            }, 3000);
        }, 1500);
    };

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
            locKey: "landing.locParis"
        },
        {
            image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2074&auto=format&fit=crop",
            locKey: "landing.locSantorini"
        },
        {
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
            locKey: "landing.locMaldives"
        },
        {
            image: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?q=80&w=2067&auto=format&fit=crop",
            locKey: "landing.locNYC"
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let unsubscribeEarnings = null;
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                unsubscribeEarnings = listenToUserEarnings(user.uid, (data) => {
                    setEarnings(data);
                });
            } else {
                setEarnings({ currentBalance: 0, totalEarnings: 0, templatesSold: 0 });
                if (unsubscribeEarnings) {
                    unsubscribeEarnings();
                    unsubscribeEarnings = null;
                }
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeEarnings) unsubscribeEarnings();
        };
    }, []);

    return (
        <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', color: 'white' }}>
            <Navbar />

            <HeroSection
                slides={slides}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
            />

            {/* ── Travel-to-Earn Section ── */}
            <section className="bg-stone-50 text-stone-900 py-40 px-8 md:px-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold tracking-[0.2em] uppercase mb-8">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            {t('landing.earnLabel')}
                        </div>
                        <h2 className="text-5xl md:text-7xl font-serif italic mb-10 leading-tight">
                            {t('landing.earnTitle1')} <br /> 
                            <span style={{ 
                                background: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {t('landing.earnTitle2')}
                            </span>
                        </h2>
                        <div className="space-y-8 border-l-[3px] border-amber-200 pl-8 mb-10">
                            <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-light break-keep">
                                {t('landing.earnDesc1')}
                            </p>
                            <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-light break-keep">
                                {t('landing.earnDesc2')}
                            </p>
                        </div>
                    </div>
                    
                    {/* Interactive Publish Form & Dashboard */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-amber-200 to-orange-300 blur-2xl opacity-40 rounded-full"></div>
                        
                        <div className="relative bg-white border border-stone-100 shadow-2xl rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-500">
                            {/* Dashboard Metrics Header */}
                            <div className="p-6 md:p-8 border-b border-stone-50 bg-[#FAF9F6]">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{t('landing.earnTag')}</p>
                                        <h3 className="text-xl font-serif italic text-stone-800">@creator_dashboard</h3>
                                    </div>
                                    <div className="bg-green-50 text-emerald-600 border border-green-100 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        {t('dashboard.active')}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-stone-500 mb-1">Current Balance</p>
                                        <div className="flex flex-col items-start gap-1.5">
                                            <span className="text-2xl font-bold font-serif text-amber-600">${(earnings?.currentBalance || 0).toLocaleString()}</span>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); setIsPayoutModalOpen(true); }}
                                                disabled={(earnings?.currentBalance || 0) < 50}
                                                className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md transition-all ${
                                                    (earnings?.currentBalance || 0) >= 50 
                                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer shadow-sm border border-amber-200' 
                                                        : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                                                }`}
                                            >
                                                Payout Ready
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-stone-500 mb-1">{t('landing.earnMetric1')}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold font-serif text-stone-900">${(earnings?.totalEarnings || 0).toLocaleString()}</span>
                                            <span className="text-[10px] text-green-500 font-semibold bg-green-50 px-1 py-0.5 rounded">+12%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-stone-500 mb-1">{t('landing.earnMetric2')}</p>
                                        <span className="text-2xl font-bold font-serif text-stone-900">{earnings?.templatesSold || 0}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Registration Form */}
                            <form onSubmit={handlePublish} className="p-6 md:p-8 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t('landing.earnSelectPlan')}</label>
                                    <select 
                                        className="w-full p-3 border border-stone-200 rounded-lg text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                        value={selectedPlan}
                                        onChange={(e) => setSelectedPlan(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>{t('dashboard.itineraryPlaceholder')}</option>
                                        {mockPlans.map(plan => (
                                            <option key={plan.id} value={plan.id}>{plan.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t('landing.earnPrice')}</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full p-3 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                            placeholder={t('landing.earnPricePlaceholder')}
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t('landing.earnCategory')}</label>
                                        <select 
                                            className="w-full p-3 border border-stone-200 rounded-lg text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>{t('dashboard.categoryPlaceholder')}</option>
                                            <option value="couple">{t('landing.earnCatCouple')}</option>
                                            <option value="family">{t('landing.earnCatFamily')}</option>
                                            <option value="solo">{t('landing.earnCatSolo')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t('landing.earnFormDesc')}</label>
                                    <textarea 
                                        rows="2"
                                        className="w-full p-3 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                                        placeholder={t('landing.earnDescPlaceholder')}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isPublishing || isPublished}
                                    className={`w-full py-4 rounded-lg text-center font-bold text-white tracking-widest uppercase transition-all duration-300 ${
                                        isPublished ? 'bg-emerald-500 hover:bg-emerald-600' :
                                        isPublishing ? 'bg-amber-400 cursor-not-allowed' :
                                        'bg-stone-900 hover:bg-amber-500 shadow-md hover:shadow-xl'
                                    }`}
                                >
                                    {isPublished ? (
                                        <span className="flex items-center justify-center gap-2">✓ {t('landing.earnSuccess')}</span>
                                    ) : isPublishing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t('landing.earnPublishing')}
                                        </span>
                                    ) : (
                                        t('landing.earnPublishBtn')
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Curated Experiences ── */}
            <section className="bg-white py-40 px-8 md:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-serif mb-6 text-gray-900">{t('landing.curatedTitle')}</h2>
                        <div className="w-16 h-[1px] bg-stone-300 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: t('landing.experience1Title'), image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=800", desc: t('landing.experience1Desc') },
                            { title: t('landing.experience2Title'), image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800", desc: t('landing.experience2Desc') },
                            { title: t('landing.experience3Title'), image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800", desc: t('landing.experience3Desc') }
                        ].map((item, idx) => (
                            <div key={idx} className="group cursor-pointer">
                                <div className="aspect-[4/5] overflow-hidden mb-8 relative shadow-lg rounded-sm">
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                                        <div className="border border-white/50 rounded-full px-5 py-2 text-xs uppercase tracking-widest backdrop-blur-sm">{t('landing.explore')}</div>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-serif italic mb-3 group-hover:text-amber-600 transition-colors text-gray-900">{item.title}</h3>
                                <p className="text-lg font-sans text-stone-500 tracking-wide font-light">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-stone-900 text-stone-400 border-t border-stone-800">
                <div className="max-w-7xl mx-auto px-8 md:px-16 py-16">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        {/* 브랜드 */}
                        <div>
                            <div className="font-serif italic text-3xl text-stone-200 mb-2">WanderLust.</div>
                            <p className="text-sm font-sans text-stone-500 max-w-xs leading-relaxed">
                                {t('landing.footerDesc')}
                            </p>
                        </div>

                        {/* 링크 그룹 */}
                        <div className="flex flex-wrap gap-x-12 gap-y-4">
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500 font-sans">{t('landing.footerCompany')}</span>
                                <a href="/about" className="text-sm font-sans text-stone-400 hover:text-white transition-colors cursor-pointer">{t('landing.footerAbout')}</a>
                                <a href="/contact" className="text-sm font-sans text-stone-400 hover:text-white transition-colors cursor-pointer">{t('landing.footerContact')}</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500 font-sans">{t('landing.footerLegal')}</span>
                                <a href="/privacy" className="text-sm font-sans text-stone-400 hover:text-white transition-colors cursor-pointer">{t('landing.footerPrivacy')}</a>
                                <a href="/terms" className="text-sm font-sans text-stone-400 hover:text-white transition-colors cursor-pointer">{t('landing.footerTerms')}</a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-stone-800 text-center">
                        <div className="text-xs tracking-widest uppercase opacity-50 font-sans">
                            {t('dashboard.copyright')}
                        </div>
                    </div>
                </div>
            </footer>

            <PayoutModal 
                isOpen={isPayoutModalOpen}
                onClose={() => setIsPayoutModalOpen(false)}
                balance={earnings?.currentBalance || 0}
                onConfirm={handlePayoutConfirm}
            />
        </div>
    );
};

export default Landing;
