import React, { useState, useRef } from 'react';
import { 
    List, Edit2, Trash2, Clock, Sparkles, Wallet, Bus, Info, ChevronRight, Star, MapPin, ExternalLink 
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

    if (compact) {
        return (
            <Reorder.Item value={activity} id={activity.id} dragListener={false} dragControls={dc} className="group">
                <div className="flex items-start gap-2.5 p-2.5 bg-white hover:bg-amber-50 rounded-2xl border border-gray-100 transition-all shadow-sm relative pr-8">
                    <div onPointerDown={e => dc.start(e)} className="cursor-move p-1 text-gray-300 hover:text-gray-500 transition-colors mt-0.5">
                        <List size={14} />
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
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="flex items-center justify-between w-full sm:w-auto">
                    <div onPointerDown={e => dc.start(e)} className="cursor-move p-2 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                        <List size={20} />
                    </div>
                    <div className="flex sm:hidden gap-1">
                        <button onClick={() => setEditing(true)} className="p-2.5 text-blue-400 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 size={18} /></button>
                        <button onClick={onDelete} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                    </div>
                </div>



                <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-[#006400] text-2xl truncate group-hover:opacity-80 transition-opacity mb-0.5">{displayName}</h3>
                            {/* 음식 카드: 실제 식당 이름을 서브타이틀로 표시 */}
                            {isFood && restaurantName && (
                                <p className="text-base font-bold text-orange-600 truncate mb-2">{restaurantName}</p>
                            )}
                        </div>
                        <div className="hidden sm:flex gap-1">
                            <button onClick={() => setEditing(true)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"><Edit2 size={16} /></button>
                            <button onClick={onDelete} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>
                    </div>

                    <div className="mb-3">
                        {timeEdit ? (
                            <div className="flex items-center gap-2 bg-primary/5 p-2 rounded-xl border border-primary/20">
                                <Clock size={16} className="text-primary" />
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
                                    className="text-base font-bold text-primary bg-transparent outline-none"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setTimeEdit(true)}
                                title={t('setTime')}
                                className="group/time flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-primary border border-gray-100 rounded-full hover:bg-primary/10 hover:border-primary/20 transition-all"
                            >
                                <Clock size={14} className="group-hover/time:scale-110 transition-transform" />
                                <span className="font-bold text-sm tracking-tight">
                                    {fmtTime(activity.time, i18n.language) || t('setTime')}
                                </span>
                                <Edit2 size={10} className="opacity-0 group-hover/time:opacity-50 transition-opacity" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <p className="text-base font-semibold text-[#4A4A4A] leading-relaxed">{displayDesc}</p>
                        
                        {(activity.recommendationReason || activity.costEstimate || activity.transportHint || activity.localTip) && (
                            <div className="flex flex-col gap-2 mt-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                                {activity.recommendationReason && (
                                    <div className="flex items-start gap-2">
                                        <Sparkles size={16} className="text-primary mt-1 flex-shrink-0" />
                                        <p className="text-sm font-semibold text-gray-700">
                                            <span className="font-bold text-primary">{t('whySelected', { defaultValue: 'Why we recommend this:' })} </span>
                                            {activity.recommendationReason}
                                        </p>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                                    {activity.costEstimate && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                            <Wallet size={14} className="text-emerald-500" />
                                            <span className="font-bold">{activity.costEstimate}</span>
                                        </div>
                                    )}
                                    {activity.transportHint && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                            <Bus size={14} className="text-blue-500" />
                                            <span>{activity.transportHint}</span>
                                        </div>
                                    )}
                                </div>
                                {activity.localTip && (
                                    <div className="flex items-start gap-1.5 text-sm mt-1 bg-amber-50 rounded-xl p-2.5 border border-amber-100/50">
                                        <Info size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-amber-800 italic leading-snug"><span className="font-bold">{t('localTip', { defaultValue: 'Local Tip:' })}</span> {activity.localTip}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {/* 지도 보기 버튼: mapsUrl(place_id 기반) 우선 사용 */}
                            <a
                                href={
                                    activity.mapsUrl ||
                                    `https://www.google.com/maps/search/?api=1&query=${activity.latitude && activity.longitude ? `${activity.latitude},${activity.longitude}` : encodeURIComponent(activity.name + ' ' + (destination || ''))}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all border border-slate-100"
                            >
                                <MapPin size={12} />
                                {t('viewMap')}
                            </a>
                            {/* 평점 뱃지 */}
                            {activity.rating && (
                                <div className="flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold border border-amber-100">
                                    <Star size={12} className="fill-amber-500 text-amber-500" />
                                    {activity.rating}
                                </div>
                            )}
                            {/* 음식 카드: 리뷰 수 뱃지 */}
                            {isFood && activity.reviewCount > 0 && (
                                <div className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100">
                                    리뷰 {activity.reviewCount.toLocaleString()}개
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Reorder.Item>
    );
};

export default ActivityCard;
