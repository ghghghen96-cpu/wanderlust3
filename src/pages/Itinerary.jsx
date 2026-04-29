import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Calendar, MapPin, Plus, List,
    MessageCircle, X, Plane, BedDouble,
    ExternalLink, ChevronRight, Upload, Map
} from 'lucide-react';
import { addDays, differenceInDays } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DESTINATION_DATA } from '../data';
import { saveSearchHistory } from '../utils/history';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchPlaceImage } from '../utils/imageApi';

// Modular Components
import ActivityCard from '../components/itinerary/ActivityCard';
import AIChatModal from '../components/itinerary/AIChatModal';
import PublishModal from '../components/itinerary/PublishModal';
import FlightCard from '../components/itinerary/FlightCard';
import HotelCard from '../components/itinerary/HotelCard';
import MapView from '../components/itinerary/MapView';
import { Section, AdPlaceholder } from '../components/itinerary/ItineraryComponents';

// Helpers
import { 
    getImg, 
    fmtTime, 
    calcDist, 
    safeFormat, 
    getDayMapUrl 
} from '../utils/itineraryHelpers';

/**
 * Main Itinerary Page
 * High-performance, progressive rendering architecture.
 */
const Itinerary = () => {
    const { state: data } = useLocation();
    const { t, i18n } = useTranslation('translation', { keyPrefix: 'itinerary' });
    const [displayDestination, setDisplayDestination] = useState('');

    // Pre-calculate display destination
    useEffect(() => {
        const raw = data.destination || '';
        const id = data.destinationId || '';

        // If we have a destinationId, try to get the translated name first
        if (id) {
            const cityKey = id.toLowerCase();
            const translatedCity = i18n.t(`survey.destinations.${cityKey}`);
            
            // Check if translation exists (not returning the key itself)
            if (translatedCity && translatedCity !== `survey.destinations.${cityKey}`) {
                setDisplayDestination(translatedCity);
                return;
            }
        }

        if (raw.toLowerCase().includes('select destination') || raw.toLowerCase().includes('紐⑹쟻吏 ?좏깮')) {
            setDisplayDestination(id ? (id.charAt(0).toUpperCase() + id.slice(1)) : '');
            return;
        }
        setDisplayDestination(raw);
    }, [data.destination, data.destinationId, i18n.language, t]);

    const [itinerary, setItinerary] = useState([]);
    const [destData, setDestData] = useState(null);
    const [activeTab, setActiveTab] = useState('map'); // 기본 맵 모드
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const [chatOpen, setChatOpen] = useState(false);
    const [publishOpen, setPublishOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // 모바일 바텀시트 관련 상태
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [isSheetExpanded, setIsSheetExpanded] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ?€?€ Auth Observer ?€?€
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
        return () => unsub();
    }, []);

    // ?? Flights & Hotels State ??
    const [flights, setFlights] = useState(() => {
        try { const s = localStorage.getItem(`flights_v2_${data.destination}`); if (s) return JSON.parse(s); } catch { }
        return [{ id: Date.now(), type: 'Outbound', from: '', to: '', number: '', time: '', notes: '' }];
    });

    const [hotels, setHotels] = useState(() => {
        try { const s = localStorage.getItem(`hotels_v2_${data.destination}`); if (s) return JSON.parse(s); } catch { }
        return [{ id: Date.now(), name: '', address: '', confirmation: '', checkin: '', checkout: '' }];
    });

    useEffect(() => { localStorage.setItem(`flights_v2_${data.destination}`, JSON.stringify(flights)); }, [flights, data.destination]);
    useEffect(() => { localStorage.setItem(`hotels_v2_${data.destination}`, JSON.stringify(hotels)); }, [hotels, data.destination]);

    const addFlight = () => setFlights(fs => [...fs, { id: Date.now(), type: 'Outbound', from: '', to: '', number: '', time: '', notes: '' }]);
    const removeFlight = (id) => setFlights(fs => fs.filter(f => f.id !== id));
    const updateFlight = (id, k, v) => setFlights(fs => fs.map(f => f.id === id ? { ...f, [k]: v } : f));

    const addHotel = () => setHotels(hs => [...hs, { id: Date.now(), name: '', address: '', confirmation: '', checkin: '', checkout: '' }]);
    const removeHotel = (id) => setHotels(hs => hs.filter(h => h.id !== id));
    const updateHotel = (id, k, v) => setHotels(hs => hs.map(h => h.id === id ? { ...h, [k]: v } : h));

    // ?? SMART TRAVEL ROUTE PLANNER ENGINE (CORE LOGIC) ??
    useEffect(() => {
        const generate = async () => {
            try {
                const raw = (data.destination || '').toLowerCase().trim();
                const idMatch = (data.destinationId || '').toLowerCase().trim();

                // 1. Fuzzy Destination Matching
                let matchKey = null;
                if (idMatch) {
                    matchKey = Object.keys(DESTINATION_DATA).find(k => k !== 'default' && (k === idMatch || k.includes(`(${idMatch})`) || idMatch.includes(k)));
                }
                if (!matchKey) matchKey = Object.keys(DESTINATION_DATA).find(k => k !== 'default' && raw === k);
                if (!matchKey) {
                    const rawBase = raw.split('(')[0].trim();
                    matchKey = Object.keys(DESTINATION_DATA).find(k => k !== 'default' && (raw.includes(k) || rawBase.includes(k) || k.includes(rawBase)));
                }

                const sd = (matchKey && DESTINATION_DATA[matchKey]) || DESTINATION_DATA['default'];
                setDestData(sd);

                const start = new Date(data.startDate);
                const end = new Date(data.endDate);
                const dayCount = Math.max(differenceInDays(end, start) + 1, 1);
                
                if (!sd || !sd.activities) return;

                const allActivities = [...sd.activities];
                const globalUsed = new Set();
                const BASE_PER_DAY = { 'Relaxed': 2, 'Packed': 4, 'Balanced': 3 };
                let basePerDay = BASE_PER_DAY[data.pace] || 3;
                if (['Chill', 'Chill Wanderer'].includes(data.vibe)) basePerDay = Math.max(2, basePerDay - 1);
                if (['Active', 'Active Explorer'].includes(data.vibe)) basePerDay = Math.min(5, basePerDay + 1);

                const VIBE_PREFS = {
                    'Chill': ['Relax', 'Nature', 'Culture'], 'Chill Wanderer': ['Relax', 'Nature', 'Culture'],
                    'Active': ['Nature', 'City', 'Culture'], 'Active Explorer': ['Nature', 'City', 'Culture'],
                    'Social': ['City', 'Food', 'Culture'], 'Quiet': ['Nature', 'Relax', 'Culture'],
                };
                const prefTypes = VIBE_PREFS[data.vibe] || [];
                const focusTypes = Array.isArray(data.focus) ? data.focus : [];

                const scoreActivity = (act, distKm) => {
                    let score = (act.rating || 4.0) * 10;
                    if (focusTypes.some(f => act.type?.toLowerCase().includes(f.toLowerCase()))) score += 30;
                    if (prefTypes.includes(act.type)) score += 20;
                    if (distKm !== null) score += Math.max(0, 50 - distKm * 2.5);
                    return score + Math.random() * 5;
                };

                const DINING_SPOTS = {
                    'Fine Dining': [{ name: 'Fine Dining Dinner', type: 'Food', rating: 4.9 }, { name: 'Upscale Lunch', type: 'Food', rating: 4.8 }],
                    'Street Food': [{ name: 'Local Street Food Tour', type: 'Food', rating: 4.7 }, { name: 'Night Market Eats', type: 'Food', rating: 4.6 }],
                    'Cafe Culture': [{ name: 'Specialty Coffee & Brunch', type: 'Food', rating: 4.7 }, { name: 'Afternoon Cafe', type: 'Food', rating: 4.6 }],
                };
                const diningSlots = DINING_SPOTS[data.dining] || [];
                const globalDiningUsed = new Set();

                const generateItemExtras = (act, isDining) => {
                    const tips = [t('tipMorning'), t('tipTrap'), t('tipSpecialty'), t('tipShoes'), t('tipTickets')];
                    const transports = [t('tipWalk'), t('tipBus'), t('tipSubway'), t('tipTaxi')];
                    
                    // Identify which user interest this matches for personalized reasoning
                    const matchedFocus = focusTypes.find(f => act.type?.toLowerCase().includes(f.toLowerCase()));
                    
                    let recReason = t('reasonGeneral', { rating: act.rating || 4.5 });
                    if (isDining) {
                        recReason = t('reasonDining', { style: data.dining || 'preferred' });
                    } else if (matchedFocus) {
                        // Localize the focus name for the reason string
                        const focusLabel = t(`theme${matchedFocus}`) || matchedFocus;
                        recReason = t('reasonFocusMatch', { focus: focusLabel });
                    }

                    return { 
                        recommendationReason: recReason,
                        costEstimate: isDining ? '$$' : '$',
                        transportHint: transports[Math.floor(Math.random() * transports.length)],
                        localTip: tips[Math.floor(Math.random() * tips.length)]
                    };
                };

                const foodPool = allActivities.filter(a => a.type === 'Food' || a.category === 'Food');
                const usedFood = new Set();

                const getMealRecommendation = (mealType, lastLat, lastLng) => {
                    const pool = foodPool.filter(a => !usedFood.has(a.name));
                    let picks = [];
                    if (pool.length >= 2) {
                        picks = pool.sort((a, b) => {
                            const da = lastLat ? calcDist(lastLat, lastLng, a.latitude, a.longitude) : 0;
                            const db = lastLat ? calcDist(lastLat, lastLng, b.latitude, b.longitude) : 0;
                            return da - db;
                        }).slice(0, 2);
                    } else {
                        picks = [
                            { name: `${data.destination} Popular ${mealType} 1`, type: 'Food', rating: 4.8, desc: "A top-rated spot from Google Maps popular lists.", desc_ko: "Google Maps 추천 인기 맛집입니다." },
                            { name: `${data.destination} Local ${mealType} 2`, type: 'Food', rating: 4.7, desc: "Traditional flavors with excellent atmosphere.", desc_ko: "분위기와 맛을 모두 갖춘 현지 추천 장소입니다." }
                        ];
                    }
                    picks.forEach(p => usedFood.add(p.name));
                    
                    const time = mealType === 'Breakfast' ? '08:30' : (mealType === 'Lunch' ? '12:30' : '18:30');
                    return {
                        id: `meal-${mealType}-${Date.now()}-${Math.random()}`,
                        name: t(`meal${mealType}`, { defaultValue: `${mealType} Recommendation` }),
                        type: 'Food',
                        time,
                        desc: `- ${t('mealOptionTitle') || 'Meal Options'}:\n1. ${picks[0].name} (${picks[0].rating} / 5.0)\n2. ${picks[1].name} (${picks[1].rating} / 5.0)\n\n* ${t('mealSource') || 'Data from Google Places'}`,
                        desc_ko: `- ${t('mealOptionTitle') || '식사 옵션'}:\n1. ${picks[0].name_ko || picks[0].name} (${picks[0].rating} / 5.0)\n2. ${picks[1].name_ko || picks[1].name} (${picks[1].rating} / 5.0)\n\n* ${t('mealSource') || 'Google Maps 기반 추천'}`,
                        img: getImg(picks[0].name, 'Food', data.destination, data.destinationId),
                        latitude: picks[0].latitude,
                        longitude: picks[0].longitude
                    };
                };

                const days = [];
                for (let i = 0; i < dayCount; i++) {
                    let lastLat = null, lastLng = null;
                    const dayItems = [];
                    
                    // Add Breakfast if Packed
                    if (data.pace === 'Packed') {
                        dayItems.push(getMealRecommendation('Breakfast', lastLat, lastLng));
                    }

                    // Activities & Lunch/Dinner
                    const actsForDay = [];
                    for (let j = 0; j < basePerDay; j++) {
                        const pool = allActivities.filter(a => !globalUsed.has(a.name) && a.type !== 'Food');
                        if (!pool.length) break;
                        
                        const scored = pool.map(act => ({ 
                            act, 
                            score: scoreActivity(act, lastLat !== null ? calcDist(lastLat, lastLng, act.latitude, act.longitude) : null) 
                        })).sort((a, b) => b.score - a.score);
                        
                        let next = scored[0].act;
                        globalUsed.add(next.name);
                        lastLat = next.latitude; lastLng = next.longitude;
                        
                        const extras = generateItemExtras(next, false);
                        const itemTime = `${10 + j * 2.5}:00`; // Dynamic time based on index
                        
                        actsForDay.push({ 
                            ...next, 
                            ...extras, 
                            img: getImg(next.name, next.type, data.destination, data.destinationId), 
                            id: `${i}-${j}-${Date.now()}`, 
                            time: itemTime
                        });
                    }

                    // Construct final day list with meals injected between activities
                    if (actsForDay.length > 0) {
                        dayItems.push(actsForDay[0]); // Morning activity
                        dayItems.push(getMealRecommendation('Lunch', actsForDay[0].latitude, actsForDay[0].longitude));
                        
                        if (actsForDay.length > 1) {
                            dayItems.push(actsForDay[1]); // Afternoon activity
                        }
                        
                        // Add more activities if any
                        for (let k = 2; k < actsForDay.length; k++) {
                            dayItems.push(actsForDay[k]);
                        }

                        dayItems.push(getMealRecommendation('Dinner', dayItems[dayItems.length-1].latitude, dayItems[dayItems.length-1].longitude));
                    }

                    // Sort by time just in case
                    const sortedDayItems = dayItems.sort((a, b) => a.time.localeCompare(b.time));

                    days.push({ id: i, dayNum: i + 1, date: addDays(start, i), theme: t('themeDefault'), items: sortedDayItems });
                }

                // ?? Text First! Render the itinerary immediately ??
                setItinerary(days);
                saveSearchHistory(data);

            } catch (error) {
                console.error("Critical error in generation:", error);
                setItinerary([]);
            }
        };
        generate();
    }, [data, t]);

    // ?? Mutators ??
    const setDayItems = (di, items) => setItinerary(prev => { const n = [...prev]; n[di] = { ...n[di], items }; return n; });
    const updateAct = (di, id, a) => setDayItems(di, itinerary[di].items.map(x => x.id === id ? a : x));
    const deleteAct = (di, id) => setDayItems(di, itinerary[di].items.filter(x => x.id !== id));
    const addAct = (di) => {
        const nm = t('newSpotName'), tp = 'City';
        const item = { id: `new-${Date.now()}`, name: nm, time: '12:00', desc: t('newSpotDesc'), type: tp, img: null, isNew: true };
        setDayItems(di, [...itinerary[di].items, item]);
    };
    // 吏?꾩뿉??洹쇱쿂 ?μ냼瑜??쇱젙??異붽?
    const addItemToDay = useCallback((di, newItem) => {
        setItinerary(prev => {
            const n = [...prev];
            if (n[di]) n[di] = { ...n[di], items: [...(n[di].items || []), newItem] };
            return n;
        });
    }, []);

    if (!destData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-6">
            <Navbar />
            <div className="text-2xl font-black text-secondary animate-pulse mt-20">{t('curating')}</div>
            <AdPlaceholder className="w-full max-w-2xl h-[250px] shadow-sm" />
        </div>
    );

    const totalSpots = itinerary.reduce((s, d) => s + (d.items || []).length, 0);

    const activeDay = itinerary[activeDayIndex];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            
            {/* ?? ?ㅽ겕 ?ㅻ뜑 ?? */}
            <nav className="px-5 h-16 flex items-center justify-between bg-white border-b border-gray-100 shadow-sm sticky top-[80px] z-40">
                <Link to="/survey" className="flex items-center gap-3 group">
                    <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-amber-50 transition-all"><ChevronLeft size={20} className="text-gray-600"/></div>
                    <div>
                        <h1 className="font-extrabold text-xl text-gray-900">{displayDestination}</h1>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                            <Calendar size={11} className="text-amber-400"/>
                            {safeFormat(data.startDate,'MMM dd',i18n.language==='ko'?ko:enUS)} - {safeFormat(data.endDate,'MMM dd',i18n.language==='ko'?ko:enUS)} | {t('days',{count:itinerary.length, defaultValue: itinerary.length + ' days'})}
                        </p>
                    </div>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {[{id:'map',label:'Map'},{id:'itinerary',label:'List'},{id:'summary',label:'Summary'}].map(tab=>(
                            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab===tab.id?'bg-amber-400 text-gray-900':'text-gray-400 hover:text-white'}`}>{tab.label}</button>
                        ))}
                    </div>
                    <button onClick={()=>currentUser?setPublishOpen(true):window.confirm(t('publishLoginRequired'))&&navigate('/login')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 font-black text-xs rounded-xl shadow-lg hover:shadow-xl transition-all">
                        <Upload size={15}/> {t('publishBtn')}
                    </button>
                </div>
            </nav>

            {/* ?? 硫붿씤 肄섑뀗痢??                {activeTab==='map' ? (
                    <motion.div key="map" initial={{opacity:0}} animate={{opacity:1}} className="flex w-full h-full relative overflow-hidden">
                        
                        {/* 지도 영역 (모바일: 전체화면, 데스크톱: 우측 65%) */}
                        <div className={`relative ${isMobile ? 'w-full h-full absolute inset-0 z-0' : 'flex-1 order-2'}`}>
                            <MapView
                                key={`map-day-${activeDayIndex}`}
                                dayItems={activeDay?.items||[]}
                                activeDayIndex={activeDayIndex}
                                destination={displayDestination}
                                onAddPlace={addItemToDay}
                            />
                        </div>

                        {/* 사이드바 / 바텀시트 콘텐츠 (일정 리스트) */}
                        {isMobile ? (
                            <motion.div
                                drag="y"
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(e, info) => {
                                    if (info.offset.y < -50) setIsSheetExpanded(true);
                                    if (info.offset.y > 50) setIsSheetExpanded(false);
                                }}
                                animate={isSheetExpanded ? "expanded" : "collapsed"}
                                variants={{
                                    collapsed: { y: "calc(100% - 140px)" }, // 140px만 보이게
                                    expanded: { y: "15%" } // 전체의 85% 차지
                                }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute bottom-0 left-0 w-full h-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-20 flex flex-col overflow-hidden"
                            >
                                {/* 드래그 핸들 */}
                                <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing shrink-0 bg-white" onClick={() => setIsSheetExpanded(!isSheetExpanded)}>
                                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                                </div>
                                {/* 콘텐츠 영역 */}
                                <div className="flex-1 overflow-hidden flex flex-col pointer-events-auto">
                                    {/* 날짜 탭 */}
                                    <div className="flex overflow-x-auto gap-2 px-4 pb-3 border-b border-gray-100 scrollbar-hide shrink-0">
                                        {itinerary.map((day,di)=>(
                                            <button key={day.id} onClick={(e)=>{ e.stopPropagation(); setActiveDayIndex(di); }}
                                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeDayIndex===di?'bg-amber-400 text-white shadow':'bg-gray-100 text-gray-500'}`}>
                                                Day {day.dayNum}
                                            </button>
                                        ))}
                                    </div>
                                    {/* 날짜 제목 */}
                                    {activeDay && (
                                        <div className="px-4 py-3 border-b border-gray-100 bg-white shrink-0">
                                            <h2 className="text-gray-900 font-black text-sm">{safeFormat(activeDay.date,'EEEE, MMM do',i18n.language==='ko'?ko:enUS)}</h2>
                                            <p className="text-gray-500 text-xs">{(activeDay.items||[]).length} places</p>
                                        </div>
                                    )}
                                    {/* 타임라인 */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3" onPointerDownCapture={(e) => {
                                        // 리스트 내부 스크롤 시 바텀시트 드래그가 방해받지 않도록 중단
                                        e.stopPropagation();
                                    }}>
                                        {(activeDay?.items||[]).map((act,idx)=>(
                                            <motion.div key={act.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:idx*0.05}}
                                                className="flex items-start gap-3 p-3 bg-white hover:bg-amber-50 rounded-2xl border border-gray-100 transition-all group shadow-sm">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-lg"
                                                    style={{backgroundColor:['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316'][idx%8],color:'#fff'}}>
                                                    {idx+1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-900 font-bold text-sm truncate">{act.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-amber-500 text-xs font-bold">{act.time||'09:00'}</span>
                                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-bold uppercase">{act.type}</span>
                                                    </div>
                                                    {act.desc&&<p className="text-gray-400 text-xs mt-1 line-clamp-2">{act.desc}</p>}
                                                </div>
                                                <button onClick={(e)=>{ e.stopPropagation(); deleteAct(activeDayIndex,act.id); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-500 hover:text-white transition-all shrink-0">
                                                    <X size={12}/>
                                                </button>
                                            </motion.div>
                                        ))}
                                        <button onClick={()=>addAct(activeDayIndex)} className="w-full py-4 border border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center gap-2 text-xs font-bold">
                                            <Plus size={14}/> {t('addSpot')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="w-[35%] flex flex-col bg-gray-50 border-r border-gray-100 overflow-hidden order-1">
                                {/* 날짜 탭 */}
                                <div className="flex overflow-x-auto gap-2 p-3 border-b border-gray-100 scrollbar-hide bg-white">
                                    {itinerary.map((day,di)=>(
                                        <button key={day.id} onClick={()=>setActiveDayIndex(di)}
                                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeDayIndex===di?'bg-amber-400 text-white shadow':'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}>
                                            Day {day.dayNum}
                                        </button>
                                    ))}
                                </div>
                                {/* 날짜 제목 */}
                                {activeDay && (
                                    <div className="px-4 py-3 border-b border-gray-100 bg-white">
                                        <h2 className="text-gray-900 font-black text-sm">{safeFormat(activeDay.date,'EEEE, MMM do',i18n.language==='ko'?ko:enUS)}</h2>
                                        <p className="text-gray-500 text-xs">{(activeDay.items||[]).length} places</p>
                                    </div>
                                )}
                                {/* 타임라인 (데스크톱) */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {(activeDay?.items||[]).map((act,idx)=>(
                                        <motion.div key={act.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:idx*0.05}}
                                            className="flex items-start gap-3 p-3 bg-white hover:bg-amber-50 rounded-2xl border border-gray-100 transition-all group shadow-sm">
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-lg"
                                                style={{backgroundColor:['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316'][idx%8],color:'#fff'}}>
                                                {idx+1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 font-bold text-sm truncate">{act.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-amber-500 text-xs font-bold">{act.time||'09:00'}</span>
                                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-bold uppercase">{act.type}</span>
                                                </div>
                                                {act.desc&&<p className="text-gray-400 text-xs mt-1 line-clamp-2">{act.desc}</p>}
                                            </div>
                                            <button onClick={()=>deleteAct(activeDayIndex,act.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0">
                                                <X size={12}/>
                                            </button>
                                        </motion.div>
                                    ))}
                                    <button onClick={()=>addAct(activeDayIndex)} className="w-full py-3 border border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center gap-2 text-xs font-bold">
                                        <Plus size={14}/> {t('addSpot')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : activeTab==='itinerary' ? (
                    <motion.div key="list" initial={{opacity:0}} animate={{opacity:1}} className="flex-1 overflow-y-auto bg-slate-50">
                        <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">
                            {itinerary.map((day,di)=>(
                                <div key={day.id}>
                                    <div className="flex items-center gap-5 mb-7">
                                        <div className="w-20 h-20 bg-secondary text-white rounded-3xl flex flex-col items-center justify-center font-black shadow-2xl shrink-0">
                                            <span className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">{t('dayLabel')}</span>
                                            <span className="text-4xl leading-none">{day.dayNum}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-secondary">{safeFormat(day.date,'EEEE, MMM do',i18n.language==='ko'?ko:enUS)}</h2>
                                            <p className="text-sm text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full mt-2 inline-block">{t('activitiesCount',{count:(day.items||[]).length})}</p>
                                        </div>
                                    </div>
                                    <Reorder.Group axis="y" values={day.items||[]} onReorder={items=>setDayItems(di,items)} className="space-y-4">
                                        {day.items.map(act=>(
                                            <ActivityCard key={act.id} activity={act} onSave={a=>updateAct(di,act.id,a)} onDelete={()=>deleteAct(di,act.id)} destination={displayDestination} destinationId={data.destinationId}/>
                                        ))}
                                    </Reorder.Group>
                                    <button onClick={()=>addAct(di)} className="w-full mt-6 py-5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                                        <Plus size={22}/> {t('addSpot')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="summary" initial={{opacity:0}} animate={{opacity:1}} className="flex-1 overflow-y-auto bg-slate-50">
                        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                            <Section title={t('flights')} icon={Plane} count={flights.length} onAdd={addFlight} addLabel={t('addFlight')}>
                                {flights.map(f=><FlightCard key={f.id} f={f} onChange={(k,v)=>updateFlight(f.id,k,v)} onRemove={()=>removeFlight(f.id)} showRemove={flights.length>1}/>)}
                            </Section>
                            <Section title={t('accommodation')} icon={BedDouble} count={hotels.length} onAdd={addHotel} addLabel={t('addStay')}>
                                {hotels.map((h,i)=><HotelCard key={h.id} h={h} index={i} onChange={(k,v)=>updateHotel(h.id,k,v)} onRemove={()=>removeHotel(h.id)} showRemove={hotels.length>1}/>)}
                            </Section>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Chat icon removed per user request */}
            <PublishModal isOpen={publishOpen} onClose={()=>setPublishOpen(false)} itinerary={itinerary} data={data} flights={flights} hotels={hotels} user={currentUser}/>
        </div>
    );
};

export default Itinerary;
