import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

/**
 * AdPlaceholder component for the sidebar
 */
export const AdPlaceholder = ({ className = '', style = {} }) => {
    const { t } = useTranslation('translation', { keyPrefix: 'itinerary' });
    return (
        <div className={`bg-gray-100 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 font-bold overflow-hidden relative ${className}`} style={style}>
            <span className="text-[10px] uppercase tracking-widest absolute top-2 right-3 text-gray-400">{t('recommended')}</span>
            <div className="flex flex-col items-center gap-2 mt-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    );
};

/**
 * Collapsible section for Flights/Hotels/etc.
 */
export const Section = ({ title, icon: Icon, count, onAdd, addLabel, children }) => {
    const { t } = useTranslation('translation', { keyPrefix: 'itinerary' });
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
                    <PlusCircle size={16} /> {addLabel || t('addSpot')}
                </button>
            </div>
            {open && <div className="px-8 py-6 space-y-4">{children}</div>}
        </div>
    );
};
