import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Users, Calendar, DollarSign, Activity, Coffee, Mountain, Palmtree, Building2, Tent, Compass } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import SurveyLayout from '../components/SurveyLayout';
import Card from '../components/Card';
import Slider from '../components/Slider';
import Navbar from '../components/Navbar';
import { DESTINATION_DATA } from '../data';

const Survey = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [knowsDest, setKnowsDest] = useState(null); // 'yes' or 'no'

    const [formData, setFormData] = useState({
        // Step 1: DNA (Phase 18: Replaced MBTI with Vibe & Style)
        vibe: '', // 'Social' or 'Quiet'
        style: 50,
        climate: [],
        dining: '',
        pace: '',
        accommodation: '',

        // Step 2: Destination
        destination: '',

        // Step 3: Logistics
        startDate: '',
        endDate: '',
        budget: 2000,
        companions: 'Solo',

        // Step 3 (Extras)
        occasion: '',
        transport: '',
        focus: []
    });

    // 히어로 검색창에서 목적지를 선택했을 때 자동으로 채워넣기
    useEffect(() => {
        const prefill = location.state?.prefillDestination;
        if (prefill) {
            setFormData(prev => ({ ...prev, destination: prefill }));
            setKnowsDest('yes');
        }
    }, []);

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
            // If user said "No" to knowing destination, they must have selected a recommendation now
            setStep(3);
        } else if (step === 3) {
            setLoading(true);
            setTimeout(() => {
                navigate('/itinerary', { state: formData });
            }, 2500);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            if (step === 3 && knowsDest === 'no') {
                // If backtracking from logistics and they didn't know dest, go back to recommendation selection
                setStep(2);
            } else if (step === 2 && knowsDest !== null) {
                // If in Step 2 and they made a choice (Yes/No), reset that choice to see the fork again? 
                // Creating a Step 1.5 might be cleaner, but let's keep it simple: 
                // If they hit back from Step 2 (Dest Input or Recs), go to Step 1.
                setStep(1);
                setKnowsDest(null);
            } else {
                setStep(step - 1);
            }
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
                    {formData.style > 50 
                        ? t('survey.loadingThrilling', { destination: formData.destination }) 
                        : t('survey.loadingRelaxing', { destination: formData.destination })}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary">
            <Navbar />
            <SurveyLayout
                step={step}
                totalSteps={3}
                title={
                    <span className="font-heading">
                        {step === 1 ? t('survey.step1Title') :
                            step === 2 ? t('survey.step2Title') :
                                t('survey.step3Title')}
                    </span>
                }
                subtitle={
                    step === 1 ? t('survey.step1Subtitle') :
                        step === 2 ? t('survey.step2Subtitle') :
                            t('survey.step3Subtitle')
                }
                onNext={handleNext}
                onBack={handleBack}
                nextLabel={step === 3 ? t('survey.genItin') : t('survey.nextStep')}
                canNext={
                    (step === 1 &&
                        formData.vibe &&
                        formData.dining &&
                        formData.pace &&
                        formData.accommodation &&
                        formData.climate.length > 0) ||
                    (step === 2 && formData.destination) ||
                    (step === 3 && formData.startDate && formData.endDate)
                }
            >
                {/* Step 1: Travel DNA */}
                {step === 1 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Travel Vibe */}
                        <div className="grid grid-cols-1 gap-6">
                            <section>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">{t('survey.vibeTitle')}</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { id: 'Chill', label: t('survey.vibeChill'), desc: t('survey.vibeChillDesc') },
                                        { id: 'Active', label: t('survey.vibeActive'), desc: t('survey.vibeActiveDesc') },
                                        { id: 'Social', label: t('survey.vibeSocial'), desc: t('survey.vibeSocialDesc') },
                                        { id: 'Quiet', label: t('survey.vibeQuiet'), desc: t('survey.vibeQuietDesc') },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => updateData('vibe', opt.id)}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left ${formData.vibe === opt.id ? 'bg-primary/10 border-primary shadow-inner' : 'bg-white border-gray-100 hover:border-primary/50'}`}
                                        >
                                            <div className={`text-base font-black ${formData.vibe === opt.id ? 'text-primary' : 'text-secondary'}`}>{opt.label}</div>
                                            <div className="text-xs text-gray-400 font-medium uppercase mt-1">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Preferred Climates */}
                        <section>
                            <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">{t('survey.climateTitle')} <span className="text-xs font-medium text-gray-400 normal-case tracking-normal">{t('survey.selectMultiple')}</span></label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { label: 'Tropical', tLabel: t('survey.climateTropical'), icon: <Palmtree size={18} /> },
                                    { label: 'Alpine', tLabel: t('survey.climateAlpine'), icon: <Mountain size={18} /> },
                                    { label: 'Urban', tLabel: t('survey.climateUrban'), icon: <Building2 size={18} /> },
                                    { label: 'Desert', tLabel: t('survey.climateDesert'), icon: <Tent size={18} /> },
                                    { label: 'Mediterranean', tLabel: t('survey.climateMed'), icon: <Compass size={18} /> },
                                    { label: 'Oceanic', tLabel: t('survey.climateOceanic'), icon: <MapPin size={18} /> },
                                ].map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => toggleArrayItem('climate', opt.label)}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-base font-semibold
                                        ${formData.climate.includes(opt.label)
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-white border-gray-100 text-gray-600 hover:border-primary/50'}
                                    `}
                                    >
                                        {opt.icon} <span>{opt.tLabel}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Dining, Pace, Accommodation */}
                        <section className="space-y-7">
                            <div>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">{t('survey.diningTitle')}</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {[
                                        { id: 'Street Food', label: t('survey.diningStreet') },
                                        { id: 'Casual Dining', label: t('survey.diningCasual') },
                                        { id: 'Fine Dining', label: t('survey.diningFine') }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => updateData('dining', opt.id)}
                                            className={`flex-1 py-4 px-3 rounded-2xl border-2 text-base font-bold transition-all
                                            ${formData.dining === opt.id ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">{t('survey.paceTitle')}</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {[
                                        { id: 'Relaxed', label: t('survey.paceRelaxed') },
                                        { id: 'Moderate', label: t('survey.paceModerate') },
                                        { id: 'Packed', label: t('survey.pacePacked') }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => updateData('pace', opt.id)}
                                            className={`flex-1 py-4 px-3 rounded-2xl border-2 text-base font-bold transition-all
                                            ${formData.pace === opt.id ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">{t('survey.accTitle')}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { id: 'Hostel', label: t('survey.accHostel') },
                                        { id: 'Hotel', label: t('survey.accHotel') },
                                        { id: 'Luxury Resort', label: t('survey.accResort') },
                                        { id: 'Airbnb', label: t('survey.accAirbnb') }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => updateData('accommodation', opt.id)}
                                            className={`flex-1 py-4 px-2 rounded-2xl border-2 text-sm font-bold transition-all
                                            ${formData.accommodation === opt.id ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Step 2: Destination Fork */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {knowsDest === null ? (
                            <div className="text-center py-10">
                                <h3 className="text-xl font-bold text-secondary mb-8">{t('survey.destPrompt')}</h3>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <button
                                        onClick={() => setKnowsDest('yes')}
                                        className="px-8 py-4 bg-primary text-secondary rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all w-full sm:w-40"
                                    >
                                        {t('survey.destYes')}
                                    </button>
                                    <button
                                        onClick={() => setKnowsDest('no')}
                                        className="px-8 py-4 bg-white border-2 border-primary text-primary rounded-xl font-bold text-lg hover:bg-primary/10 transition-all w-full sm:w-40"
                                    >
                                        {t('survey.destNo')}
                                    </button>
                                </div>
                            </div>
                        ) : knowsDest === 'yes' ? (
                            <section>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">
                                    {t('survey.destWhere')}
                                </label>
                                {/* 검색창 */}
                                <div className="relative mb-5">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10" size={20} />
                                    <input
                                        type="text"
                                        placeholder={t('survey.destSearchPlace')}
                                        className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none text-lg font-medium transition-all bg-white shadow-sm"
                                        value={formData.destination}
                                        onChange={(e) => updateData('destination', e.target.value)}
                                        autoFocus
                                    />
                                    {formData.destination && (
                                        <button
                                            onClick={() => updateData('destination', '')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* 목적지 목록 - 항상 표시, 검색 시 필터링 */}
                                {(() => {
                                    const ALL_DESTINATIONS = [
                                        { countryKey: 'japan', cityKey: 'tokyo', emoji: '🇯🇵' },
                                        { countryKey: 'japan', cityKey: 'kyoto', emoji: '🇯🇵' },
                                        { countryKey: 'japan', cityKey: 'osaka', emoji: '🇯🇵' },
                                        { countryKey: 'korea', cityKey: 'seoul', emoji: '🇰🇷' },
                                        { countryKey: 'korea', cityKey: 'busan', emoji: '🇰🇷' },
                                        { countryKey: 'france', cityKey: 'paris', emoji: '🇫🇷' },
                                        { countryKey: 'france', cityKey: 'nice', emoji: '🇫🇷' },
                                        { countryKey: 'italy', cityKey: 'rome', emoji: '🇮🇹' },
                                        { countryKey: 'italy', cityKey: 'florence', emoji: '🇮🇹' },
                                        { countryKey: 'spain', cityKey: 'barcelona', emoji: '🇪🇸' },
                                        { countryKey: 'greece', cityKey: 'santorini', emoji: '🇬🇷' },
                                        { countryKey: 'thailand', cityKey: 'bangkok', emoji: '🇹🇭' },
                                        { countryKey: 'thailand', cityKey: 'phuket', emoji: '🇹🇭' },
                                        { countryKey: 'indonesia', cityKey: 'bali', emoji: '🇮🇩' },
                                        { countryKey: 'vietnam', cityKey: 'hanoi', emoji: '🇻🇳' },
                                        { countryKey: 'vietnam', cityKey: 'hochiminh', emoji: '🇻🇳' },
                                        { countryKey: 'singapore', cityKey: 'singapore', emoji: '🇸🇬' },
                                        { countryKey: 'usa', cityKey: 'newyork', emoji: '🇺🇸' },
                                        { countryKey: 'usa', cityKey: 'losangeles', emoji: '🇺🇸' },
                                        { countryKey: 'uae', cityKey: 'dubai', emoji: '🇦🇪' },
                                        { countryKey: 'switzerland', cityKey: 'interlaken', emoji: '🇨🇭' },
                                        { countryKey: 'newzealand', cityKey: 'queenstown', emoji: '🇳🇿' },
                                        { countryKey: 'australia', cityKey: 'sydney', emoji: '🇦🇺' },
                                        { countryKey: 'uk', cityKey: 'london', emoji: '🇬🇧' },
                                        { countryKey: 'china', cityKey: 'shanghai', emoji: '🇨🇳' },
                                        { countryKey: 'taiwan', cityKey: 'taipei', emoji: '🇹🇼' },
                                        { countryKey: 'canada', cityKey: 'vancouver', emoji: '🇨🇦' },
                                        { countryKey: 'turkey', cityKey: 'istanbul', emoji: '🇹🇷' },
                                        { countryKey: 'morocco', cityKey: 'marrakesh', emoji: '🇲🇦' },
                                        { countryKey: 'mexico', cityKey: 'cancun', emoji: '🇲🇽' },
                                    ];

                                    const q = formData.destination.toLowerCase();
                                    const filtered = q
                                        ? ALL_DESTINATIONS.filter(d => {
                                            const countryKo = t(`survey.destinations.${d.countryKey}`, { lng: 'ko' }).toLowerCase();
                                            const cityKo = t(`survey.destinations.${d.cityKey}`, { lng: 'ko' }).toLowerCase();
                                            const countryEn = d.countryKey.toLowerCase();
                                            const cityEn = d.cityKey.toLowerCase();
                                            
                                            return countryKo.includes(q) || cityKo.includes(q) || 
                                                   countryEn.includes(q) || cityEn.includes(q);
                                        })
                                        : ALL_DESTINATIONS;

                                    if (filtered.length === 0) return (
                                        <div className="text-center py-8 text-gray-400">
                                            <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                                            <p className="font-medium">{t('survey.destNotFound')}</p>
                                            <p className="text-sm mt-1">{t('survey.destUseInput')}</p>
                                            <button
                                                onClick={() => {/* 그냥 현재 input값 사용 */}}
                                                className="mt-3 px-5 py-2 bg-primary text-secondary rounded-xl font-bold text-sm hover:opacity-90 transition"
                                            >
                                                {t('survey.destUseBtn', { dest: formData.destination })}
                                            </button>
                                        </div>
                                    );

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                                            {filtered.map((dest) => {
                                                const country = t(`survey.destinations.${dest.countryKey}`);
                                                const city = t(`survey.destinations.${dest.cityKey}`);
                                                const label = `${country} (${city})`;
                                                const isSelected = formData.destination === label;
                                                return (
                                                    <button
                                                        key={`${dest.countryKey}-${dest.cityKey}`}
                                                        onClick={() => updateData('destination', label)}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all font-medium text-sm w-full
                                                            ${isSelected
                                                                ? 'border-primary bg-primary/10 text-secondary shadow-sm'
                                                                : 'border-gray-100 bg-white text-gray-700 hover:border-primary/40 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <span className="text-xl flex-shrink-0">{dest.emoji}</span>
                                                        <div className="min-w-0">
                                                            <div className={`font-bold truncate ${isSelected ? 'text-primary' : 'text-secondary'}`}>{city}</div>
                                                            <div className="text-xs text-gray-400">{country}</div>
                                                        </div>
                                                        {isSelected && <div className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </section>
                        ) : (
                            <section>
                                <label className="block text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
                                    {formData.climate.length > 0 
                                      ? t('survey.destMatches', { climates: formData.climate.map(c => t(`survey.climates.${c}`)).join(' & ') }) 
                                      : t('survey.destRecommend')}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(() => {
                                        const allDests = [
                                            { cityKey: 'kyoto', countryKey: 'japan', img: 'kyoto,japan', climates: ['Urban', 'Mediterranean'] },
                                            { cityKey: 'bali', countryKey: 'indonesia', img: 'bali,indonesia', climates: ['Tropical', 'Oceanic'] },
                                            { cityKey: 'hokkaido', countryKey: 'japan', img: 'hokkaido,winter', climates: ['Alpine'] },
                                            { cityKey: 'nice', countryKey: 'france', img: 'nice,france', climates: ['Mediterranean', 'Oceanic'] },
                                            { cityKey: 'newyork', countryKey: 'usa', img: 'newyork,city', climates: ['Urban'] },
                                            { cityKey: 'seoul', countryKey: 'korea', img: 'seoul,korea', climates: ['Urban'] },
                                            { cityKey: 'santorini', countryKey: 'greece', img: 'santorini,greece', climates: ['Mediterranean', 'Oceanic'] },
                                            { cityKey: 'phuket', countryKey: 'thailand', img: 'phuket,thailand', climates: ['Tropical'] },
                                            { cityKey: 'interlaken', countryKey: 'switzerland', img: 'switzerland,alps', climates: ['Alpine'] },
                                            { cityKey: 'barcelona', countryKey: 'spain', img: 'barcelona,spain', climates: ['Mediterranean', 'Oceanic'] },
                                            { cityKey: 'paris', countryKey: 'france', img: 'paris,city', climates: ['Urban'] },
                                            { cityKey: 'queenstown', countryKey: 'newzealand', img: 'queenstown,nature', climates: ['Alpine', 'Oceanic'] },
                                            { cityKey: 'stmoritz', countryKey: 'switzerland', img: 'switzerland,alps', climates: ['Alpine'] },
                                            { cityKey: 'dubai', countryKey: 'uae', img: 'dubai,desert', climates: ['Desert', 'Urban'] }
                                        ];
                                        const filtered = allDests.filter(dest =>
                                            formData.climate.length === 0 ||
                                            dest.climates.some(c => formData.climate.includes(c))
                                        );
                                        // If filtered is less than 8, add from the remaining to make it at least 8
                                        const results = [...filtered];
                                        if (results.length < 8) {
                                            const remaining = allDests.filter(d => !results.some(r => r.cityKey === d.cityKey));
                                            results.push(...remaining.slice(0, 8 - results.length));
                                        }
                                        return results.slice(0, 12).map((dest) => {
                                            const country = t(`survey.destinations.${dest.countryKey}`);
                                            const city = t(`survey.destinations.${dest.cityKey}`);
                                            const label = `${country} (${city})`;
                                            const isSelected = formData.destination === label;
                                            return (
                                                <div
                                                    key={dest.cityKey}
                                                    onClick={() => updateData('destination', label)}
                                                    className={`
                                                    p-3 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all hover:shadow-md
                                                    ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-primary/50'}
                                                `}
                                                >
                                                    <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={`https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=200&h=200&q=${dest.img}`}
                                                            alt={city}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h4 className="font-bold text-secondary text-base">{country}</h4>
                                                        <p className="text-sm text-gray-500">{city}</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-gray-300'}`}>
                                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* Step 3: Logistics */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section>
                            <label className="block text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">{t('survey.datesTitle')}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="block text-xs text-gray-400 mb-1">{t('survey.datesStart')}</label>
                                    <DatePicker
                                        selected={formData.startDate ? new Date(formData.startDate) : null}
                                        onChange={(date) => {
                                            if (!date) return updateData('startDate', '');
                                            updateData('startDate', format(date, 'yyyy-MM-dd'));
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary focus:outline-none font-medium text-secondary"
                                        placeholderText="YYYY-MM-DD"
                                        minDate={new Date()}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="block text-xs text-gray-400 mb-1">{t('survey.datesEnd')}</label>
                                    <DatePicker
                                        selected={formData.endDate ? new Date(formData.endDate) : null}
                                        onChange={(date) => {
                                            if (!date) return updateData('endDate', '');
                                            updateData('endDate', format(date, 'yyyy-MM-dd'));
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary focus:outline-none font-medium text-secondary"
                                        placeholderText="YYYY-MM-DD"
                                        minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">{t('survey.budgetTitle')}</label>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm text-gray-400 mb-3">{t('survey.budgetSub', { code: t('nav.currencyCode') })}</p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">{t('nav.currency')}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        placeholder={`e.g. ${t('nav.currencyCode') === 'USD' ? '2000' : '2000000'}`}
                                        value={formData.budget === 0 ? '' : formData.budget}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            updateData('budget', val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                                        }}
                                        className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-primary focus:outline-none text-2xl font-black text-secondary transition-all"
                                    />
                                </div>
                                {formData.budget > 0 && (
                                    <p className="text-center text-sm font-semibold text-primary mt-3">
                                        {t('survey.budgetFormat')} <span className="text-xl font-black">{t('nav.currency')}{Number(formData.budget).toLocaleString()}</span>
                                    </p>
                                )}
                            </div>
                        </section>

                        <section>
                            <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">{t('survey.withTitle')}</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { id: 'Solo', label: t('survey.withSolo'), icon: <Users size={24} className="text-gray-400" /> },
                                    { id: 'Couple', label: t('survey.withCouple'), icon: <Users size={24} className="text-rose-400" /> },
                                    { id: 'Friends', label: t('survey.withFriends'), icon: <Users size={24} className="text-blue-400" /> },
                                    { id: 'Family', label: t('survey.withFamily'), icon: <Users size={24} className="text-amber-400" /> }
                                ].map((comp) => (
                                    <Card key={comp.id} selected={formData.companions === comp.id} onClick={() => updateData('companions', comp.id)} className="flex flex-col items-center justify-center gap-2 py-5">
                                        <div className={`p-3 rounded-full ${formData.companions === comp.id ? 'bg-primary/20' : 'bg-gray-50'}`}>{comp.icon}</div>
                                        <span className="font-bold text-secondary text-base">{comp.label}</span>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Extra Questions */}
                        <section className="space-y-6 pt-4 border-t border-gray-100">
                            <label className="block text-base font-bold text-secondary">{t('survey.finalTitle')}</label>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">{t('survey.occTitle')}</label>
                                <select
                                    className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-white text-base font-medium text-secondary focus:border-primary focus:outline-none"
                                    onChange={(e) => updateData('occasion', e.target.value)}
                                    value={formData.occasion}
                                >
                                    <option value="">{t('survey.occNone')}</option>
                                    <option value="honeymoon">{t('survey.occHoneymoon')}</option>
                                    <option value="anniversary">{t('survey.occAnniversary')}</option>
                                    <option value="birthday">{t('survey.occBirthday')}</option>
                                    <option value="work">{t('survey.occWork')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">{t('survey.transTitle')}</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {[
                                        { id: 'Public Transit', label: t('survey.transPub') },
                                        { id: 'Rental Car', label: t('survey.transRent') },
                                        { id: 'Walking/Uber', label: t('survey.transWalk') }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => updateData('transport', opt.id)}
                                            className={`flex-1 py-3 px-2 rounded-2xl border-2 text-sm font-bold transition-all
                                            ${formData.transport === opt.id ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">{t('survey.focusTitle')} <span className="text-xs font-medium text-gray-400 normal-case tracking-normal">{t('survey.selectMultiple')}</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'Culture', label: t('survey.focusCulture') },
                                        { id: 'Nature', label: t('survey.focusNature') },
                                        { id: 'Food', label: t('survey.focusFood') },
                                        { id: 'Shopping', label: t('survey.focusShopping') },
                                        { id: 'Relax', label: t('survey.focusRelax') },
                                        { id: 'Adventure', label: t('survey.focusAdventure') }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => toggleArrayItem('focus', opt.id)}
                                            className={`py-3 px-2 rounded-2xl border-2 text-sm font-bold transition-all
                                            ${formData.focus.includes(opt.id) ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </SurveyLayout>
        </div>
    );
};

export default Survey;
