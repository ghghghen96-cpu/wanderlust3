import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Calendar, Send, MapPin, Star, Plus, Trash2, Edit2, List,
    Clock, MessageCircle, Sparkles, X, Plane, BedDouble, PlusCircle, ChevronDown, ChevronUp,
    Globe, ExternalLink, ChevronRight, Upload, CheckCircle2, DollarSign, Image, FileText, Tag
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DESTINATION_DATA } from '../data';
import { saveSearchHistory } from '../utils/history';
import { auth, publishToMarketplace } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ─── ADVERTISEMENT PLACEHOLDER ────────────────────────────────────────────────
const AdPlaceholder = ({ className = '', style = {} }) => {
    const { t } = useTranslation();
    return (
        <div className={`bg-gray-100 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 font-bold overflow-hidden relative ${className}`} style={style}>
            <span className="text-[10px] uppercase tracking-widest absolute top-2 right-3 text-gray-400">{t('itinerary.recommended')}</span>
            <div className="flex flex-col items-center gap-2 mt-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    );
};

// ─── IMAGE LIBRARY ───────────────────────────────────────────────────────────
const IMAGE_LIBRARY = {
    food: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800", "https://images.unsplash.com/photo-1626804475297-411db142642a?q=80&w=800"],
    nature: ["https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800", "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800", "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800"],
    city: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800", "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=800", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800"],
    culture: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800", "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800", "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"],
    relax: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800"],
    market: ["https://images.unsplash.com/photo-1533920143825-963ad2b4122d?q=80&w=800"],
    tower: ["https://images.unsplash.com/photo-1572589028889-d584346e339b?q=80&w=800"],
    park: ["https://images.unsplash.com/photo-1513889961551-628c115e2eb3?q=80&w=800"],
    default: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800",
};

const getImg = (name = '', type = '') => {
    const n = name.toLowerCase();
    if (n.includes('market')) return IMAGE_LIBRARY.market[0];
    if (n.includes('tower') || n.includes('tree')) return IMAGE_LIBRARY.tower[0];
    if (n.includes('park') || n.includes('garden')) return IMAGE_LIBRARY.park[0];
    const arr = IMAGE_LIBRARY[type.toLowerCase()];
    if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
    return IMAGE_LIBRARY.default;
};


// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const calcDist = (la1, lo1, la2, lo2) => {
    if (!la1 || !lo1 || !la2 || !lo2) return 999999;
    const R = 6371, toRad = (v) => v * Math.PI / 180;
    const dLa = toRad(la2 - la1), dLo = toRad(lo2 - lo1);
    const a = Math.sin(dLa / 2) ** 2 + Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLo / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getDayMapUrl = (items, dest) => {
    if (!items || items.length === 0) return '#';
    
    // 각 아이템을 좌표가 있으면 좌표로, 없으면 이름+목적지로 변환
    const spots = items.map(a => 
        (a.latitude && a.longitude) 
            ? `${a.latitude},${a.longitude}` 
            : `${a.name} ${dest || ''}`
    );
    
    const origin = encodeURIComponent(spots[0]);
    const destination = encodeURIComponent(spots[spots.length - 1]);
    
    // 중간 경유지 설정
    let waypoints = '';
    if (spots.length > 2) {
        waypoints = `&waypoints=${encodeURIComponent(spots.slice(1, -1).join('|'))}`;
    }
    
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`;
};

// ─── ACTIVITY CARD ────────────────────────────────────────────────────────────
const ActivityCard = ({ activity, onSave, onDelete, destination }) => {
    const { t } = useTranslation();
    const [editing, setEditing] = useState(activity.isNew || false);
    const [ed, setEd] = useState(activity);
    const [timeEdit, setTimeEdit] = useState(false);
    const timeRef = useRef(null);
    const dc = useDragControls();

    const save = () => { onSave({ ...ed, img: getImg(ed.name, ed.type), isNew: false }); setEditing(false); };

    // commit inline time change → triggers auto-sort in parent
    const commitTime = (val) => {
        setTimeEdit(false);
        if (val) onSave({ ...activity, time: val });
    };

    if (editing) return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-primary/20 space-y-4">
            <div className="flex gap-3 items-center">
                <input autoFocus value={ed.name} onChange={e => setEd({ ...ed, name: e.target.value })}
                    className="flex-1 font-black text-2xl border-b-2 border-gray-200 focus:outline-none px-1 py-1 text-secondary" placeholder={t('itinerary.newSpotName')} />
                <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('itinerary.colTime')}</span>
                    <input type="time" value={ed.time} onChange={e => setEd({ ...ed, time: e.target.value })}
                        className="font-bold text-base text-primary bg-primary/5 rounded-lg px-3 py-2 outline-none border border-primary/20 focus:ring-2 focus:ring-primary/30" />
                </div>
            </div>
            <textarea value={ed.desc} onChange={e => setEd({ ...ed, desc: e.target.value })} rows={2}
                className="w-full text-sm text-gray-600 border border-gray-200 rounded-xl p-3 focus:outline-none bg-gray-50 resize-none" />
            <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)} className="px-5 py-2 text-gray-500 font-bold text-sm">{t('itinerary.btnCancel')}</button>
                <button onClick={save} className="px-6 py-2 bg-primary text-secondary rounded-xl font-bold text-sm">{t('itinerary.btnSave')}</button>
            </div>
        </div>
    );

    return (
        <Reorder.Item value={activity} id={activity.id} dragListener={false} dragControls={dc} className="group">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {/* top stretch for mobile, or left for desktop */}
                <div className="flex items-center justify-between w-full sm:w-auto">
                    {/* drag handle */}
                    <div onPointerDown={e => dc.start(e)} className="cursor-move p-2 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                        <List size={20} />
                    </div>
                    {/* action buttons (mobile only) */}
                    <div className="flex sm:hidden gap-1">
                        <button onClick={() => setEditing(true)} className="p-2.5 text-blue-400 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 size={18} /></button>
                        <button onClick={onDelete} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                    </div>
                </div>

                {/* image */}
                <div className="w-full sm:w-24 h-48 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner">
                    <img src={activity.img || getImg(activity.name, activity.type)} alt={activity.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {/* Removed Rating Overlay */}
                </div>

                {/* info */}
                <div className="flex-1 min-w-0 w-full">
                    <h3 className="font-black text-secondary text-xl truncate group-hover:text-primary transition-colors">{activity.name}</h3>

                    {/* ── INLINE TIME ── */}
                    <div className="mt-1">
                        {timeEdit ? (
                            <input
                                ref={timeRef}
                                type="time"
                                defaultValue={activity.time}
                                autoFocus
                                onBlur={e => commitTime(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') commitTime(e.target.value);
                                    if (e.key === 'Escape') setTimeEdit(false);
                                }}
                                className="text-sm font-bold text-primary bg-primary/5 border border-primary/30 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        ) : (
                            <button
                                onClick={() => setTimeEdit(true)}
                                title={t('itinerary.setTime')}
                                className="inline-flex items-center gap-1.5 text-primary font-bold text-xs px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
                            >
                                <Clock size={12} />
                                {fmtTime(activity.time) || t('itinerary.setTime')}
                                <span className="text-[9px] text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">✎</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500 truncate">{activity.desc}</p>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${activity.latitude && activity.longitude ? `${activity.latitude},${activity.longitude}` : encodeURIComponent(activity.name + ' ' + (destination || ''))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-primary transition-colors bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100"
                        >
                            <MapPin size={10} /> {t('itinerary.maps')}
                        </a>
                    </div>
                </div>

                {/* action buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => setEditing(true)} className="p-2.5 text-blue-400 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 size={18} /></button>
                    <button onClick={onDelete} className="p-2.5 text-red-400  hover:bg-red-50  rounded-xl transition-colors"><Trash2 size={18} /></button>
                </div>
            </div>
        </Reorder.Item>
    );
};

// ─── AI CHAT MODAL ────────────────────────────────────────────────────────────
const AIChatModal = ({ isOpen, onClose, destination }) => {
    const { t } = useTranslation();
    const [msgs, setMsgs] = useState([{ role: 'assistant', text: t('itinerary.chatBotGreeting', { destination }) }]);
    const [inp, setInp] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, isOpen]);

    const REPLIES = [
        { keywords: ['food', 'eat', 'restaurant', 'dining'], reply: 'Check out the local markets and food streets in your itinerary! You can find more info at [Seoul Food Guide](https://www.visitseoul.net).' },
        { keywords: ['hotel', 'stay', 'accommodation', 'sleep'], reply: 'You can find accommodation info in the Summary tab. For direct bookings, visit [Hotels.com](https://www.hotels.com) or [Airbnb](https://www.airbnb.com).' },
        { keywords: ['weather', 'climate', 'temperature'], reply: 'I recommend checking [AccuWeather](https://www.accuweather.com) a week before your trip for the most accurate info.' },
        { keywords: ['transport', 'bus', 'train', 'taxi', 'metro'], reply: 'Local transport options vary! Check [Google Maps](https://www.google.com/maps) or local transit sites like [T-Money](https://www.t-money.co.kr) for Seoul.' },
        { keywords: ['budget', 'cost', 'money', 'price'], reply: 'Budgeting tips are available at [Lonely Planet](https://www.lonelyplanet.com). Street food and public transport save the most money!' },
        { keywords: ['safe', 'safety', 'crime', 'danger'], reply: 'Most tourist areas are safe. See [Travel Advisories](https://travel.state.gov) for official safety information.' },
    ];

    const send = () => {
        try {
            const text = inp.trim();
            if (!text) return;
            // 입력값을 먼저 로컬에 저장 후 초기화
            const updatedMsgs = [...msgs, { role: 'user', text }];
            setMsgs(updatedMsgs);
            setInp('');
            setLoading(true);
            setTimeout(() => {
                try {
                    const lower = text.toLowerCase();
                    const matched = REPLIES.find(r => r.keywords.some(k => lower.includes(k)));
                    const reply = matched
                        ? matched.reply
                        : `Great question about "${text}"! I suggest exploring local guides or asking your hotel concierge for the best tips on ${destination}.`;
                    setMsgs(prev => [...prev, { role: 'assistant', text: reply }]);
                } catch (err) {
                    setMsgs(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }]);
                } finally {
                    setLoading(false);
                }
            }, 700);
        } catch (err) {
            console.error('Chat send error:', err);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed bottom-24 right-8 w-96 h-[480px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50">
            <div className="bg-secondary px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-secondary"><Sparkles size={16} /></div>
                    <span className="text-white font-bold text-sm">WanderAI</span>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-secondary text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'}`}>{m.text}</div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex gap-1 items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                    value={inp}
                    onChange={e => setInp(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
                    placeholder={t('itinerary.chatPlaceholder')}
                    disabled={loading}
                />
                <button
                    onClick={send}
                    disabled={loading || !inp.trim()}
                    className="w-10 h-10 rounded-full bg-primary text-secondary flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

// ─── PUBLISH MODAL ────────────────────────────────────────────────────────────
const PublishModal = ({ isOpen, onClose, itinerary, data, flights, hotels, user }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [selectedThumb, setSelectedThumb] = useState(0);
    const [publishing, setPublishing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [publishError, setPublishError] = useState('');
    const [countdown, setCountdown] = useState(3);

    // 일정에서 대표 이미지 후보 자동 추출
    const thumbnailCandidates = useMemo(() => {
        const imgs = [];
        itinerary.forEach(day => {
            day.items.forEach(item => {
                if (item.img && !imgs.includes(item.img)) {
                    imgs.push(item.img);
                }
            });
        });
        return imgs.slice(0, 6); // 최대 6개까지 후보
    }, [itinerary]);

    // 등록 핸들러
    const handlePublish = async () => {
        if (!price || !description) return;
        setPublishing(true);
        setPublishError('');
        try {
            // 전체 일정 데이터를 구성
            const templateData = {
                // 판매자 정보
                creatorUid: user.uid,
                creatorName: user.displayName || 'Anonymous',
                creatorEmail: user.email,
                creatorAvatar: user.photoURL || '',
                // 상품 정보
                title: description,
                price: parseFloat(price),
                thumbnail: thumbnailCandidates[selectedThumb] || '',
                destination: data.destination,
                region: detectRegion(data.destination),
                category: data.travelWith || 'Solo',
                budget: data.pace || 'Moderate',
                // 일정 데이터 (장소, 시간, 메모 등)
                days: itinerary.map(day => ({
                    dayNum: day.dayNum,
                    date: day.date?.toISOString?.() || day.date,
                    theme: day.theme,
                    items: day.items.map(item => ({
                        name: item.name,
                        desc: item.desc,
                        type: item.type,
                        time: item.time,
                        img: item.img,
                        latitude: item.latitude || null,
                        longitude: item.longitude || null,
                        rating: item.rating || null,
                    }))
                })),
                // 항공편 및 숙소 데이터
                flights: flights.map(f => ({ type: f.type, from: f.from, to: f.to, number: f.number, time: f.time, notes: f.notes })),
                hotels: hotels.map(h => ({ name: h.name, address: h.address, confirmation: h.confirmation, checkin: h.checkin, checkout: h.checkout })),
                // 여행 메타 정보
                startDate: data.startDate,
                endDate: data.endDate,
                totalDays: itinerary.length,
                totalSpots: itinerary.reduce((s, d) => s + d.items.length, 0),
                focus: data.focus || [],
                pace: data.pace || 'Moderate',
                vibe: data.vibe || '',
            };
            
            // undefined 값이나 중첩된 참조 에러 방지를 위해 완전한 Plain Object 로 직렬화
            const cleanData = JSON.parse(JSON.stringify(templateData));
            
            await publishToMarketplace(cleanData);
            setSuccess(true);
            // 카운트다운 후 마켓플레이스로 자동 이동
            let count = 3;
            setCountdown(count);
            const timer = setInterval(() => {
                count -= 1;
                setCountdown(count);
                if (count <= 0) {
                    clearInterval(timer);
                    navigate('/marketplace');
                }
            }, 1000);
        } catch (err) {
            console.error('Publish error:', err);
            setPublishError(err.message || 'Failed to publish. Please try again.');
        } finally {
            setPublishing(false);
        }
    };

    // 지역 자동 감지 (간단 매핑)
    const detectRegion = (dest) => {
        const d = (dest || '').toLowerCase();
        if (['japan', 'korea', 'seoul', 'tokyo', 'osaka', 'bangkok', 'bali', 'singapore', 'vietnam', 'china', 'beijing', 'shanghai', 'taipei', 'hong kong'].some(k => d.includes(k))) return 'Asia';
        if (['paris', 'london', 'rome', 'barcelona', 'amsterdam', 'berlin', 'zurich', 'switzerland', 'interlaken', 'santorini', 'greece', 'italy', 'spain', 'france', 'germany', 'portugal'].some(k => d.includes(k))) return 'Europe';
        if (['new york', 'los angeles', 'san francisco', 'miami', 'hawaii', 'usa', 'canada', 'mexico'].some(k => d.includes(k))) return 'Americas';
        if (['maldives', 'dubai', 'qatar', 'turkey', 'istanbul'].some(k => d.includes(k))) return 'Middle East';
        if (['sydney', 'melbourne', 'australia', 'new zealand', 'fiji'].some(k => d.includes(k))) return 'Oceania';
        if (['cape town', 'morocco', 'kenya', 'egypt', 'africa'].some(k => d.includes(k))) return 'Africa';
        return 'Other';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* 배경 오버레이 */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* 모달 본체 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
                {/* 성공 화면 */}
                {success ? (
                    <div className="p-10 text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                            className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center"
                        >
                            <CheckCircle2 size={40} className="text-green-500" />
                        </motion.div>
                        <h2 className="text-2xl font-black text-secondary">{t('itinerary.publishSuccess')}</h2>
                        <p className="text-gray-500">{t('itinerary.publishSuccessDesc')}</p>
                        <p className="text-sm font-bold text-primary">
                            {countdown}초 후 마켓플레이스로 이동합니다...
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-colors">
                                {t('itinerary.publishViewMarket')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 헤더 */}
                        <div className="relative bg-gradient-to-br from-secondary via-slate-800 to-slate-900 px-8 py-8 text-white">
                            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                                <X size={22} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <Upload size={20} className="text-secondary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">{t('itinerary.publishTitle')}</h2>
                                    <p className="text-white/60 text-xs font-bold">{t('itinerary.publishSubtitle')}</p>
                                </div>
                            </div>
                            {/* 일정 정보 요약 */}
                            <div className="flex gap-3 mt-4">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">{data.destination}</span>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">{itinerary.length} {t('itinerary.days')}</span>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">{itinerary.reduce((s, d) => s + d.items.length, 0)} {t('itinerary.spots')}</span>
                            </div>
                        </div>

                        {/* 폼 */}
                        <div className="p-8 space-y-6">
                            {/* 가격 입력 */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign size={14} className="text-primary" /> {t('itinerary.publishPrice')}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    placeholder={t('itinerary.publishPricePlaceholder')}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-gray-300"
                                />
                            </div>

                            {/* 한 줄 설명 */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} className="text-primary" /> {t('itinerary.publishDesc')}
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={t('itinerary.publishDescPlaceholder')}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-gray-300"
                                />
                            </div>

                            {/* 썸네일 선택 */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Image size={14} className="text-primary" /> {t('itinerary.publishThumbnail')}
                                </label>
                                <p className="text-[10px] text-gray-400 font-bold">{t('itinerary.publishThumbnailAuto')}</p>
                                {thumbnailCandidates.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {thumbnailCandidates.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedThumb(idx)}
                                                className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                                                    selectedThumb === idx
                                                        ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                                {selectedThumb === idx && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                        <CheckCircle2 size={24} className="text-white drop-shadow-lg" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-24 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                                        No images available
                                    </div>
                                )}
                            </div>

                            {publishError && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold text-center">
                                    {publishError}
                                </div>
                            )}

                            {/* 등록 버튼 */}
                            <button
                                onClick={handlePublish}
                                disabled={publishing || !price || !description}
                                className="w-full py-4 bg-gradient-to-r from-primary to-amber-400 text-secondary font-black text-lg rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-3"
                            >
                                {publishing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                                        {t('itinerary.publishSubmitting')}
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        {t('itinerary.publishSubmit')}
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

// ─── COLLAPSIBLE SECTION ──────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, count, onAdd, addLabel, children }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(true);
    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                <button onClick={() => setOpen(o => !o)} className="flex items-center gap-3 text-left group">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon size={18} />
                    </div>
                    <span className="text-lg font-black text-secondary group-hover:text-primary transition-colors">{title}</span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-secondary/10 text-secondary rounded-full">{count}</span>
                    {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                <button onClick={onAdd}
                    className="flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors">
                    <PlusCircle size={16} /> {addLabel || t('itinerary.addSpot')}
                </button>
            </div>
            {open && <div className="px-8 py-6 space-y-4">{children}</div>}
        </div>
    );
};

// ─── FLIGHT CARD ──────────────────────────────────────────────────────────────
const FlightCard = ({ f, onChange, onRemove, showRemove }) => {
    const { t } = useTranslation();
    return (
        <div className="relative group bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg">
            {showRemove && (
                <button onClick={onRemove}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                </button>
            )}
            {/* ticket top strip */}
            <div className="flex items-center gap-2 mb-3">
                <select value={f.type} onChange={e => onChange('type', e.target.value)}
                    className="bg-white/10 border border-white/20 text-white text-xs font-bold rounded-lg px-2 py-1 outline-none">
                    <option value="Outbound" className="text-slate-900">{t('itinerary.typeOutbound')}</option>
                    <option value="Inbound" className="text-slate-900">{t('itinerary.typeInbound')}</option>
                    <option value="Internal" className="text-slate-900">{t('itinerary.typeInternal')}</option>
                    <option value="Layover" className="text-slate-900">{t('itinerary.typeLayover')}</option>
                </select>
                <span className="ml-auto text-white/50 text-xs text-right truncate">{t('itinerary.boardingPass').toUpperCase()}</span>
            </div>
        {/* route */}
        <div className="flex items-center gap-3 mb-3">
            <input value={f.from} onChange={e => onChange('from', e.target.value)}
                placeholder={t('itinerary.from').toUpperCase()} className="w-20 bg-transparent text-2xl font-black uppercase outline-none placeholder:text-white/30 border-b border-white/20 text-center" />
            <div className="flex-1 flex items-center gap-1"><div className="flex-1 border-t border-dashed border-white/30" /><Plane size={14} className="text-white/50" /><div className="flex-1 border-t border-dashed border-white/30" /></div>
            <input value={f.to} onChange={e => onChange('to', e.target.value)}
                placeholder={t('itinerary.to').toUpperCase()} className="w-20 bg-transparent text-2xl font-black uppercase outline-none placeholder:text-white/30 border-b border-white/20 text-center" />
        </div>
        {/* details row */}
        <div className="grid grid-cols-3 gap-2 text-xs">
            <div><div className="text-white/40 uppercase tracking-wider mb-1">{t('itinerary.flightNo')}</div>
                <input value={f.number} onChange={e => onChange('number', e.target.value)}
                    placeholder="KE1234" className="w-full bg-transparent font-bold outline-none placeholder:text-white/30 border-b border-white/20 pb-0.5" />
            </div>
            <div><div className="text-white/40 uppercase tracking-wider mb-1">{t('itinerary.departure')}</div>
                <input value={f.time} onChange={e => onChange('time', e.target.value)}
                    placeholder="14:30" className="w-full bg-transparent font-bold outline-none placeholder:text-white/30 border-b border-white/20 pb-0.5" />
            </div>
            <div><div className="text-white/40 uppercase tracking-wider mb-1">{t('itinerary.gateSeat')}</div>
                <input value={f.notes} onChange={e => onChange('notes', e.target.value)}
                    placeholder="B22 / 32A" className="w-full bg-transparent font-bold outline-none placeholder:text-white/30 border-b border-white/20 pb-0.5" />
            </div>
        </div>
    </div>
);
};

// ─── HOTEL CARD ───────────────────────────────────────────────────────────────
const HotelCard = ({ h, onChange, onRemove, showRemove, index }) => {
    const { t } = useTranslation();
    return (
        <div className="relative group bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm">
            {showRemove && (
                <button onClick={onRemove}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                </button>
            )}
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-400/20 flex items-center justify-center text-orange-500 flex-shrink-0 mt-0.5">
                    <BedDouble size={16} />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-orange-400 uppercase tracking-widest">{t('itinerary.stay', { index: index + 1 })}</span>
                    </div>
                    <input value={h.name} onChange={e => onChange('name', e.target.value)}
                        placeholder={t('itinerary.hotelNamePlaceholder')}
                        className="w-full bg-transparent text-lg font-black text-slate-800 outline-none border-b border-orange-200 pb-1 placeholder:text-gray-300" />
                <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                        <input value={h.address} onChange={e => onChange('address', e.target.value)}
                            placeholder={t('itinerary.addressPlaceholder')}
                            className="w-full bg-white/70 border border-orange-100 rounded-lg pl-3 pr-8 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-200 placeholder:text-gray-300" />
                        {h.address && (
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
                            >
                                <MapPin size={14} />
                            </a>
                        )}
                    </div>
                    <input value={h.confirmation} onChange={e => onChange('confirmation', e.target.value)}
                        placeholder={t('itinerary.hotelConfirm')}
                        className="bg-white/70 border border-orange-100 rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:ring-1 focus:ring-orange-200 placeholder:text-gray-300" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input value={h.checkin} onChange={e => onChange('checkin', e.target.value)}
                        placeholder={t('itinerary.hotelCheckin')}
                        className="bg-white/70 border border-orange-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-200 placeholder:text-gray-300" />
                    <input value={h.checkout} onChange={e => onChange('checkout', e.target.value)}
                        placeholder={t('itinerary.hotelCheckout')}
                        className="bg-white/70 border border-orange-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-200 placeholder:text-gray-300" />
                </div>
            </div>
        </div>
    </div>
);
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Itinerary = () => {
    const { t } = useTranslation();
    const { state } = useLocation();

    useEffect(() => { if (state) sessionStorage.setItem('lastSurveyData', JSON.stringify(state)); }, [state]);

    const data = useMemo(() => {
        if (state) return state;
        const saved = sessionStorage.getItem('lastSurveyData');
        const def = { destination: 'South Korea (Seoul)', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 4).toISOString(), focus: ['Food', 'Nature'], pace: 'Moderate', vibe: 'Social' };
        return saved ? { ...def, ...JSON.parse(saved) } : def;
    }, [state]);

    const [itinerary, setItinerary] = useState([]);
    const [destData, setDestData] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [chatOpen, setChatOpen] = useState(false);
    const [publishOpen, setPublishOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // ── 로그인 상태 감지 ──
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
        return () => unsub();
    }, []);

    // ── FLIGHTS state (array) ──
    const [flights, setFlights] = useState(() => {
        try { const s = localStorage.getItem(`flights_v2_${data.destination}`); if (s) return JSON.parse(s); } catch { }
        return [{ id: Date.now(), type: 'Outbound', from: '', to: '', number: '', time: '', notes: '' }];
    });

    // ── HOTELS state (array) ──
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

    // ── SMART TRAVEL ROUTE PLANNER ENGINE ──────────────────────────────────────
    useEffect(() => {
        const raw = (data.destination || '').toLowerCase().trim();

        // ── Multi-step fuzzy destination matching ──────────────────────────────
        let matchKey = Object.keys(DESTINATION_DATA).find(k => k !== 'default' && raw === k);
        if (!matchKey) {
            const rawBase = raw.split('(')[0].trim();
            matchKey = Object.keys(DESTINATION_DATA).find(k =>
                k !== 'default' && (raw.includes(k) || rawBase.includes(k) || k.includes(rawBase))
            );
        }
        if (!matchKey) {
            const cityMatch = raw.match(/\(([^)]+)\)/);
            const city = cityMatch ? cityMatch[1].trim() : raw;
            matchKey = Object.keys(DESTINATION_DATA).find(k =>
                k !== 'default' && (k.includes(city) || city.includes(k.split('(')[0].trim()))
            );
        }
        if (!matchKey) {
            const words = raw.replace(/[()]/g, ' ').split(/\s+/).filter(w => w.length > 2);
            matchKey = Object.keys(DESTINATION_DATA).find(k =>
                k !== 'default' && words.some(w => k.includes(w))
            );
        }

        const sd = DESTINATION_DATA[matchKey || 'default'];
        setDestData(sd);

        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const dayCount = Math.max(differenceInDays(end, start) + 1, 1);
        const allActivities = [...sd.activities];

        // ── [CONSTRAINT 1] Global No-Duplicate Set ──────────────────────────────
        const globalUsed = new Set(); // 전체 일정에서 동일 장소 중복 추천 절대 금지

        // ── [CONSTRAINT 2] Pace → Activities per day ───────────────────────────
        // Relaxed: 2~3 spots, Balanced: 3~4, Packed: 4~5
        const BASE_PER_DAY = { 'Relaxed': 2, 'Packed': 4, 'Balanced': 3 };
        let basePerDay = BASE_PER_DAY[data.pace] || 3;
        if (data.vibe === 'Chill' || data.vibe === 'Chill Wanderer') basePerDay = Math.max(2, basePerDay - 1);
        if (data.vibe === 'Active' || data.vibe === 'Active Explorer') basePerDay = Math.min(5, basePerDay + 1);

        // ── [CONSTRAINT 3] Vibe & Focus scoring weights ────────────────────────
        const VIBE_PREFS = {
            'Chill': ['Relax', 'Nature', 'Culture'],
            'Chill Wanderer': ['Relax', 'Nature', 'Culture'],
            'Active': ['Nature', 'City', 'Culture'],
            'Active Explorer': ['Nature', 'City', 'Culture'],
            'Social': ['City', 'Food', 'Culture'],
            'Quiet': ['Nature', 'Relax', 'Culture'],
        };
        const prefTypes = VIBE_PREFS[data.vibe] || [];
        const focusTypes = Array.isArray(data.focus) ? data.focus : [];

        // ── Scoring function: higher = pick first ─────────────────────────────
        const scoreActivity = (act, distKm) => {
            let score = 0;
            // Base: rating
            score += (act.rating || 4.0) * 10;
            // Focus match gives highest boost
            if (focusTypes.some(f => act.type?.toLowerCase().includes(f.toLowerCase()))) score += 30;
            // Vibe/preference match
            if (prefTypes.includes(act.type)) score += 20;
            // Geo-proximity bonus (closer = higher score). 0km = +50, 10km = +25, 20km+ = 0
            if (distKm !== null) score += Math.max(0, 50 - distKm * 2.5);
            // Small random jitter for variety
            score += Math.random() * 5;
            return score;
        };

        // ── [CONSTRAINT 4] Time scheduling with 2hr+ minimum intervals ─────────
        // activity types with typical durations in hours
        const TYPE_DURATION = {
            'Culture': 2.5, 'Nature': 2.5, 'City': 2, 'Relax': 2,
            'Food': 1.5, 'Market': 1.5, 'default': 2
        };
        const getDuration = (type) => TYPE_DURATION[type] || TYPE_DURATION['default'];

        const buildTimeSlots = (items) => {
            let currentHour = 9; // Day starts at 09:00
            return items.map((item) => {
                const hour = Math.min(Math.round(currentHour), 20); // No later than 20:00
                const timeStr = `${String(hour).padStart(2, '0')}:00`;
                currentHour += getDuration(item.type); // Advance time by duration (min 2hrs)
                return { ...item, time: timeStr };
            });
        };

        // ── [CONSTRAINT 5] Dining injection based on dining preference ──────────
        const DINING_SPOTS = {
            'Fine Dining': [
                { name: 'Fine Dining Dinner', desc: 'Michelin-rated or top-tier restaurant experience for the evening.', type: 'Food', rating: 4.9 },
                { name: 'Upscale Lunch', desc: 'Premium lunch at a top local restaurant.', type: 'Food', rating: 4.8 },
            ],
            'Street Food': [
                { name: 'Local Street Food Tour', desc: 'Explore authentic local flavours at street stalls.', type: 'Food', rating: 4.7 },
                { name: 'Night Market Eats', desc: 'Evening feast at a popular local night market.', type: 'Food', rating: 4.6 },
            ],
            'Cafe Culture': [
                { name: 'Specialty Coffee & Brunch', desc: 'Start the day with an artisan coffee and brunch.', type: 'Food', rating: 4.7 },
                { name: 'Afternoon Cafe', desc: 'A relaxing stop at a charming local cafe.', type: 'Food', rating: 4.6 },
            ],
        };
        const diningSlots = DINING_SPOTS[data.dining] || [];
        const globalDiningUsed = new Set();

        const getDiningSpot = (dayIndex) => {
            const slot = diningSlots.find(d => !globalDiningUsed.has(d.name)) || null;
            if (slot) globalDiningUsed.add(slot.name);
            return slot ? {
                ...slot,
                img: getImg(slot.name, slot.type),
                id: `dining-${dayIndex}-${Date.now()}`
            } : null;
        };

        // ── [CONSTRAINT 6] Day Theming based on geographic cluster ─────────────
        const DAY_THEMES = {
            'Culture': t('itinerary.themeCulture'), 'Nature': t('itinerary.themeNature'),
            'City': t('itinerary.themeCity'), 'Relax': t('itinerary.themeRelax'),
            'Food': t('itinerary.themeFood'),
        };
        const getDayTheme = (items) => {
            const typeCounts = {};
            items.forEach(i => { typeCounts[i.type] = (typeCounts[i.type] || 0) + 1; });
            const dominant = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
            return DAY_THEMES[dominant] || t('itinerary.themeDefault');
        };

        // ── MAIN GENERATION LOOP ────────────────────────────────────────────────
        const days = [];
        for (let i = 0; i < dayCount; i++) {
            const sightsCount = basePerDay; // sightseeing spots per day (dining added separately)
            let lastLat = null, lastLng = null;
            const dayItems = [];

            for (let j = 0; j < sightsCount; j++) {
                // Available = not globally used (strict no-duplicate)
                const avail = allActivities.filter(a => !globalUsed.has(a.name) && a.type !== 'Food');

                // If completely exhausted for non-food, take any unused (including food)
                const pool = avail.length > 0 ? avail : allActivities.filter(a => !globalUsed.has(a.name));
                if (!pool.length) break; // All spots exhausted — skip

                // Score candidates
                const scored = pool.map(act => ({
                    act,
                    score: scoreActivity(act, lastLat !== null ? calcDist(lastLat, lastLng, act.latitude, act.longitude) : null)
                })).sort((a, b) => b.score - a.score);

                const next = scored[0]?.act;
                if (!next) break;

                globalUsed.add(next.name);
                lastLat = next.latitude;
                lastLng = next.longitude;
                dayItems.push({
                    ...next,
                    img: getImg(next.name, next.type),
                    id: `${i}-${j}-${Date.now()}-${Math.random()}`,
                    time: '09:00', // will be recalculated by buildTimeSlots
                });
            }

            // ── Inject dining spot around midday (after first 1-2 sights) ──────
            const diningSpot = getDiningSpot(i, lastLat, lastLng);
            if (diningSpot && dayItems.length >= 1) {
                const insertAt = Math.min(Math.ceil(dayItems.length / 2), 2);
                dayItems.splice(insertAt, 0, diningSpot);
            }

            // ── Assign realistic times with 2hr+ intervals ─────────────────────
            const timedItems = buildTimeSlots(dayItems);
            const theme = getDayTheme(timedItems);

            days.push({ id: i, dayNum: i + 1, date: addDays(start, i), theme, items: timedItems });
        }
        setItinerary(days);
        
        // 검색 이력 저장
        saveSearchHistory(data);
        
    }, [data]);


    // ── ITINERARY MUTATORS ─────────────────────────────────────────────────────
    const setDayItems = (di, items) => setItinerary(prev => { const n = [...prev]; n[di] = { ...n[di], items }; return n; });
    const sortByTime = (items) => [...items].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const updateAct = (di, id, a) => {
        const prev = itinerary[di].items;
        const updated = prev.map(x => x.id === id ? a : x);
        // if time changed, re-sort the day by time automatically
        const old = prev.find(x => x.id === id);
        const sorted = (old && old.time !== a.time) ? sortByTime(updated) : updated;
        setDayItems(di, sorted);
    };

    const deleteAct = (di, id) => setDayItems(di, itinerary[di].items.filter(x => x.id !== id));
    const addAct = (di) => {
        const nm = t('itinerary.newSpotName'), tp = 'City';
        const item = { id: `new-${Date.now()}`, name: nm, time: '12:00', desc: t('itinerary.newSpotDesc'), type: tp, img: getImg(nm, tp), isNew: true };
        setDayItems(di, [...itinerary[di].items, item]);
    };

    if (!destData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-6">
            <Navbar />
            <div className="text-2xl font-black text-secondary animate-pulse mt-20">{t('itinerary.curating')}</div>
            <AdPlaceholder className="w-full max-w-2xl h-[250px] shadow-sm" />
        </div>
    );

    // ── SUMMARY TABLE (reads from itinerary state) ─────────────────────────────
    const totalSpots = itinerary.reduce((s, d) => s + d.items.length, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Navbar />

            {/* ── HEADER ── */}
            {/* NAV */}
            <nav className="h-20 px-8 md:px-14 flex items-center justify-between bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
                <Link to="/survey" className="flex items-center gap-3 group">
                    <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ChevronLeft size={22} />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl text-secondary leading-none">{data.destination}</h1>
                        <p className="text-xs font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                            <Calendar size={12} />
                            {format(new Date(data.startDate), 'MMM dd')} – {format(new Date(data.endDate), 'MMM dd')} · {t('itinerary.days', { count: itinerary.length })}
                        </p>
                    </div>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                        {['itinerary', 'summary'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-7 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white shadow text-secondary' : 'text-gray-400 hover:text-gray-600'}`}>
                                {t(`itinerary.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
                            </button>
                        ))}
                    </div>
                    {/* Publish 버튼 */}
                    <button
                        onClick={() => {
                            if (!currentUser) {
                                if (window.confirm(t('itinerary.publishLoginRequired'))) {
                                    navigate('/login');
                                }
                                return;
                            }
                            setPublishOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-amber-400 text-secondary font-black text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Upload size={16} />
                        {t('itinerary.publishBtn')}
                    </button>
                </div>
            </nav>

            {/* MAIN */}
            <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-10 flex flex-col lg:flex-row gap-10">
                {/* LEFT SIDEBAR (ADS) */}
                <aside className="hidden lg:flex flex-col w-72 flex-shrink-0">
                    <div className="sticky top-28 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('itinerary.recommended')}</h3>
                            <AdPlaceholder className="w-full h-[600px] shadow-inner" />
                        </div>
                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">

                        {/* ── ITINERARY TAB ── */}
                        {activeTab === 'itinerary' && (
                            <motion.div key="itin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-14">
                                {itinerary.map((day, di) => (
                                    <div key={day.id}>
                                        <div className="flex items-center gap-5 mb-7">
                                            <div className="w-20 h-20 bg-secondary text-white rounded-3xl flex flex-col items-center justify-center font-black shadow-2xl border-4 border-white/10 shrink-0 transform hover:scale-105 transition-transform">
                                                <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-0.5">{t('itinerary.dayLabel')}</span>
                                                <span className="text-4xl leading-none">{day.dayNum}</span>
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-secondary">{format(day.date, 'EEEE, MMM do')}</h2>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-sm text-gray-400 font-bold">{t('itinerary.activitiesCount', { count: day.items.length })}</p>
                                                    {day.items.length > 0 && (
                                                        <a
                                                            href={getDayMapUrl(day.items, data.destination)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-[11px] font-black text-primary hover:text-secondary hover:bg-primary transition-all bg-primary/10 px-3 py-1.5 rounded-full shadow-sm active:scale-95"
                                                        >
                                                            <MapPin size={12} />
                                                            <span>{t('itinerary.routeMap')}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Reorder.Group axis="y" values={day.items} onReorder={items => setDayItems(di, items)} className="space-y-4">
                                            {day.items.map(act => (
                                                <ActivityCard key={act.id} activity={act}
                                                    onSave={a => updateAct(di, act.id, a)}
                                                    onDelete={() => deleteAct(di, act.id)} />
                                            ))}
                                        </Reorder.Group>
                                        <button onClick={() => addAct(di)}
                                            className="w-full mt-6 py-5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group">
                                            <Plus size={22} className="group-hover:rotate-90 transition-transform" /> {t('itinerary.addSpot')}
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* ── SUMMARY TAB ── */}
                        {activeTab === 'summary' && (
                            <motion.div key="sum" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">

                                {/* FLIGHTS */}
                                <Section title={t('itinerary.flights')} icon={Plane} count={flights.length} onAdd={addFlight} addLabel={t('itinerary.addFlight')}>
                                    {flights.map(f => (
                                        <FlightCard key={f.id} f={f}
                                            onChange={(k, v) => updateFlight(f.id, k, v)}
                                            onRemove={() => removeFlight(f.id)}
                                            showRemove={flights.length > 1} />
                                    ))}
                                </Section>

                                {/* HOTELS */}
                                <Section title={t('itinerary.accommodation')} icon={BedDouble} count={hotels.length} onAdd={addHotel} addLabel={t('itinerary.addStay')}>
                                    {hotels.map((h, i) => (
                                        <HotelCard key={h.id} h={h} index={i}
                                            onChange={(k, v) => updateHotel(h.id, k, v)}
                                            onRemove={() => removeHotel(h.id)}
                                            showRemove={hotels.length > 1} />
                                    ))}
                                </Section>

                                {/* JOURNEY OVERVIEW TABLE — reads from itinerary state directly */}
                                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                    <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                        <h3 className="text-lg font-black text-secondary flex items-center gap-2.5">
                                            <List size={18} className="text-primary" /> {t('itinerary.journeyOverview')}
                                        </h3>
                                        <div className="flex gap-3">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">{t('itinerary.days', { count: itinerary.length })}</span>
                                            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold">{t('itinerary.spots', { count: totalSpots })}</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    {['day', 'time', 'activity', 'type', 'map'].map(h => (
                                                        <th key={h} className={`px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest ${h === 'map' ? 'text-center' : ''}`}>{t(`itinerary.col${h.charAt(0).toUpperCase() + h.slice(1)}`)}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {itinerary.map(day =>
                                                    day.items.length > 0 ? day.items.map((item, idx) => (
                                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                            {idx === 0 && (
                                                                <td rowSpan={day.items.length} className="px-6 py-6 align-top border-r border-gray-50 bg-gray-50/30">
                                                                    <div className="flex flex-col items-center gap-3">
                                                                        <span className="font-black text-primary text-lg">{t('itinerary.dayShort', { count: day.dayNum })}</span>
                                                                        <a
                                                                            href={getDayMapUrl(day.items, data.destination)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            title={t('itinerary.routeMap')}
                                                                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-secondary shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                                                                        >
                                                                            <MapPin size={18} />
                                                                        </a>
                                                                        <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">{t('itinerary.route')}</span>
                                                                    </div>
                                                                </td>
                                                            )}
                                                            <td className="px-6 py-5 text-primary font-bold text-sm whitespace-nowrap">{fmtTime(item.time)}</td>
                                                            <td className="px-6 py-5">
                                                                <p className="font-black text-secondary text-sm">{item.name}</p>
                                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{item.desc}</p>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <span className="px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500">{item.type}</span>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <a
                                                                    href={`https://www.google.com/maps/search/?api=1&query=${item.latitude && item.longitude ? `${item.latitude},${item.longitude}` : encodeURIComponent(item.name + ' ' + (data.destination || ''))}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-primary hover:text-secondary transition-all group"
                                                                    title={t('itinerary.maps')}
                                                                >
                                                                    <MapPin size={14} className="group-hover:scale-110 transition-transform" />
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr key={`empty-${day.id}`}>
                                                            <td className="px-6 py-5 font-black text-secondary">{t('itinerary.dayShort', { count: day.dayNum })}</td>
                                                            <td colSpan={4} className="px-6 py-5 text-gray-400 text-sm italic">{t('itinerary.noActivities')}</td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT SIDEBAR (BOOKING SHORTCUTS) */}
                <aside className="hidden xl:flex flex-col w-72 flex-shrink-0">
                    <div className="sticky top-28 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-xl bg-white/80">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ExternalLink size={14} /> {t('itinerary.bookingShortcuts')}
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: t('itinerary.bookSkyscanner'), icon: Plane, color: 'bg-blue-50 text-blue-600', url: `https://www.skyscanner.net/` },
                                    { name: t('itinerary.bookAgoda'), icon: BedDouble, color: 'bg-emerald-50 text-emerald-600', url: `https://www.agoda.com/search?city=${encodeURIComponent(data.destination)}` },
                                    { name: t('itinerary.bookBooking'), icon: Globe, color: 'bg-indigo-50 text-indigo-600', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(data.destination)}` }
                                ].map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 hover:border-primary/20 hover:bg-white hover:shadow-md transition-all group"
                                    >
                                        <div className={`w-10 h-10 ${link.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <link.icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-secondary truncate">{link.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Book now</p>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* MINI TIP */}
                        <div className="p-6 rounded-3xl bg-secondary text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                                <Globe size={80} />
                            </div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Travel Tip</p>
                            <p className="text-sm font-bold leading-relaxed relative z-10">
                                {data.destination} {t('itinerary.bookingShortcuts')}를 통해 최적의 가격으로 여행을 완성하세요!
                            </p>
                        </div>
                    </div>
                </aside>
            </main>

            {/* FAB + CHAT */}
            <button onClick={() => setChatOpen(true)}
                className="fixed bottom-7 right-7 w-14 h-14 bg-primary text-secondary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40">
                <MessageCircle size={28} />
            </button>
            <AIChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} destination={data.destination} />

            {/* Publish 모달 */}
            <AnimatePresence>
                {publishOpen && (
                    <PublishModal
                        isOpen={publishOpen}
                        onClose={() => setPublishOpen(false)}
                        itinerary={itinerary}
                        data={data}
                        flights={flights}
                        hotels={hotels}
                        user={currentUser}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Itinerary;
