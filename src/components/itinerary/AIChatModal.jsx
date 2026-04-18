import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Send } from 'lucide-react';

/**
 * AI Chat Modal for Itinerary page
 * Provides simple rule-based replies for travel-related questions.
 */
const AIChatModal = ({ isOpen, onClose, destination }) => {
    const { t } = useTranslation('translation', { keyPrefix: 'itinerary' });
    const [msgs, setMsgs] = useState([{ role: 'assistant', text: t('chatBotGreeting', { destination }) }]);
    const [inp, setInp] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [msgs, isOpen]);

    const REPLIES = [
        { keywords: ['food', 'eat', 'restaurant', 'dining', '맛집', '음식', '식사'], reply: t('chatBotReplies.food') },
        { keywords: ['hotel', 'stay', 'accommodation', 'sleep', '숙소', '호텔', '잠'], reply: t('chatBotReplies.stay') },
        { keywords: ['weather', 'climate', 'temperature', '날씨', '기온', '비'], reply: t('chatBotReplies.weather') },
        { keywords: ['transport', 'bus', 'train', 'taxi', 'metro', '교통', '버스', '지하철'], reply: t('chatBotReplies.transport') },
        { keywords: ['budget', 'cost', 'money', 'price', '예산', '비용', '돈'], reply: t('chatBotReplies.budget') },
        { keywords: ['safe', 'safety', 'crime', 'danger', '보안', '안전', '위험'], reply: t('chatBotReplies.safety') },
    ];

    const send = () => {
        try {
            const text = inp.trim();
            if (!text) return;
            
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
                        : t('chatBotReplyDefault', { text, destination });
                    setMsgs(prev => [...prev, { role: 'assistant', text: reply }]);
                } catch (err) {
                    setMsgs(prev => [...prev, { role: 'assistant', text: t('chatBotError') }]);
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
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-secondary">
                        <Sparkles size={16} />
                    </div>
                    <span className="text-white font-bold text-sm">WanderAI</span>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white">
                    <X size={18} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                            m.role === 'user' 
                                ? 'bg-secondary text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                        }`}>
                            {m.text}
                        </div>
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
                    placeholder={t('chatPlaceholder')}
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

export default AIChatModal;
