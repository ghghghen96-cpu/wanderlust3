import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, ArrowRight, Compass, Sparkles, Sliders, CheckCircle2, Star, BadgeCheck, DollarSign, Brain, Map, Store } from 'lucide-react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';
import { auth, listenToUserEarnings, updateCreatorEarnings, requestPayout } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import PayoutModal from '../components/PayoutModal';
import ExternalPlaceImage from '../components/ExternalPlaceImage';
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
                    <ExternalPlaceImage
                        initialUrl={slide.image}
                        placeName={t(slide.locKey)}
                        className="w-full h-full object-cover"
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

    // AI Demo States
    const [aiStyle, setAiStyle] = useState('healing');
    const [aiDays, setAiDays] = useState('3');
    const [isGenerating, setIsGenerating] = useState(false);

    // Simulator States
    const [simPrice, setSimPrice] = useState(25);
    const [simVolume, setSimVolume] = useState(50);
    const estimatedIncome = Math.round(simPrice * simVolume * 0.8); // 80% payout
    const [displayIncome, setDisplayIncome] = useState(0);

    useEffect(() => {
        const controls = animate(displayIncome, estimatedIncome, {
            duration: 0.8,
            ease: "easeOut",
            onUpdate(value) {
                setDisplayIncome(Math.round(value));
            }
        });
        return () => controls.stop();
    }, [estimatedIncome]);

    const handleGenerateMock = () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 3000);
    };

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop",
            locKey: "landing.locParis"
        },
        {
            image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1600&auto=format&fit=crop",
            locKey: "landing.locSantorini"
        },
        {
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
            locKey: "landing.locMaldives"
        },
        {
            image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1600&auto=format&fit=crop",
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

            {/* ── Section 2: 3-Step Guide ── */}
            <section className="bg-stone-900 py-32 px-8 border-b border-stone-800 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800 text-stone-300 text-xs font-bold tracking-[0.2em] uppercase mb-8 rounded-full border border-stone-700">
                            <Sparkles size={12} className="text-amber-500" />
                            {t('landing.howItWorks')}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif italic mb-6 leading-tight text-white">
                            {t('landing.threeStepsTitle')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {[
                            { step: "01", icon: <Brain size={32} className="text-amber-500" />, title: t('landing.step1Title'), desc: t('landing.step1Desc') },
                            { step: "02", icon: <Map size={32} className="text-amber-500" />, title: t('landing.step2Title'), desc: t('landing.step2Desc') },
                            { step: "03", icon: <Store size={32} className="text-amber-500" />, title: t('landing.step3Title'), desc: t('landing.step3Desc') }
                        ].map((item, idx) => (
                            <div key={idx} className="group relative p-1 rounded-3xl bg-gradient-to-b from-stone-800 to-stone-900 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="absolute -inset-2 bg-amber-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
                                <div className="relative h-full bg-stone-900 rounded-[1.4rem] p-10 flex flex-col items-start border border-stone-800 group-hover:border-stone-700 transition-colors">
                                    <div className="text-5xl font-serif italic text-stone-800 mb-8 font-black select-none">{item.step}</div>
                                    <div className="mb-6 p-4 bg-stone-800 rounded-2xl group-hover:scale-110 transition-transform duration-500 border border-stone-700/50">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4 leading-snug">{item.title}</h3>
                                    <p className="text-stone-400 font-light leading-relaxed text-[15px]">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Section 3: Monetization Simulator ── */}
            <section className="bg-black py-40 px-8 relative">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1 space-y-12">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-8 rounded-full border border-amber-500/20">
                                <DollarSign size={12} />
                                {t('landing.earnLabel') || "Monetization"}
                            </div>
                            <h2 className="text-4xl md:text-6xl font-serif italic mb-6 leading-tight text-white tracking-tight">
                                {t('landing.earnTitle')}
                            </h2>
                            <p className="text-xl text-stone-400 font-light leading-relaxed">
                                {t('landing.earnDesc')}
                            </p>
                        </div>

                        <div className="space-y-10 bg-stone-900 p-10 rounded-3xl border border-stone-800 shadow-2xl">
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">{t('landing.pricePerItinerary')}</label>
                                    <span className="text-amber-500 font-bold font-serif text-xl">${simPrice}</span>
                                </div>
                                <input 
                                    type="range" min="5" max="50" step="1" 
                                    value={simPrice} 
                                    onChange={(e) => setSimPrice(Number(e.target.value))}
                                    className="w-full h-3 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">{t('landing.expectedSales')}</label>
                                    <span className="text-amber-500 font-bold font-serif text-xl">{simVolume} {t('landing.buys')}</span>
                                </div>
                                <input 
                                    type="range" min="10" max="500" step="5" 
                                    value={simVolume} 
                                    onChange={(e) => setSimVolume(Number(e.target.value))}
                                    className="w-full h-3 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-12 relative group w-full">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-orange-500/20 to-transparent rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative text-center w-full">
                            <h3 className="text-stone-500 text-sm font-bold tracking-[0.3em] uppercase mb-6">{t('landing.estimatedIncome')}</h3>
                            <div className="text-[5rem] md:text-[8rem] font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-500 to-orange-500 leading-none drop-shadow-2xl">
                                $\{displayIncome.toLocaleString()}
                            </div>
                            <p className="mt-8 text-stone-400 text-[15px] font-sans">{t('landing.payoutNote')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 4: Curated Experiences (Interactive Gallery) ── */}
            <section className="bg-stone-950 py-40 px-8 md:px-16 border-t border-stone-800 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-serif mb-6 text-white">{t('landing.curatedTitle')}</h2>
                        <div className="w-16 h-[1px] bg-stone-700 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: t('landing.experience1Title'), image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop", desc: t('landing.experience1Desc') },
                            { title: t('landing.experience2Title'), image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=800&auto=format&fit=crop", desc: t('landing.experience2Desc') },
                            { title: t('landing.experience3Title'), image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop", desc: t('landing.experience3Desc') }
                        ].map((item, idx) => (
                            <div key={idx} className="group cursor-pointer" onClick={() => navigate('/survey')}>
                                <div className="aspect-[4/5] overflow-hidden mb-8 relative rounded-2xl shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 z-10" />
                                    <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                                    <ExternalPlaceImage
                                        initialUrl={item.image}
                                        placeName={item.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl z-20 pointer-events-none group-hover:ring-amber-500/30 transition-colors duration-700" />
                                    
                                    <div className="absolute bottom-8 left-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-30">
                                        <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                            <span className="w-8 h-[1px] bg-amber-500" />
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500">{t('landing.generateNow')}</span>
                                        </div>
                                        <h3 className="text-4xl font-serif italic group-hover:text-amber-400 transition-colors duration-500">{item.title}</h3>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <p className="text-[17px] font-sans text-stone-400 tracking-wide font-light leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA Section ── */}
            <section className="relative py-40 px-8 overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/20 rounded-full blur-3xl mix-blend-overlay"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl mix-blend-overlay"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl md:text-7xl font-serif italic text-stone-900 mb-8 leading-tight tracking-tight drop-shadow-sm">
                        {t('landing.finalCtaTitle')}
                    </h2>
                    <p className="text-xl text-stone-900/80 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        {t('landing.finalCtaDesc')}
                    </p>
                    <button
                        onClick={() => navigate('/survey')}
                        className="px-12 py-5 bg-stone-900 hover:bg-black text-amber-400 font-bold text-lg tracking-wide rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-stone-900/30 flex items-center justify-center gap-3 mx-auto"
                    >
                        {t('landing.ctaSmall')}
                        <ArrowRight size={20} />
                    </button>
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
