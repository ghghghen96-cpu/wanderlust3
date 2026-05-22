import React, { useState, useRef } from 'react';
import { 
    List, Edit2, Trash2, Clock, Sparkles, Wallet, Bus, Info, Star, MapPin, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ExternalPlaceImage from '../ExternalPlaceImage';
import { getImg, fmtTime, cleanTime } from '../../utils/itineraryHelpers';

/**
 * ActivityCard
 * @param {object} activity - 활동 데이터
 * @param {function} onSave - 저장 콜백
 * @param {function} onDelete - 삭제 콜백
 * @param {string} destination - 목적지 명칭
 * @param {string} destinationId - 목적지 ID
 * @param {boolean} compact - 컴팩트 뷰 여부 (Map 뷰 사이드바용)
 */
const ActivityCard = ({ activity, onSave, onDelete, destination, destinationId, compact = false }) => {
    const { t, i18n } = useTranslation('translation', { keyPrefix: 'itinerary' });
    const [editing, setEditing] = useState(activity.isNew || false);
    const cleanActTime = cleanTime(activity.time);
    const [ed, setEd] = useState({ ...activity, time: cleanActTime });
    const [timeEdit, setTimeEdit] = useState(false);
    const timeRef = useRef(null);
    const dc = useDragControls();

    const save = () => { 
        onSave({ 
            ...ed, 
            img: getImg(ed.name, ed.type, destination, destinationId), 
            isNew: false 
        }); 
        setEditing(false); 
    };

    const commitTime = (val) => {
        setTimeEdit(false);
        if (val) onSave({ ...activity, time: val });
    };

    if (editing) return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-primary/20 space-y-4">
            <div className="flex gap-3 items-center">
                <input autoFocus value={ed.name} onChange={e => setEd({ ...ed, name: e.target.value })}
                    className="flex-1 font-black text-2xl border-b-2 border-gray-200 focus:outline-none px-1 py-1 text-secondary" placeholder={t('newSpotName')} />
                <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('colTime')}</span>
                    <input type="time" value={ed.time} onChange={e => setEd({ ...ed, time: e.target.value })}
                        className="font-bold text-base text-primary bg-primary/5 rounded-lg px-3 py-2 outline-none border border-primary/20 focus:ring-2 focus:ring-primary/30" />
                </div>
            </div>
            <textarea value={ed.desc} onChange={e => setEd({ ...ed, desc: e.target.value })} rows={2}
                className="w-full text-sm text-gray-600 border border-gray-200 rounded-xl p-3 focus:outline-none bg-gray-50 resize-none" />
            <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)} className="px-5 py-2 text-gray-500 font-bold text-sm">{t('btnCancel')}</button>
                <button onClick={save} className="px-6 py-2 bg-primary text-secondary rounded-xl font-bold text-sm">{t('btnSave')}</button>
            </div>
        </div>
    );

    const displayName = (i18n.language === 'ko' && activity.name_ko) ? activity.name_ko : activity.name;
    const displayDesc = (i18n.language === 'ko' && activity.desc_ko) ? activity.desc_ko : activity.desc;
    // 음식 카드: 실제 식당 이름이 따로 있으면 서브타이틀로 표시
    const isFood = activity.type === 'Food';
    const restaurantName = activity.restaurantName || null;

    // 이미지 검색에 사용할 이름: 식당이면 restaurantName 우선
    const imageSearchName = (isFood && restaurantName) ? restaurantName : displayName;

    if (compact) {
        return (
            <Reorder.Item value={activity} id={activity.id} dragListener={false} dragControls={dc} className="group">
                <div className="flex items-start gap-2.5 p-2.5 bg-white hover:bg-amber-50 rounded-2xl border border-gray-100 transition-all shadow-sm relative pr-8">
                    <div onPointerDown={e => dc.start(e)} className="cursor-move p-1 text-gray-300 hover:text-gray-500 transition-colors mt-0.5">
                        <List size={14} />
                    </div>
                    {/* 컴팩트 뷰에서도 소형 이미지 표시 */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative">
                        <ExternalPlaceImage
                            name={imageSearchName}
                            region={destination}
                            className="w-full h-full"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-bold text-xs truncate group-hover:text-amber-600 transition-colors">{displayName}</p>
                        {isFood && restaurantName && (
                            <p className="text-[10px] font-bold text-orange-600 truncate">{restaurantName}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <button onClick={() => setTimeEdit(true)} className="text-amber-500 text-[10px] font-bold hover:underline">
                                {fmtTime(activity.time, i18n.language) || t('setTime')}
                            </button>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-500 font-bold uppercase">{activity.type}</span>
                        </div>
                        {activity.desc && <p className="text-gray-400 text-[10px] mt-1 line-clamp-1">{displayDesc}</p>}
                    </div>
                    <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditing(true)} className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                            <Edit2 size={10} />
                        </button>
                        <button onClick={onDelete} className="w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={10} />
                        </button>
                    </div>
                </div>
            </Reorder.Item>
        );
    }

    return (
        <Reorder.Item value={activity} id={activity.id} dragListener={false} dragControls={dc} className="group">
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* ── 이미지 영역 (Google Places 우선) ── */}
                <div className="relative w-full h-48 overflow-hidden">
                    <ExternalPlaceImage
                        name={imageSearchName}
                        region={destination}
                        className="w-full h-full"
                        alt={displayName}
                    />
                    {/* 상단 오버레이: 드래그 핸들 + 수정/삭제 버튼 */}
                    <div className="absolute inset-0 flex items-start justify-between p-3 bg-gradient-to-b from-black/30 to-transparent">
                        <div onPointerDown={e => dc.start(e)} className="cursor-move p-1.5 bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-lg text-white/80 hover:text-white transition-colors">
                            <List size={16} />
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditing(true)} className="p-1.5 bg-blue-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-blue-500 transition-colors">
                                <Edit2 size={14} />
                            </button>
                            <button onClick={onDelete} className="p-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                    {/* 하단 오버레이: 시간 버튼 */}
                    <div className="absolute bottom-3 left-3 right-3">
                        {timeEdit ? (
                            <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/20">
                                <Clock size={14} className="text-white" />
                                <input
                                    ref={timeRef}
                                    type="time"
                                    defaultValue={cleanActTime}
                                    autoFocus
                                    onBlur={e => commitTime(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') commitTime(e.target.value);
                                        if (e.key === 'Escape') setTimeEdit(false);
                                    }}
                                    className="text-sm font-bold text-white bg-transparent outline-none"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setTimeEdit(true)}
                                className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white/90 px-3 py-1.5 rounded-xl text-sm font-bold hover:bg-black/70 transition-all border border-white/10"
                            >
                                <Clock size={13} />
                                {fmtTime(activity.time, i18n.language) || t('setTime')}
                            </button>
                        )}
                    </div>
                    {/* 카테고리 뱃지 */}
                    <div className="absolute top-3 right-14 group-hover:right-28 transition-all duration-200">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm ${
                            isFood ? 'bg-orange-500/80 text-white' : 'bg-white/20 text-white border border-white/20'
                        }`}>
                            {activity.type}
                        </span>
                    </div>
                </div>

                {/* ── 콘텐츠 영역 ── */}
                <div className="p-5">
                    {/* 장소명 */}
                    <div className="mb-3">
                        <h3 className="font-black text-[#006400] text-xl leading-tight group-hover:opacity-80 transition-opacity">
                            {displayName}
                        </h3>
                        {isFood && restaurantName && (
                            <p className="text-sm font-bold text-orange-600 mt-0.5">{restaurantName}</p>
                        )}
                    </div>

                    {/* 설명 */}
                    <p className="text-sm font-semibold text-[#4A4A4A] leading-relaxed mb-3">{displayDesc}</p>

                    {/* 추가 정보 박스 */}
                    {(activity.recommendationReason || activity.costEstimate || activity.transportHint || activity.localTip) && (
                        <div className="flex flex-col gap-2 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 mb-3">
                            {activity.recommendationReason && (
                                <div className="flex items-start gap-2">
                                    <Sparkles size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                    <p className="text-xs font-semibold text-gray-700">
                                        <span className="font-bold text-primary">{t('whySelected', { defaultValue: 'Why we recommend this:' })} </span>
                                        {activity.recommendationReason}
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                {activity.costEstimate && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <Wallet size={12} className="text-emerald-500" />
                                        <span className="font-bold">{activity.costEstimate}</span>
                                    </div>
                                )}
                                {activity.transportHint && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <Bus size={12} className="text-blue-500" />
                                        <span>{activity.transportHint}</span>
                                    </div>
                                )}
                            </div>
                            {activity.localTip && (
                                <div className="flex items-start gap-1.5 text-xs bg-amber-50 rounded-xl p-2 border border-amber-100/50">
                                    <Info size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-amber-800 italic leading-snug">
                                        <span className="font-bold">{t('localTip', { defaultValue: 'Local Tip:' })}</span> {activity.localTip}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={
                                activity.mapsUrl ||
                                `https://www.google.com/maps/search/?api=1&query=${activity.latitude && activity.longitude ? `${activity.latitude},${activity.longitude}` : encodeURIComponent(activity.name + ' ' + (destination || ''))}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all border border-slate-100"
                        >
                            <MapPin size={11} />
                            {t('viewMap')}
                        </a>
                        {activity.rating && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold border border-amber-100">
                                <Star size={11} className="fill-amber-500 text-amber-500" />
                                {activity.rating}
                            </div>
                        )}
                        {isFood && activity.reviewCount > 0 && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100">
                                리뷰 {activity.reviewCount.toLocaleString()}개
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Reorder.Item>
    );
};

export default ActivityCard;
