import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Calendar, Send, MapPin, Star, Plus, Trash2, Edit2, List,
    Clock, MessageCircle, Sparkles, X, Plane, BedDouble, PlusCircle, ChevronDown, ChevronUp,
    Globe, ExternalLink, ChevronRight, Upload, CheckCircle2, DollarSign, Image, FileText, Tag,
    Wallet, Bus, Info
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
    const { t, i18n } = useTranslation();
    const [displayDestination, setDisplayDestination] = useState('');

    // Pre-calculate display destination
    useEffect(() => {
        const raw = data.destination || '';
        const id = data.destinationId || '';
        if (raw.toLowerCase().includes('select destination') || raw.toLowerCase().includes('목적지 선택')) {
            setDisplayDestination(id ? (id.charAt(0).toUpperCase() + id.slice(1)) : '');
            return;
        }
        setDisplayDestination(raw);
    }, [data.destination, data.destinationId, i18n.language]);

    const [itinerary, setItinerary] = useState([]);
    const [destData, setDestData] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [chatOpen, setChatOpen] = useState(false);
    const [publishOpen, setPublishOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const navigate = useNavigate();

    // ── Auth Observer ──
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
        return () => unsub();
    }, []);

    // ── Flights & Hotels State ──
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

    // ── SMART TRAVEL ROUTE PLANNER ENGINE (CORE LOGIC) ──
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
                    const tips = [t('itinerary.tipMorning'), t('itinerary.tipTrap'), t('itinerary.tipSpecialty'), t('itinerary.tipShoes'), t('itinerary.tipTickets')];
                    const transports = [t('itinerary.tipWalk'), t('itinerary.tipBus'), t('itinerary.tipSubway'), t('itinerary.tipTaxi')];
                    return { 
                        recommendationReason: isDining ? t('itinerary.reasonDining', { style: data.dining || 'preferred' }) : t('itinerary.reasonGeneral', { rating: act.rating || 4.5 }),
                        costEstimate: isDining ? '$$' : '$',
                        transportHint: transports[Math.floor(Math.random() * transports.length)],
                        localTip: tips[Math.floor(Math.random() * tips.length)]
                    };
                };

                const days = [];
                for (let i = 0; i < dayCount; i++) {
                    let lastLat = null, lastLng = null;
                    const dayItems = [];
                    for (let j = 0; j < basePerDay; j++) {
                        const pool = allActivities.filter(a => !globalUsed.has(a.name));
                        if (!pool.length) break;
                        const scored = pool.map(act => ({ act, score: scoreActivity(act, lastLat !== null ? calcDist(lastLat, lastLng, act.latitude, act.longitude) : null) })).sort((a, b) => b.score - a.score);
                        const next = scored[0].act;
                        globalUsed.add(next.name);
                        lastLat = next.latitude; lastLng = next.longitude;
                        dayItems.push({ ...next, ...generateItemExtras(next, false), img: getImg(next.name, next.type, data.destination, data.destinationId), id: `${i}-${j}-${Date.now()}`, time: `${9 + j * 2}:00` });
                    }
                    days.push({ id: i, dayNum: i + 1, date: addDays(start, i), theme: t('itinerary.themeDefault'), items: dayItems });
                }

                // ── STEP 1: Text First! Render the itinerary immediately ──
                setItinerary(days);
                saveSearchHistory(data);

                // ── STEP 2: Background Image Fetching (Non-blocking) ──
                setIsLoadingImages(true);
                const citySearch = data.destination.split('(')[0].trim() || data.destination;
                
                (async () => {
                    try {
                        const updatedDays = await Promise.all(days.map(async (day) => {
                            const updatedItems = await Promise.all(day.items.map(async (item) => {
                                // Only fetch if we don't have a specific high-quality dest image or if it's a generic one
                                try {
                                    const imgUrl = await fetchPlaceImage(citySearch, item.name);
                                    return { ...item, img: imgUrl || item.img };
                                } catch { return item; }
                            }));
                            return { ...day, items: updatedItems };
                        }));
                        setItinerary(updatedDays);
                    } finally {
                        setIsLoadingImages(false);
                    }
                })();

            } catch (error) {
                console.error("Critical error in generation:", error);
                setItinerary([]);
            }
        };
        generate();
    }, [data, t]);

    // ── Mutators ──
    const setDayItems = (di, items) => setItinerary(prev => { const n = [...prev]; n[di] = { ...n[di], items }; return n; });
    const updateAct = (di, id, a) => setDayItems(di, itinerary[di].items.map(x => x.id === id ? a : x));
    const deleteAct = (di, id) => setDayItems(di, itinerary[di].items.filter(x => x.id !== id));
    const addAct = (di) => {
        const nm = t('itinerary.newSpotName'), tp = 'City';
        const item = { id: `new-${Date.now()}`, name: nm, time: '12:00', desc: t('itinerary.newSpotDesc'), type: tp, img: getImg(nm, tp, data.destination), isNew: true };
        setDayItems(di, [...itinerary[di].items, item]);
    };

    if (!destData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-6">
            <Navbar />
            <div className="text-2xl font-black text-secondary animate-pulse mt-20">{t('itinerary.curating')}</div>
            <AdPlaceholder className="w-full max-w-2xl h-[250px] shadow-sm" />
        </div>
    );

    const totalSpots = itinerary.reduce((s, d) => s + (d.items || []).length, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />
            
            {/* ── STICKY HEADER ── */}
            <nav className="px-6 md:px-14 py-4 md:h-20 flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white border-b border-gray-200 shadow-sm sticky top-[80px] z-40 gap-4">
                <Link to="/survey" className="flex items-center gap-3 group">
                    <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-primary/10 transition-all"><ChevronLeft size={24} /></div>
                    <div>
                        <h1 className="font-extrabold text-xl md:text-2xl text-secondary">{displayDestination}</h1>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                            <Calendar size={13} className="text-primary" />
                            {safeFormat(data.startDate, 'MMM dd', i18n.language === 'ko' ? ko : enUS)} – {safeFormat(data.endDate, 'MMM dd', i18n.language === 'ko' ? ko : enUS)} · {t('itinerary.days', { count: itinerary.length })}
                        </p>
                    </div>
                </Link>

                <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3">
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                        {['itinerary', 'summary'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white shadow text-secondary' : 'text-gray-500 hover:text-secondary'}`}>
                                {t(`itinerary.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => currentUser ? setPublishOpen(true) : window.confirm(t('itinerary.publishLoginRequired')) && navigate('/login')}
                        className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-primary to-amber-400 text-secondary font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all">
                        <Upload size={18} /> {t('itinerary.publishBtn')}
                    </button>
                </div>
            </nav>

            <main className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-10 flex flex-col lg:flex-row gap-10">
                <aside className="hidden lg:flex flex-col w-72 shrink-0">
                    <div className="sticky top-28 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('itinerary.recommended')}</h3>
                            <AdPlaceholder className="w-full h-[600px] shadow-inner" />
                        </div>
                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {activeTab === 'itinerary' ? (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-14">
                                {itinerary.map((day, di) => (
                                    <div key={day.id}>
                                        <div className="flex items-center gap-5 mb-7">
                                            <div className="w-20 h-20 bg-secondary text-white rounded-3xl flex flex-col items-center justify-center font-black shadow-2xl border-4 border-white/10 shrink-0">
                                                <span className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">{t('itinerary.dayLabel')}</span>
                                                <span className="text-4xl leading-none">{day.dayNum}</span>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl md:text-3xl font-black text-secondary">{safeFormat(day.date, 'EEEE, MMM do', i18n.language === 'ko' ? ko : enUS)}</h2>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <p className="text-sm text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full">{t('itinerary.activitiesCount', { count: (day.items || []).length })}</p>
                                                    <a href={getDayMapUrl(day.items, data.destination)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-black text-white bg-secondary px-4 py-1.5 rounded-full shadow-lg"><MapPin size={14} /><span>{t('itinerary.routeMap')}</span></a>
                                                </div>
                                            </div>
                                        </div>
                                        <Reorder.Group axis="y" values={day.items || []} onReorder={items => setDayItems(di, items)} className="space-y-4">
                                            {day.items.map(act => <ActivityCard key={act.id} activity={act} onSave={a => updateAct(di, act.id, a)} onDelete={() => deleteAct(di, act.id)} />)}
                                        </Reorder.Group>
                                        <button onClick={() => addAct(di)} className="w-full mt-6 py-5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                                            <Plus size={22} /> {t('itinerary.addSpot')}
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <Section title={t('itinerary.flights')} icon={Plane} count={flights.length} onAdd={addFlight} addLabel={t('itinerary.addFlight')}>
                                    {flights.map(f => <FlightCard key={f.id} f={f} onChange={(k, v) => updateFlight(f.id, k, v)} onRemove={() => removeFlight(f.id)} showRemove={flights.length > 1} />)}
                                </Section>
                                <Section title={t('itinerary.accommodation')} icon={BedDouble} count={hotels.length} onAdd={addHotel} addLabel={t('itinerary.addStay')}>
                                    {hotels.map((h, i) => <HotelCard key={h.id} h={h} index={i} onChange={(k, v) => updateHotel(h.id, k, v)} onRemove={() => removeHotel(h.id)} showRemove={hotels.length > 1} />)}
                                </Section>
                                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                     <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                        <h3 className="text-lg font-black text-secondary flex items-center gap-2.5"><List size={18} className="text-primary" /> {t('itinerary.journeyOverview')}</h3>
                                        <div className="flex gap-3">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">{t('itinerary.days', { count: itinerary.length })}</span>
                                            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold">{t('itinerary.spots', { count: totalSpots })}</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    {['day', 'time', 'activity', 'type', 'map'].map(h => <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">{t(`itinerary.col${h.charAt(0).toUpperCase() + h.slice(1)}`)}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {itinerary.map(day => (day.items || []).map((item, idx) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50">
                                                        {idx === 0 && <td rowSpan={day.items.length} className="px-6 py-6 align-top border-r bg-gray-50/30 text-center"><span className="font-black text-primary text-lg">{t('itinerary.dayShort', { count: day.dayNum })}</span></td>}
                                                        <td className="px-6 py-5 text-primary font-bold text-sm">{fmtTime(item.time)}</td>
                                                        <td className="px-6 py-5"><p className="font-black text-secondary text-sm">{item.name}</p><p className="text-xs text-gray-400 truncate max-w-[200px]">{item.desc}</p></td>
                                                        <td className="px-6 py-5"><span className="px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500">{item.type}</span></td>
                                                        <td className="px-6 py-5 text-center"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary"><MapPin size={14} /></a></td>
                                                    </tr>
                                                )))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <aside className="hidden xl:flex flex-col w-72 shrink-0">
                    <div className="sticky top-28 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ExternalLink size={14} /> {t('itinerary.bookingShortcuts')}</h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Skyscanner', icon: Plane, color: 'bg-blue-50 text-blue-600', url: 'https://www.skyscanner.net/' },
                                    { name: 'Agoda', icon: BedDouble, color: 'bg-emerald-50 text-emerald-600', url: `https://www.agoda.com/search?city=${encodeURIComponent(data.destination)}` }
                                ].map((link, idx) => (
                                    <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 hover:shadow-md transition-all group">
                                        <div className={`w-10 h-10 ${link.color} rounded-xl flex items-center justify-center`}><link.icon size={20} /></div>
                                        <div className="flex-1 min-w-0"><p className="text-sm font-black text-secondary truncate">{link.name}</p><p className="text-[10px] font-bold text-gray-400">{t('itinerary.bookNowLabel')}</p></div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-primary" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            <button onClick={() => setChatOpen(true)} className="fixed bottom-7 right-7 w-14 h-14 bg-primary text-secondary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"><MessageCircle size={28} /></button>
            <AIChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} destination={data.destination} />
            <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} itinerary={itinerary} data={data} flights={flights} hotels={hotels} user={currentUser} />
        </div>
    );
};

export default Itinerary;
