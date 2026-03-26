import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [knowsDest, setKnowsDest] = useState(null); // 'yes' or 'no'

    const [formData, setFormData] = useState({
        // Step 1: DNA (Phase 18: Replaced MBTI with Vibe & Style)
        vibe: '', // 'Social' or 'Quiet'
        exploration: '', // 'Spontaneous' or 'Planned'
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
                <h2 className="text-2xl font-bold mb-2">Curating Your Journey...</h2>
                <p className="text-gray-400">Designing a {formData.style > 50 ? "thrilling" : "relaxing"} {formData.destination} experience.</p>
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
                        {step === 1 ? "Define Your Travel DNA" :
                            step === 2 ? "Pick Your Paradise" :
                                "Final Details"}
                    </span>
                }
                subtitle={
                    step === 1 ? "Help us understand your perfect trip." :
                        step === 2 ? "Where is your heart leading you?" :
                            "Logistics and final touches."
                }
                onNext={handleNext}
                onBack={handleBack}
                nextLabel={step === 3 ? "Generate My Plan" : "Next Step"}
                canNext={
                    (step === 1 &&
                        formData.vibe &&
                        formData.exploration &&
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
                        {/* Travel Vibe & Exploration Style */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">Your Travel Vibe</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'Chill', label: 'Chill Wanderer', desc: 'Slow & relaxed pace' },
                                        { id: 'Active', label: 'Active Explorer', desc: 'Energy & adventure' },
                                        { id: 'Social', label: 'Social & Lively', desc: 'Love meeting people' },
                                        { id: 'Quiet', label: 'Private & Quiet', desc: 'Peaceful relaxation' },
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
                            <section>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">Exploration Style</label>
                                <div className="flex gap-3">
                                    {[
                                        { id: 'Spontaneous', label: 'Spontaneous', desc: 'Follow the flow' },
                                        { id: 'Planned', label: 'Well-Planned', desc: 'Every detail counts' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => updateData('exploration', opt.id)}
                                            className={`flex-1 p-5 rounded-2xl border-2 transition-all text-left ${formData.exploration === opt.id ? 'bg-primary/10 border-primary shadow-inner' : 'bg-white border-gray-100 hover:border-primary/50'}`}
                                        >
                                            <div className={`text-base font-black ${formData.exploration === opt.id ? 'text-primary' : 'text-secondary'}`}>{opt.label}</div>
                                            <div className="text-xs text-gray-400 font-medium uppercase mt-1">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Preferred Climates */}
                        <section>
                            <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">Preferred Climates <span className="text-xs font-medium text-gray-400 normal-case tracking-normal">(Select Multiple)</span></label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Tropical', icon: <Palmtree size={18} /> },
                                    { label: 'Alpine', icon: <Mountain size={18} /> },
                                    { label: 'Urban', icon: <Building2 size={18} /> },
                                    { label: 'Desert', icon: <Tent size={18} /> },
                                    { label: 'Mediterranean', icon: <Compass size={18} /> },
                                    { label: 'Oceanic', icon: <MapPin size={18} /> },
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
                                        {opt.icon} <span>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Dining, Pace, Accommodation */}
                        <section className="space-y-7">
                            <div>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">Dining Preference</label>
                                <div className="flex gap-3">
                                    {['Street Food', 'Casual Dining', 'Fine Dining'].map(opt => (
                                        <button key={opt} onClick={() => updateData('dining', opt)}
                                            className={`flex-1 py-4 px-3 rounded-2xl border-2 text-base font-bold transition-all
                                            ${formData.dining === opt ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">Daily Pace</label>
                                <div className="flex gap-3">
                                    {['Relaxed', 'Moderate', 'Packed'].map(opt => (
                                        <button key={opt} onClick={() => updateData('pace', opt)}
                                            className={`flex-1 py-4 px-3 rounded-2xl border-2 text-base font-bold transition-all
                                            ${formData.pace === opt ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">Accommodation</label>
                                <div className="flex gap-3">
                                    {['Hostel', 'Hotel', 'Luxury Resort', 'Airbnb'].map(opt => (
                                        <button key={opt} onClick={() => updateData('accommodation', opt)}
                                            className={`flex-1 py-4 px-2 rounded-2xl border-2 text-sm font-bold transition-all
                                            ${formData.accommodation === opt ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}>
                                            {opt}
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
                                <h3 className="text-xl font-bold text-secondary mb-8">Do you have a specific destination in mind?</h3>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => setKnowsDest('yes')}
                                        className="px-8 py-4 bg-primary text-secondary rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all w-40"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => setKnowsDest('no')}
                                        className="px-8 py-4 bg-white border-2 border-primary text-primary rounded-xl font-bold text-lg hover:bg-primary/10 transition-all w-40"
                                    >
                                        No, Inspire Me
                                    </button>
                                </div>
                            </div>
                        ) : knowsDest === 'yes' ? (
                            <section>
                                <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">
                                    Where are you heading?
                                </label>
                                {/* 검색창 */}
                                <div className="relative mb-5">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10" size={20} />
                                    <input
                                        type="text"
                                        placeholder="나라 또는 도시를 검색하세요 (예: Japan, Seoul, Paris)..."
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
                                        { label: 'Japan (Tokyo)', country: 'Japan', city: 'Tokyo', emoji: '🇯🇵' },
                                        { label: 'Japan (Kyoto)', country: 'Japan', city: 'Kyoto', emoji: '🇯🇵' },
                                        { label: 'Japan (Osaka)', country: 'Japan', city: 'Osaka', emoji: '🇯🇵' },
                                        { label: 'South Korea (Seoul)', country: 'South Korea', city: 'Seoul', emoji: '🇰🇷' },
                                        { label: 'South Korea (Busan)', country: 'South Korea', city: 'Busan', emoji: '🇰🇷' },
                                        { label: 'France (Paris)', country: 'France', city: 'Paris', emoji: '🇫🇷' },
                                        { label: 'France (Nice)', country: 'France', city: 'Nice', emoji: '🇫🇷' },
                                        { label: 'Italy (Rome)', country: 'Italy', city: 'Rome', emoji: '🇮🇹' },
                                        { label: 'Italy (Florence)', country: 'Italy', city: 'Florence', emoji: '🇮🇹' },
                                        { label: 'Spain (Barcelona)', country: 'Spain', city: 'Barcelona', emoji: '🇪🇸' },
                                        { label: 'Greece (Santorini)', country: 'Greece', city: 'Santorini', emoji: '🇬🇷' },
                                        { label: 'Thailand (Bangkok)', country: 'Thailand', city: 'Bangkok', emoji: '🇹🇭' },
                                        { label: 'Thailand (Phuket)', country: 'Thailand', city: 'Phuket', emoji: '🇹🇭' },
                                        { label: 'Indonesia (Bali)', country: 'Indonesia', city: 'Bali', emoji: '🇮🇩' },
                                        { label: 'Vietnam (Hanoi)', country: 'Vietnam', city: 'Hanoi', emoji: '🇻🇳' },
                                        { label: 'Vietnam (Ho Chi Minh City)', country: 'Vietnam', city: 'Ho Chi Minh City', emoji: '🇻🇳' },
                                        { label: 'Singapore', country: 'Singapore', city: 'Singapore', emoji: '🇸🇬' },
                                        { label: 'USA (New York)', country: 'USA', city: 'New York', emoji: '🇺🇸' },
                                        { label: 'USA (Los Angeles)', country: 'USA', city: 'Los Angeles', emoji: '🇺🇸' },
                                        { label: 'UAE (Dubai)', country: 'UAE', city: 'Dubai', emoji: '🇦🇪' },
                                        { label: 'Switzerland (Interlaken)', country: 'Switzerland', city: 'Interlaken', emoji: '🇨🇭' },
                                        { label: 'New Zealand (Queenstown)', country: 'New Zealand', city: 'Queenstown', emoji: '🇳🇿' },
                                        { label: 'Australia (Sydney)', country: 'Australia', city: 'Sydney', emoji: '🇦🇺' },
                                        { label: 'UK (London)', country: 'UK', city: 'London', emoji: '🇬🇧' },
                                        { label: 'China (Shanghai)', country: 'China', city: 'Shanghai', emoji: '🇨🇳' },
                                        { label: 'Taiwan (Taipei)', country: 'Taiwan', city: 'Taipei', emoji: '🇹🇼' },
                                        { label: 'Canada (Vancouver)', country: 'Canada', city: 'Vancouver', emoji: '🇨🇦' },
                                        { label: 'Turkey (Istanbul)', country: 'Turkey', city: 'Istanbul', emoji: '🇹🇷' },
                                        { label: 'Morocco (Marrakech)', country: 'Morocco', city: 'Marrakech', emoji: '🇲🇦' },
                                        { label: 'Mexico (Cancun)', country: 'Mexico', city: 'Cancun', emoji: '🇲🇽' },
                                    ];

                                    const q = formData.destination.toLowerCase();
                                    const filtered = q
                                        ? ALL_DESTINATIONS.filter(d =>
                                            d.label.toLowerCase().includes(q) ||
                                            d.country.toLowerCase().includes(q) ||
                                            d.city.toLowerCase().includes(q)
                                        )
                                        : ALL_DESTINATIONS;

                                    if (filtered.length === 0) return (
                                        <div className="text-center py-8 text-gray-400">
                                            <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                                            <p className="font-medium">검색 결과가 없습니다</p>
                                            <p className="text-sm mt-1">입력한 내용을 목적지로 직접 사용할 수 있어요</p>
                                            <button
                                                onClick={() => {/* 그냥 현재 input값 사용 */}}
                                                className="mt-3 px-5 py-2 bg-primary text-secondary rounded-xl font-bold text-sm hover:opacity-90 transition"
                                            >
                                                "{formData.destination}" 사용하기
                                            </button>
                                        </div>
                                    );

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                                            {filtered.map((dest) => {
                                                const isSelected = formData.destination === dest.label;
                                                return (
                                                    <button
                                                        key={dest.label}
                                                        onClick={() => updateData('destination', dest.label)}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all font-medium text-sm w-full
                                                            ${isSelected
                                                                ? 'border-primary bg-primary/10 text-secondary shadow-sm'
                                                                : 'border-gray-100 bg-white text-gray-700 hover:border-primary/40 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <span className="text-xl flex-shrink-0">{dest.emoji}</span>
                                                        <div className="min-w-0">
                                                            <div className={`font-bold truncate ${isSelected ? 'text-primary' : 'text-secondary'}`}>{dest.city}</div>
                                                            <div className="text-xs text-gray-400">{dest.country}</div>
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
                                    {formData.climate.length > 0 ? `${formData.climate.join(' & ')} matches for you:` : "We recommend these for you:"}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(() => {
                                        const allDests = [
                                            { city: 'Kyoto', country: 'Japan', img: 'kyoto,japan', climates: ['Urban', 'Mediterranean'] },
                                            { city: 'Bali', country: 'Indonesia', img: 'bali,indonesia', climates: ['Tropical', 'Oceanic'] },
                                            { city: 'Hokkaido', country: 'Japan', img: 'hokkaido,winter', climates: ['Alpine'] },
                                            { city: 'Nice', country: 'France', img: 'nice,france', climates: ['Mediterranean', 'Oceanic'] },
                                            { city: 'New York', country: 'USA', img: 'newyork,city', climates: ['Urban'] },
                                            { city: 'Seoul', country: 'South Korea', img: 'seoul,korea', climates: ['Urban'] },
                                            { city: 'Santorini', country: 'Greece', img: 'santorini,greece', climates: ['Mediterranean', 'Oceanic'] },
                                            { city: 'Phuket', country: 'Thailand', img: 'phuket,thailand', climates: ['Tropical'] },
                                            { city: 'Interlaken', country: 'Switzerland', img: 'switzerland,alps', climates: ['Alpine'] },
                                            { city: 'Barcelona', country: 'Spain', img: 'barcelona,spain', climates: ['Mediterranean', 'Oceanic'] },
                                            { city: 'Paris', country: 'France', img: 'paris,city', climates: ['Urban'] },
                                            { city: 'Queenstown', country: 'New Zealand', img: 'queenstown,nature', climates: ['Alpine', 'Oceanic'] },
                                            { city: 'St. Moritz', country: 'Switzerland', img: 'switzerland,alps', climates: ['Alpine'] },
                                            { city: 'Dubai', country: 'UAE', img: 'dubai,desert', climates: ['Desert', 'Urban'] }
                                        ];
                                        const filtered = allDests.filter(dest =>
                                            formData.climate.length === 0 ||
                                            dest.climates.some(c => formData.climate.includes(c))
                                        );
                                        // If filtered is less than 8, add from the remaining to make it at least 8
                                        const results = [...filtered];
                                        if (results.length < 8) {
                                            const remaining = allDests.filter(d => !results.some(r => r.city === d.city));
                                            results.push(...remaining.slice(0, 8 - results.length));
                                        }
                                        return results.slice(0, 12).map((dest) => (
                                            <div
                                                key={dest.city}
                                                onClick={() => updateData('destination', `${dest.country} (${dest.city})`)}
                                                className={`
                                                p-3 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all hover:shadow-md
                                                ${formData.destination === `${dest.country} (${dest.city})` ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-primary/50'}
                                            `}
                                            >
                                                <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={`https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=200&h=200&q=${dest.img}`}
                                                        alt={dest.city}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-secondary text-base">{dest.country}</h4>
                                                    <p className="text-sm text-gray-500">{dest.city}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.destination === `${dest.country} (${dest.city})` ? 'border-primary' : 'border-gray-300'}`}>
                                                    {formData.destination === `${dest.country} (${dest.city})` && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                </div>
                                            </div>
                                        ));
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
                            <label className="block text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Travel Dates</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
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
                                    <label className="block text-xs text-gray-400 mb-1">End Date</label>
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
                            <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">Estimated Budget Per Person</label>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm text-gray-400 mb-3">Enter your total budget in USD</p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        placeholder="e.g. 2000"
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
                                        Budget: <span className="text-xl font-black">${Number(formData.budget).toLocaleString()}</span>
                                    </p>
                                )}
                            </div>
                        </section>

                        <section>
                            <label className="block text-base font-bold text-gray-600 mb-3 uppercase tracking-wider">Traveling With</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'Solo', icon: <Users size={24} className="text-gray-400" /> },
                                    { id: 'Couple', icon: <Users size={24} className="text-rose-400" /> },
                                    { id: 'Friends', icon: <Users size={24} className="text-blue-400" /> },
                                    { id: 'Family', icon: <Users size={24} className="text-amber-400" /> }
                                ].map((comp) => (
                                    <Card key={comp.id} selected={formData.companions === comp.id} onClick={() => updateData('companions', comp.id)} className="flex flex-col items-center justify-center gap-2 py-5">
                                        <div className={`p-3 rounded-full ${formData.companions === comp.id ? 'bg-primary/20' : 'bg-gray-50'}`}>{comp.icon}</div>
                                        <span className="font-bold text-secondary text-base">{comp.id}</span>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Extra Questions */}
                        <section className="space-y-6 pt-4 border-t border-gray-100">
                            <label className="block text-base font-bold text-secondary">Final touches to perfect your plan:</label>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Special Occasion?</label>
                                <select
                                    className="w-full p-4 rounded-2xl border-2 border-gray-100 bg-white text-base font-medium text-secondary focus:border-primary focus:outline-none"
                                    onChange={(e) => updateData('occasion', e.target.value)}
                                    value={formData.occasion}
                                >
                                    <option value="">No special occasion</option>
                                    <option value="honeymoon">Honeymoon</option>
                                    <option value="anniversary">Anniversary</option>
                                    <option value="birthday">Birthday Trip</option>
                                    <option value="work">Workcation</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Transport Mode</label>
                                <div className="flex gap-3">
                                    {['Public Transit', 'Rental Car', 'Walking/Uber'].map(opt => (
                                        <button key={opt} onClick={() => updateData('transport', opt)}
                                            className={`flex-1 py-3 px-2 rounded-2xl border-2 text-sm font-bold transition-all
                                            ${formData.transport === opt ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Trip Focus <span className="text-xs font-medium text-gray-400 normal-case tracking-normal">(Select Multiple)</span></label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Culture', 'Nature', 'Food', 'Shopping', 'Relax', 'Adventure'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => toggleArrayItem('focus', opt)}
                                            className={`py-3 px-2 rounded-2xl border-2 text-sm font-bold transition-all
                                            ${formData.focus.includes(opt) ? 'bg-primary text-secondary border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50'}`}
                                        >
                                            {opt}
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
