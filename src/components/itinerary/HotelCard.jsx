import React from 'react';
import { useTranslation } from 'react-i18next';
import { BedDouble, MapPin, X } from 'lucide-react';

/**
 * Accommodation/Hotel information card
 */
const HotelCard = ({ h, onChange, onRemove, showRemove, index }) => {
    const { t } = useTranslation('translation', { keyPrefix: 'itinerary' });
    return (
        <div className="relative group bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm">
            {showRemove && (
                <button 
                    onClick={onRemove}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={12} />
                </button>
            )}
            
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-400/20 flex items-center justify-center text-orange-500 flex-shrink-0 mt-0.5">
                    <BedDouble size={16} />
                </div>
                
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-orange-400 uppercase tracking-widest">
                            {t('stay', { index: index + 1 })}
                        </span>
                    </div>
                    
                    <input 
                        value={h.name} 
                        onChange={e => onChange('name', e.target.value)}
                        placeholder={t('hotelNamePlaceholder')}
                        className="w-full bg-transparent text-lg font-black text-slate-800 outline-none border-b border-orange-200 pb-1 placeholder:text-gray-300" 
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <input 
                                value={h.address} 
                                onChange={e => onChange('address', e.target.value)}
                                placeholder={t('addressPlaceholder')}
                                className="w-full bg-white/70 border border-orange-100 rounded-lg pl-3 pr-8 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-200 placeholder:text-gray-300" 
                            />
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
                        
                        <input 
                            value={h.confirmation} 
                            onChange={e => onChange('confirmation', e.target.value)}
                            placeholder={t('hotelConfirm')}
                            className="bg-white/70 border border-orange-100 rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:ring-1 focus:ring-orange-200 placeholder:text-gray-300" 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            value={h.checkin} 
                            onChange={e => onChange('checkin', e.target.value)}
                            placeholder={t('hotelCheckin')}
                            className="bg-white/70 border border-orange-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-200 placeholder:text-gray-300" 
                        />
                        <input 
                            value={h.checkout} 
                            onChange={e => onChange('checkout', e.target.value)}
                            placeholder={t('hotelCheckout')}
                            className="bg-white/70 border border-orange-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-200 placeholder:text-gray-300" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelCard;
