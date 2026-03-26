import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, ArrowRight, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';

// ─── 히어로 섹션 ──────────────────────────────────────────────────
const HeroSection = ({ slides, currentSlide, setCurrentSlide }) => {
    const navigate = useNavigate();

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
                        alt={slide.location}
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
                    <span>AI-Powered Travel Planner</span>
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
                    Your world. Your journey. Your story.
                </p>

                {/* 서브 설명 */}
                <p style={{
                    color: 'rgba(255,255,255,0.65)', fontSize: '17px',
                    fontFamily: 'sans-serif', fontWeight: 300,
                    marginBottom: '52px', maxWidth: '520px', lineHeight: 1.7
                }}>
                    Tell us your travel DNA and we'll craft a 5-star itinerary tailored just for you.
                </p>

                {/* CTA 버튼 */}
                <button
                    onClick={() => navigate('/survey')}
                    style={{
                        padding: '28px 72px',
                        background: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(12px)',
                        border: '1.5px solid rgba(255,255,255,0.55)',
                        borderRadius: '60px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        gap: '14px', transition: 'all 0.3s',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
                        e.currentTarget.style.borderColor = 'rgba(255,215,0,0.8)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <span style={{
                        color: 'white', fontSize: '36px', fontWeight: '700',
                        fontFamily: 'Georgia, serif', letterSpacing: '0.12em',
                        textTransform: 'uppercase'
                    }}>
                        Plan My Adventure
                    </span>
                    <ArrowRight size={22} color="white" />
                </button>

                {/* 위치 태그 */}
                <div style={{
                    marginTop: '52px',
                    color: 'rgba(255,255,255,0.45)', fontSize: '12px',
                    fontFamily: 'sans-serif', letterSpacing: '0.25em', textTransform: 'uppercase'
                }}>
                    {slides[currentSlide]?.location}
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
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
            location: "Paris, France"
        },
        {
            image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2074&auto=format&fit=crop",
            location: "Santorini, Greece"
        },
        {
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
            location: "Maldives"
        },
        {
            image: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?q=80&w=2067&auto=format&fit=crop",
            location: "New York, USA"
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', color: 'white' }}>
            <Navbar />

            <HeroSection
                slides={slides}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
            />

            {/* ── Philosophy Section ── */}
            <section className="bg-stone-50 text-stone-900 py-40 px-8 md:px-16">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                    <div>
                        <span className="text-sm font-bold tracking-[0.3em] uppercase text-stone-400 mb-6 block">Our Philosophy</span>
                        <h2 className="text-5xl md:text-7xl font-serif italic mb-10 leading-tight">
                            "Not just a plan, <br /> but a <span className="text-stone-500">feeling.</span>"
                        </h2>
                        <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-light mb-10">
                            We believe travel shouldn't be about ticking boxes. It's about the morning mist in a mountain valley, the smell of street food in a bustling market, and the silence of a vast desert.
                        </p>
                        <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-light">
                            Our AI is designed to understand not just where you want to go, but <em>how you want to feel</em>. Let us handle the logistics so you can focus on the memories.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="aspect-[3/4] rounded-sm overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1000"
                                alt="Serene Lake"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1500ms]"
                            />
                        </div>
                        <div className="absolute -bottom-12 -left-12 bg-white p-10 shadow-2xl max-w-sm hidden md:block border border-gray-50">
                            <p className="font-serif italic text-2xl mb-4 text-gray-800">"The journey is the destination."</p>
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-stone-400">
                                <Sun size={16} /> Recommended by WanderLust
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Curated Experiences ── */}
            <section className="bg-white py-40 px-8 md:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-serif mb-6 text-gray-900">Curated Experiences</h2>
                        <div className="w-16 h-[1px] bg-stone-300 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: "Hidden Sanctuaries", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=800", desc: "Secret spots untouched by crowds." },
                            { title: "Culinary Journeys", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800", desc: "Tastes that define a culture." },
                            { title: "Urban Adventures", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800", desc: "The pulse of the world's greatest cities." }
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
                                        <div className="border border-white/50 rounded-full px-5 py-2 text-xs uppercase tracking-widest backdrop-blur-sm">Explore</div>
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
                                AI-powered travel planning for every kind of adventurer.
                            </p>
                        </div>

                        {/* 링크 그룹 */}
                        <div className="flex flex-wrap gap-x-12 gap-y-4">
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500 font-sans">Company</span>
                                <a href="/about" className="text-sm font-sans text-stone-400 hover:text-white transition-colors cursor-pointer">About</a>
                                <a href="/contact" className="text-sm font-sans text-stone-400 hover:text-white transition-colors cursor-pointer">Contact Us</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-bold tracking-[0.2em] uppercase text-stone-500 font-sans">Legal</span>
                                <a href="/privacy" className="text-sm font-sans text-stone-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
                                <a href="/terms" className="text-sm font-sans text-stone-400 hover:text-white transition-colors cursor-pointer">Terms of Service</a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-stone-800 text-center">
                        <div className="text-xs tracking-widest uppercase opacity-50 font-sans">
                            &copy; 2026 WanderLust AI. Crafted with Soul.
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Landing;
