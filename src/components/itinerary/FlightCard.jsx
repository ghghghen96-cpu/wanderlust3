import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, X } from 'lucide-react';

/**
 * Flight information card
 */
const FlightCard = ({ f, onChange, onRemove, showRemove }) => {
    const { t } = useTranslation('translation', { keyPrefix: 'itinerary' });
    return (
        <div className="relative group bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg">
            {showRemove && (
                <button 
                    onClick={onRemove}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={12} />
                </button>
            )}
            
            {/* ticket top strip */}
            <div className="flex items-center gap-2 mb-3">
                <select 
                    value={f.type} 
                    onChange={e => onChange('type', e.target.value)}
                    className="bg-white/10 border border-white/20 text-white text-xs font-bold rounded-lg px-2 py-1 outline-none"
                >
                    <option value="Outbound" className="text-slate-900">{t('typeOutbound')}</option>
                    <option value="Inbound" className="text-slate-900">{t('typeInbound')}</option>
                    <option value="Internal" className="text-slate-900">{t('typeInternal')}</option>
                    <option value="Layover" className="text-slate-900">{t('typeLayover')}</option>
                </select>
                <span className="ml-auto text-white/50 text-xs text-right truncate">{t('boardingPass').toUpperCase()}</span>
            </div>
            
            {/* route */}
            <div className="flex items-center gap-3 mb-3">
                <input 
                    value={f.from} 
                    onChange={e => onChange('from', e.target.value)}
                    placeholder={t('from').toUpperCase()} 
                    className="w-20 bg-transparent text-2xl font-black uppercase outline-none placeholder:text-white/30 border-b border-white/20 text-center" 
                />
                <div className="flex-1 flex items-center gap-1">
                    <div className="flex-1 border-t border-dashed border-white/30" />
                    <Plane size={14} className="text-white/50" />
                    <div className="flex-1 border-t border-dashed border-white/30" />
                </div>
                <input 
                    value={f.to} 
                    onChange={e => onChange('to', e.target.value)}
                    placeholder={t('to').toUpperCase()} 
                    className="w-20 bg-transparent text-2xl font-black uppercase outline-none placeholder:text-white/30 border-b border-white/20 text-center" 
                />
            </div>
            
            {/* details row */}
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                    <div className="text-white/40 uppercase tracking-wider mb-1">{t('flightNo')}</div>
                    <input 
                        value={f.number} 
                        onChange={e => onChange('number', e.target.value)}
                        placeholder="KE1234" 
                        className="w-full bg-transparent font-bold outline-none placeholder:text-white/30 border-b border-white/20 pb-0.5" 
                    />
                </div>
                <div>
                    <div className="text-white/40 uppercase tracking-wider mb-1">{t('departure')}</div>
                    <input 
                        value={f.time} 
                        onChange={e => onChange('time', e.target.value)}
                        placeholder="14:30" 
                        className="w-full bg-transparent font-bold outline-none placeholder:text-white/30 border-b border-white/20 pb-0.5" 
                    />
                </div>
                <div>
                    <div className="text-white/40 uppercase tracking-wider mb-1">{t('gateSeat')}</div>
                    <input 
                        value={f.notes} 
                        onChange={e => onChange('notes', e.target.value)}
                        placeholder="B22 / 32A" 
                        className="w-full bg-transparent font-bold outline-none placeholder:text-white/30 border-b border-white/20 pb-0.5" 
                    />
                </div>
            </div>
        </div>
    );
};

export default FlightCard;
