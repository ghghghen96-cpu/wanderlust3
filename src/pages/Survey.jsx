import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Users, Calendar, Activity, Coffee, Mountain, Palmtree, Building2, Tent, Compass, Sparkles, ArrowRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import SurveyLayout from '../components/SurveyLayout';
import Card from '../components/Card';
import Slider from '../components/Slider';
import Navbar from '../components/Navbar';
import StatusStepBar from '../components/StatusStepBar';
import { DESTINATION_DATA } from '../data';
import ExternalPlaceImage from '../components/ExternalPlaceImage';

const SEASONAL_RECOMMENDATIONS = [
    { id: 'tokyo', cityKey: 'tokyo', countryKey: 'japan', imgId: 'photo-1528150177520-22129b481971', emoji: '🌸' },
    { id: 'amsterdam', cityKey: 'amsterdam', countryKey: 'netherlands', imgId: 'photo-1514936034176-a4f65345686d', emoji: '🌷' },
    { id: 'jeju', cityKey: 'jeju', countryKey: 'korea', imgId: 'photo-1544483389-947833f2cfdf', emoji: '🏝️' },
    { id: 'rome', cityKey: 'rome', countryKey: 'italy', imgId: 'photo-1552832230-c0197dd3ef1b', emoji: '🇮🇹' },
    { id: 'bangkok', cityKey: 'bangkok', countryKey: 'thailand', imgId: 'photo-1508009603885-50cf7c579367', emoji: '💦' },
];

const ALL_DESTINATIONS = [
    { id: 'tokyo', cityKey: 'tokyo', countryKey: 'japan', emoji: '🇯🇵', imgId: 'photo-1540959733332-eab4deabeeaf', climates: ['Urban'] },
    { id: 'kyoto', cityKey: 'kyoto', countryKey: 'japan', emoji: '🇯🇵', imgId: 'photo-1493976040374-85c8e12f0c0e', climates: ['Urban', 'Mediterranean'] },
    { id: 'osaka', cityKey: 'osaka', countryKey: 'japan', emoji: '🇯🇵', imgId: 'photo-1590559899731-a3826eb9a999', climates: ['Urban'] },
    { id: 'hokkaido', cityKey: 'hokkaido', countryKey: 'japan', emoji: '🇯🇵', imgId: 'photo-1504280390367-361c6d9f38f4', climates: ['Alpine'] },
    { id: 'seoul', cityKey: 'seoul', countryKey: 'korea', emoji: '🇰🇷', imgId: 'photo-1538481199705-c71044e826a1', climates: ['Urban'] },
    { id: 'busan', cityKey: 'busan', countryKey: 'korea', emoji: '🇰🇷', imgId: 'photo-1593026362758-c30c34533967', climates: ['Oceanic'] },
    { id: 'jeju', cityKey: 'jeju', countryKey: 'korea', emoji: '🏝️', imgId: 'photo-1544483389-947833f2cfdf', climates: ['Tropical', 'Oceanic'] },
    { id: 'paris', cityKey: 'paris', countryKey: 'france', emoji: '🇫🇷', imgId: 'photo-1502602898657-3e9172f29b78', climates: ['Urban'] },
    { id: 'nice', cityKey: 'nice', countryKey: 'france', emoji: '🇫🇷', imgId: 'photo-1533105079780-92b9be482077', climates: ['Mediterranean', 'Oceanic'] },
    { id: 'rome', cityKey: 'rome', countryKey: 'italy', emoji: '🇮🇹', imgId: 'photo-1552832230-c0197dd3ef1b', climates: ['Urban'] },
    { id: 'florence', cityKey: 'florence', countryKey: 'italy', emoji: '🇮🇹', imgId: 'photo-1543428802-b95669bfe35a', climates: ['Urban'] },
    { id: 'barcelona', cityKey: 'barcelona', countryKey: 'spain', emoji: '🇪🇸', imgId: 'photo-1583422409516-2895a77efded', climates: ['Mediterranean', 'Oceanic'] },
    { id: 'santorini', cityKey: 'santorini', countryKey: 'greece', emoji: '🇬🇷', imgId: 'photo-1613395877344-13d4a8e0d49e', climates: ['Mediterranean', 'Oceanic'] },
    { id: 'bangkok', cityKey: 'bangkok', countryKey: 'thailand', emoji: '🇹🇭', imgId: 'photo-1508009603885-50cf7c579367', climates: ['Tropical'] },
    { id: 'phuket', cityKey: 'phuket', countryKey: 'thailand', emoji: '🇹🇭', imgId: 'photo-1589308078059-be1415eab4c3', climates: ['Tropical'] },
    { id: 'bali', cityKey: 'bali', countryKey: 'indonesia', emoji: '🇮🇩', imgId: 'photo-1537996194471-e657df975ab4', climates: ['Tropical', 'Oceanic'] },
    { id: 'hanoi', cityKey: 'hanoi', countryKey: 'vietnam', emoji: '🇻🇳', imgId: 'photo-1555939594-58d7cb561ad1', climates: ['Tropical'] },
    { id: 'hochiminh', cityKey: 'hochiminh', countryKey: 'vietnam', emoji: '🇻🇳', imgId: 'photo-1528127269322-539801943592', climates: ['Tropical'] },
    { id: 'singapore', cityKey: 'singapore', countryKey: 'singapore', emoji: '🇸🇬', imgId: 'photo-1525596662734-b9760abc1f64', climates: ['Urban'] },
    { id: 'newyork', cityKey: 'newyork', countryKey: 'usa', emoji: '🇺🇸', imgId: 'photo-1496442226666-8d4d0e62e6e9', climates: ['Urban'] },
    { id: 'losangeles', cityKey: 'losangeles', countryKey: 'usa', emoji: '🇺🇸', imgId: 'photo-1454177643390-7f100d1bbeec', climates: ['Urban'] },
    { id: 'dubai', cityKey: 'dubai', countryKey: 'uae', emoji: '🇦🇪', imgId: 'photo-1512453979798-5ea266f8880c', climates: ['Desert', 'Urban'] },
    { id: 'interlaken', cityKey: 'interlaken', countryKey: 'switzerland', emoji: '🇨🇭', imgId: 'photo-1517512022714-f1389c046041', climates: ['Alpine'] },
    { id: 'stmoritz', cityKey: 'stmoritz', countryKey: 'switzerland', emoji: '🇨🇭', imgId: 'photo-1517030330234-94c4fa9fc0ea', climates: ['Alpine'] },
    { id: 'queenstown', cityKey: 'queenstown', countryKey: 'newzealand', emoji: '🇳🇿', imgId: 'photo-1507699622108-4be3abd695ad', climates: ['Alpine', 'Oceanic'] },
    { id: 'sydney', cityKey: 'sydney', countryKey: 'australia', emoji: '🇦🇺', imgId: 'photo-1506973035872-a4ec16b8e8d9', climates: ['Oceanic'] },
    { id: 'london', cityKey: 'london', countryKey: 'uk', emoji: '🇬🇧', imgId: 'photo-1513635269975-59663e0ac1ad', climates: ['Urban', 'Oceanic'] },
    { id: 'shanghai', cityKey: 'shanghai', countryKey: 'china', emoji: '🇨🇳', imgId: 'photo-1548919973-5cfe5d4636a0', climates: ['Urban'] },
    { id: 'taipei', cityKey: 'taipei', countryKey: 'taiwan', emoji: '🇹🇼', imgId: 'photo-1504109586057-7a2ae83d1338', climates: ['Urban'] },
    { id: 'vancouver', cityKey: 'vancouver', countryKey: 'canada', emoji: '🇨🇦', imgId: 'photo-1559511260-66a654ae982a', climates: ['Urban', 'Oceanic'] },
    { id: 'istanbul', cityKey: 'istanbul', countryKey: 'turkey', emoji: '🇹🇷', imgId: 'photo-1524231757912-21f4fe3a7200', climates: ['Urban', 'Mediterranean'] },
    { id: 'marrakesh', cityKey: 'marrakesh', countryKey: 'morocco', emoji: '🇲🇦', imgId: 'photo-1539020140153-e479b8c22e70', climates: ['Desert'] },
    { id: 'cancun', cityKey: 'cancun', countryKey: 'mexico', emoji: '🇲🇽', imgId: 'photo-1512813195396-6ca27d89699c', climates: ['Tropical'] },
    { id: 'prague', cityKey: 'prague', countryKey: 'czech', emoji: '🇨🇿', imgId: 'photo-1519677100203-a025537302f7', climates: ['Urban'] },
    { id: 'vienna', cityKey: 'vienna', countryKey: 'austria', emoji: '🇦🇹', imgId: 'photo-1516550893923-42d28e5677af', climates: ['Urban'] },
    { id: 'munich', cityKey: 'munich', countryKey: 'germany', emoji: '🇩🇪', imgId: 'photo-1595867818082-083862f3d630', climates: ['Urban'] },
    { id: 'venice', cityKey: 'venice', countryKey: 'italy', emoji: '🇮🇹', imgId: 'photo-1514890547357-a9ee2887a35f', climates: ['Urban', 'Oceanic'] },
    { id: 'milan', cityKey: 'milan', countryKey: 'italy', emoji: '🇮🇹', imgId: 'photo-1543332164-6e82f355badc', climates: ['Urban'] },
    { id: 'lisbon', cityKey: 'lisbon', countryKey: 'portugal', emoji: '🇵🇹', imgId: 'photo-1585208798174-6cedd80e010a', climates: ['Urban', 'Mediterranean'] },
    { id: 'porto', cityKey: 'porto', countryKey: 'portugal', emoji: '🇵🇹', imgId: 'photo-1555881400-74d7acaacd8b', climates: ['Urban', 'Oceanic'] },
    { id: 'cairo', cityKey: 'cairo', countryKey: 'egypt', emoji: '🇪🇬', imgId: 'photo-1572252009286-268acec5ca0a', climates: ['Desert', 'Urban'] },
    { id: 'capetown', cityKey: 'capetown', countryKey: 'southafrica', emoji: '🇿🇦', imgId: 'photo-1580619305218-8423a7ef79b4', climates: ['Oceanic', 'Urban'] },
    { id: 'buenosaires', cityKey: 'buenosaires', countryKey: 'argentina', emoji: '🇦🇷', imgId: 'photo-1589909202802-8f4aadce1849', climates: ['Urban'] },
    { id: 'rio', cityKey: 'rio', countryKey: 'brazil', emoji: '🇧🇷', imgId: 'photo-1483729558449-99ef09a8c325', climates: ['Tropical', 'Urban'] },
    { id: 'machupicchu', cityKey: 'machupicchu', countryKey: 'peru', emoji: '🇵🇪', imgId: 'photo-1526392060635-9d6019884377', climates: ['Alpine'] },
    { id: 'danang', cityKey: 'danang', countryKey: 'vietnam', emoji: '🇻🇳', imgId: 'photo-1555432322-3832c9693769', climates: ['Tropical', 'Oceanic'] },
    { id: 'amsterdam', cityKey: 'amsterdam', countryKey: 'netherlands', emoji: '🌷', imgId: 'photo-1514936034176-a4f65345686d', climates: ['Urban', 'Oceanic'] },
    { id: 'fukuoka', cityKey: 'fukuoka', countryKey: 'japan', emoji: '🇯🇵', imgId: 'photo-1590274853856-f22d5ee3d228', climates: ['Urban', 'Oceanic'] },
    { id: 'nagoya', cityKey: 'nagoya', countryKey: 'japan', emoji: '🇯🇵', imgId: 'photo-1585437648316-dbd23605b0a3', climates: ['Urban'] },
];

// ── 목적지 이름 안전 번역 헬퍼 ──────────────────────────────────────────────
// t()가 번역 키를 그대로 반환하면(번역 데이터 없음), key 자체를 사람이 읽기 좋은 이름으로 변환
const makeSafeDestName = (tFn) => (key) => {
    const rawKey = `survey.destinations.${key}`;
    const result = tFn(rawKey);
    // 번역 실패 시 key 값을 사람이 읽기 좋게 변환 (예: 'newyork' -> 'Newyork')
    if (result === rawKey || result.startsWith('survey.destinations.')) {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
    return result;
};

const Survey = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        destination: '',
        destinationId: '', // 추가: 목적지 고유 ID
        startDate: '',
        endDate: '',
        vibe: '',
        dining: '',
        pace: '',
        accommodation: '',
        companions: 'Solo',
        focus: []
    });

    // safeDestName: 번역 키 그대로 노출 방지 (컴포넌트 내부 바인딩)
    const safeDestName = makeSafeDestName(t);

    useEffect(() => {
        const prefill = location.state?.prefillDestination;
        if (prefill) {
            // 프리필된 도시명으로 ID 찾기 시도
            const found = ALL_DESTINATIONS.find(d => 
                t(`survey.destinations.${d.cityKey}`, { lng: 'en' }) === prefill ||
                t(`survey.destinations.${d.cityKey}`, { lng: 'ko' }) === prefill ||
                d.id === prefill.toLowerCase()
            );
            
            if (found) {
                const city = safeDestName(found.cityKey);
                const country = safeDestName(found.countryKey);
                setFormData(prev => ({ 
                    ...prev, 
                    destination: `${country} (${city})`,
                    destinationId: found.id 
                }));
            } else {
                setFormData(prev => ({ ...prev, destination: prefill }));
            }
        }
    }, [location.state?.prefillDestination]);

    useEffect(() => {
        // 단계 이동 시 페이지 최상단으로 스크롤 (레이아웃 렌더링 후 실행되도록 지연 시간 추가)
        const scrollTimer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 0);
        return () => clearTimeout(scrollTimer);
    }, [step]);

    // 언어 변경 시 선택된 목적지 텍스트 동적 업데이트
    useEffect(() => {
        if (formData.destinationId) {
            const dest = ALL_DESTINATIONS.find(d => d.id === formData.destinationId);
            if (dest) {
                const city = safeDestName(dest.cityKey);
                const country = safeDestName(dest.countryKey);
                setFormData(prev => ({ ...prev, destination: `${country} (${city})` }));
            }
        }
    }, [i18n.language]);

    const toggleArrayItem = (key, item) => {
        setFormData(prev => {
            const list = prev[key] || [];
            if (list.includes(item)) return { ...prev, [key]: list.filter(x => x !== item) };
            return { ...prev, [key]: [...list, item] };
        });
    };

    const updateData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            setLoading(true);
            setTimeout(() => {
                navigate('/itinerary', { state: formData });
            }, 2500);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary flex flex-col items-center justify-center text-white p-8 text-center">
                <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin mb-8"></div>
                <h2 className="text-2xl font-bold mb-2">{t('survey.loading')}</h2>
                <p className="text-gray-400">
                    {t('survey.loadingThrilling', { destination: formData.destination })}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary">
            <Navbar />
            <SurveyLayout
                step={step}
                totalSteps={2}
                title={
                    <span className="font-heading">
                        {step === 1 ? t('survey.step1Title') : t('survey.step2Title')}
                    </span>
                }
                subtitle={
                    step === 1 ? t('survey.step1Subtitle') : t('survey.step2Subtitle')
                }
                onNext={handleNext}
                onBack={handleBack}
                nextLabel={step === 2 ? t('survey.genItin') : t('survey.nextStep')}
                canNext={
                    (step === 1 && formData.destination) ||
                    (step === 2 && 
                        formData.startDate && 
                        formData.endDate &&
                        formData.vibe && 
                        formData.dining && 
                        formData.pace && 
                        formData.accommodation)
                }
            >
                <StatusStepBar currentStep={step} />
                {step === 1 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 1. 검색 섹션 */}
                        <section>
                            <div className="relative mb-8">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary z-10 transition-transform hover:scale-110">
                                    <MapPin size={24} />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t('survey.destSearchPlace') || "Where do you want to go?"}
                                    className="w-full pl-16 pr-14 py-6 rounded-3xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none text-xl font-bold transition-all bg-white shadow-xl shadow-gray-100/50 placeholder:text-gray-300"
                                    value={formData.destination}
                                    onChange={(e) => updateData('destination', e.target.value)}
                                />
                                {formData.destination && (
                                    <button
                                        onClick={() => {
                                            updateData('destination', '');
                                            updateData('destinationId', '');
                                        }}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors text-lg"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* 검색 결과 */}
                            {formData.destination && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 p-2 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    {(() => {
                                        const q = formData.destination.toLowerCase();
                                        const filtered = ALL_DESTINATIONS.filter(d => {
                                            // 현재 언어와 상관없이 한글/영어 모두 검색 가능하도록 처리
                                            const languages = ['en', 'ko'];
                                            return languages.some(lng => {
                                                const city = t(`survey.destinations.${d.cityKey}`, { lng, defaultValue: '' }).toLowerCase();
                                                const country = t(`survey.destinations.${d.countryKey}`, { lng, defaultValue: '' }).toLowerCase();
                                                const combined = `${country} ${city}`.toLowerCase();
                                                return city.includes(q) || country.includes(q) || combined.includes(q);
                                            }) || d.id.toLowerCase().includes(q);
                                        });

                                        if (filtered.length === 0) return (
                                            <div className="col-span-2 text-center py-6 text-gray-400">
                                                <p className="font-medium">{t('survey.destNotFound', { dest: formData.destination })}</p>
                                                <button
                                                    onClick={() => {}}
                                                    className="mt-2 text-primary font-bold hover:underline"
                                                >
                                                    {t('survey.destUseBtn', { dest: formData.destination })}
                                                </button>
                                            </div>
                                        );

                                        return filtered.map((dest) => {
                                            const city = safeDestName(dest.cityKey);
                                            const country = safeDestName(dest.countryKey);
                                            const label = `${country} (${city})`;
                                            const isSelected = formData.destinationId === dest.id;
                                            return (
                                                <button
                                                    key={dest.id}
                                                    onClick={() => {
                                                        updateData('destination', label);
                                                        updateData('destinationId', dest.id);
                                                    }}
                                                    className={`group flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all
                                                        ${isSelected
                                                            ? 'border-primary bg-primary/10 text-secondary shadow-md'
                                                            : 'border-white bg-white text-gray-700 hover:border-primary/30 hover:shadow-lg'
                                                        }`}
                                                >
                                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                                                        <img
                                                            src={`https://images.unsplash.com/${dest.imgId}?auto=format&fit=crop&q=80&w=100&h=100`}
                                                            alt={city}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/10" />
                                                        <span className="absolute bottom-1 right-1 text-xs">{dest.emoji}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className={`font-black truncate ${isSelected ? 'text-primary' : 'text-secondary'}`}>{city}</div>
                                                        <div className="text-xs text-gray-400 font-bold">{country}</div>
                                                    </div>
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </section>

                        <section className="pt-4">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">{t('survey.seasonalTitle')}</h3>
                                    <p className="text-gray-400 mt-1 font-medium">{t('survey.seasonalSubtitle')}</p>
                                </div>
                                <Sparkles className="text-primary animate-bounce" size={28} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {SEASONAL_RECOMMENDATIONS.map((dest) => {
                                    const city = safeDestName(dest.cityKey);
                                    const country = safeDestName(dest.countryKey);
                                    const label = `${country} (${city})`;
                                    const isSelected = formData.destinationId === dest.id;
                                    return (
                                        <div
                                            key={dest.id}
                                            onClick={() => { updateData('destination', label); updateData('destinationId', dest.id); }}
                                            className={`
                                                group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500
                                                ${isSelected ? 'ring-4 ring-primary ring-offset-4 scale-[0.98]' : 'hover:-translate-y-2 hover:shadow-2xl'}
                                            `}
                                        >
                                            <div className="aspect-[4/5] relative">
                                                <ExternalPlaceImage
                                                    name={city}
                                                    region={country}
                                                    initialUrl={dest.imgId 
                                                        ? `https://images.unsplash.com/${dest.imgId}?auto=format&fit=crop&q=80&w=400&h=500`
                                                        : `https://loremflickr.com/400/500/${dest.cityKey},city?random=${dest.id}`
                                                    }
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent" />
                                                
                                                <div className="absolute bottom-0 left-0 w-full p-5 text-white">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-lg">{dest.emoji}</span>
                                                        <span className="text-xs font-black bg-primary/90 text-secondary px-2 py-0.5 rounded-full uppercase">{country}</span>
                                                    </div>
                                                    <div className="font-black text-lg leading-tight mb-1">{city}</div>
                                                    <div className="text-[10px] text-white/70 line-clamp-2 leading-relaxed font-medium">
                                                        {t(`survey.rec.${dest.id}.desc`)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Reset Button */}
                        <div className="pt-8 flex justify-center">
                            <button 
                                onClick={() => updateData('destination', '')}
                                className="px-6 py-2 rounded-full text-sm font-black text-gray-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-2 border border-transparent hover:border-primary/20"
                            >
                                <Compass size={18} />
                                {t('survey.resetBtn')}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 1. Itinerary & Travelers */}
                        <section className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-xl shadow-gray-200/50">
                            <h3 className="text-2xl md:text-3xl font-black text-secondary mb-10 flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Calendar className="text-primary" size={24} />
                                </div>
                                {t('survey.step2Section1')}
                            </h3>

                            <div className="space-y-12">
                                {/* Travel Dates */}
                                <div className="space-y-6">
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        {t('survey.step2Section1Subtitle')}
                                    </label>
                                    <div className="flex flex-col lg:flex-row items-stretch gap-6">
                                        <div className="flex-1 space-y-3">
                                            <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest ml-1">{t('survey.datesStart')}</p>
                                            <div className="relative group">
                                                <DatePicker
                                                    selected={formData.startDate ? new Date(formData.startDate) : null}
                                                    onChange={(date) => {
                                                        if (!date) return updateData('startDate', '');
                                                        updateData('startDate', format(date, 'yyyy-MM-dd'));
                                                    }}
                                                    dateFormat="yyyy-MM-dd"
                                                    className="w-full py-5 pl-14 pr-6 rounded-[1.5rem] border-2 border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 focus:outline-none text-lg font-black text-secondary bg-white transition-all cursor-pointer shadow-sm group-hover:shadow-md group-hover:border-primary/20"
                                                    placeholderText="YYYY-MM-DD"
                                                    minDate={new Date()}
                                                />
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Calendar size={18} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest ml-1">{t('survey.datesEnd')}</p>
                                            <div className="relative group">
                                                <DatePicker
                                                    selected={formData.endDate ? new Date(formData.endDate) : null}
                                                    onChange={(date) => {
                                                        if (!date) return updateData('endDate', '');
                                                        updateData('endDate', format(date, 'yyyy-MM-dd'));
                                                    }}
                                                    dateFormat="yyyy-MM-dd"
                                                    className="w-full py-5 pl-14 pr-6 rounded-[1.5rem] border-2 border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 focus:outline-none text-lg font-black text-secondary bg-white transition-all cursor-pointer shadow-sm group-hover:shadow-md group-hover:border-primary/20"
                                                    placeholderText="YYYY-MM-DD"
                                                    minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                                                />
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Calendar size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Companions */}
                                <div className="space-y-6">
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                        {t('survey.step2Section1With')}
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { id: 'Solo', label: t('survey.withSolo'), emoji: '🧍' },
                                            { id: 'Couple', label: t('survey.withCouple'), emoji: '💑' },
                                            { id: 'Friends', label: t('survey.withFriends'), emoji: '👯' },
                                            { id: 'Family', label: t('survey.withFamily'), emoji: '👨‍👩‍👧' }
                                        ].map((comp) => (
                                            <button
                                                key={comp.id}
                                                onClick={() => updateData('companions', comp.id)}
                                                className={`py-5 px-6 flex items-center justify-center gap-4 rounded-[1.5rem] border-2 font-black transition-all duration-300
                                                ${formData.companions === comp.id
                                                    ? 'bg-primary text-secondary border-primary shadow-xl shadow-primary/20 scale-[1.02]'
                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-primary/40 hover:bg-gray-50/50 hover:text-secondary'}`}
                                            >
                                                <span className="text-3xl">{comp.emoji}</span>
                                                <span className="text-base tracking-tight">{comp.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Travel DNA Section (Vibe & Experience) */}
                        <section className="space-y-8">
                            {/* Travel Vibe */}
                            <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-xl shadow-gray-200/50">
                                <h3 className="text-2xl md:text-3xl font-black text-secondary mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Activity className="text-primary" size={24} />
                                    </div>
                                    {t('survey.step2Section2Vibe')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { id: 'Chill', label: t('survey.vibeChill'), desc: t('survey.vibeChillDesc') },
                                        { id: 'Active', label: t('survey.vibeActive'), desc: t('survey.vibeActiveDesc') },
                                        { id: 'Social', label: t('survey.vibeSocial'), desc: t('survey.vibeSocialDesc') },
                                        { id: 'Quiet', label: t('survey.vibeQuiet'), desc: t('survey.vibeQuietDesc') },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => updateData('vibe', opt.id)}
                                            className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-1
                                                ${formData.vibe === opt.id 
                                                    ? 'bg-primary/5 border-primary shadow-inner ring-4 ring-primary/5' 
                                                    : 'bg-white border-gray-50 hover:border-primary/30'}
                                            `}
                                        >
                                            <div className={`text-lg font-black ${formData.vibe === opt.id ? 'text-primary' : 'text-secondary'}`}>{opt.label}</div>
                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dining Preference */}
                            <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-xl shadow-gray-200/50">
                                <h3 className="text-2xl md:text-3xl font-black text-secondary mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Coffee className="text-primary" size={24} />
                                    </div>
                                    {t('survey.step2Section2Dining')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: 'Street Food', label: t('survey.diningStreet'), icon: '🌭' },
                                        { id: 'Casual Dining', label: t('survey.diningCasual'), icon: '🍝' },
                                        { id: 'Fine Dining', label: t('survey.diningFine'), icon: '🥂' }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => updateData('dining', opt.id)}
                                            className={`py-6 px-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-3
                                            ${formData.dining === opt.id 
                                                ? 'bg-primary text-secondary border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                                                : 'bg-white text-gray-500 border-gray-50 hover:border-primary/30 hover:bg-gray-50'}`}>
                                            <span className="text-2xl">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Travel Pace */}
                            <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-xl shadow-gray-200/50">
                                <h3 className="text-2xl md:text-3xl font-black text-secondary mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Activity className="text-primary" size={24} />
                                    </div>
                                    {t('survey.step2Section2Pace')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: 'Relaxed', label: t('survey.paceRelaxed'), icon: '🐢' },
                                        { id: 'Moderate', label: t('survey.paceModerate'), icon: '🚶' },
                                        { id: 'Packed', label: t('survey.pacePacked'), icon: '⚡' }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => updateData('pace', opt.id)}
                                            className={`py-6 px-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-3
                                            ${formData.pace === opt.id 
                                                ? 'bg-primary text-secondary border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                                                : 'bg-white text-gray-500 border-gray-50 hover:border-primary/30 hover:bg-gray-50'}`}>
                                            <span className="text-2xl">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accommodation */}
                            <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-xl shadow-gray-200/50">
                                <h3 className="text-2xl md:text-3xl font-black text-secondary mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Building2 className="text-primary" size={24} />
                                    </div>
                                    {t('survey.step2Section2Acc')}
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { id: 'Hostel', label: t('survey.accHostel'), icon: '🏠' },
                                        { id: 'Hotel', label: t('survey.accHotel'), icon: '🏨' },
                                        { id: 'Luxury Resort', label: t('survey.accResort'), icon: '🏰' },
                                        { id: 'Airbnb', label: t('survey.accAirbnb'), icon: '🏡' }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => updateData('accommodation', opt.id)}
                                            className={`py-6 px-2 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-2
                                            ${formData.accommodation === opt.id 
                                                ? 'bg-primary text-secondary border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                                                : 'bg-white text-gray-500 border-gray-50 hover:border-primary/30 hover:bg-gray-50'}`}>
                                            <span className="text-xl">{opt.icon}</span>
                                            <span className="text-xs sm:text-sm">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 3. Focus Section (관심사) */}
                        <section className="bg-secondary p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                            <h3 className="text-2xl md:text-3xl font-black mb-10 flex items-center gap-3 relative z-10">
                                <Compass className="text-primary" size={28} />
                                {t('survey.step2Section3')}
                                <span className="text-xs font-medium text-gray-400 normal-case tracking-normal ml-auto">{t('survey.step2Section3Subtitle')}</span>
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 relative z-10">
                                {[
                                    { id: 'Culture', label: t('survey.focusCulture'), icon: '🏛️' },
                                    { id: 'Nature', label: t('survey.focusNature'), icon: '🏔️' },
                                    { id: 'Food', label: t('survey.focusFood'), icon: '🍕' },
                                    { id: 'Shopping', label: t('survey.focusShopping'), icon: '🛍️' },
                                    { id: 'Relax', label: t('survey.focusRelax'), icon: '🧖' },
                                    { id: 'Adventure', label: t('survey.focusAdventure'), icon: '🧗' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => toggleArrayItem('focus', opt.id)}
                                        className={`py-6 px-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-3
                                        ${formData.focus.includes(opt.id) 
                                            ? 'bg-primary text-secondary border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] scale-[1.05]' 
                                            : 'bg-white/5 border-white/10 text-white/60 hover:border-primary/50 hover:text-white hover:bg-white/10'}`}
                                    >
                                        <span className="text-3xl">{opt.icon}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </SurveyLayout>
        </div>
    );
};

export default Survey;
