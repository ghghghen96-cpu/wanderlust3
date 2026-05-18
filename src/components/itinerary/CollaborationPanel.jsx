import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, FileText, Send, X, User } from 'lucide-react';
import { subscribeToChat, sendChatMessage, subscribeToSession, updateSessionData } from '../../firebase';
import { useTranslation } from 'react-i18next';

export default function CollaborationPanel({ sessionId, user, isOpen, onClose }) {
    const { t } = useTranslation('translation', { keyPrefix: 'itinerary' });
    const [activeTab, setActiveTab] = useState('memo'); // 'memo' | 'chat'
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [memoContent, setMemoContent] = useState('');
    const messagesEndRef = useRef(null);
    const memoTimeoutRef = useRef(null);

    // Guest name generator if no user
    const [guestName] = useState(() => user?.displayName || `Traveler-${Math.floor(Math.random() * 1000)}`);
    const chatUser = user ? { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL } : { id: guestName, name: guestName };

    useEffect(() => {
        if (!sessionId || !isOpen) return;
        
        const unsubChat = subscribeToChat(sessionId, (msgs) => {
            setMessages(msgs);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        const unsubMemo = subscribeToSession(sessionId, (data) => {
            if (data && data.memos !== undefined) {
                // To prevent overwriting while typing, only update if input is not active, 
                // but for simplicity, we update it. Real-time text editors are tricky.
                // A better way is to update only if not currently focused, or just sync it.
                setMemoContent(data.memos);
            }
        });

        return () => {
            if (unsubChat) unsubChat();
            if (unsubMemo) unsubMemo();
        };
    }, [sessionId, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !sessionId) return;
        try {
            await sendChatMessage(sessionId, chatUser, chatInput);
            setChatInput('');
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const handleMemoChange = (e) => {
        const val = e.target.value;
        setMemoContent(val);
        if (memoTimeoutRef.current) clearTimeout(memoTimeoutRef.current);
        memoTimeoutRef.current = setTimeout(() => {
            if (sessionId) {
                updateSessionData(sessionId, { memos: val });
            }
        }, 500); // 500ms debounce
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-50 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveTab('memo')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'memo' ? 'bg-amber-400 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <FileText size={16} /> Memo
                            </button>
                            <button 
                                onClick={() => setActiveTab('chat')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-amber-400 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <MessageCircle size={16} /> Chat
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative bg-slate-50">
                        {activeTab === 'memo' ? (
                            <div className="h-full p-4 flex flex-col">
                                <textarea 
                                    className="flex-1 w-full p-4 bg-yellow-50/50 rounded-2xl resize-none outline-none border border-yellow-100 shadow-inner text-gray-700 placeholder-yellow-300/80 leading-relaxed font-medium focus:ring-2 focus:ring-yellow-200 transition-all"
                                    placeholder="Write your shared notes here..."
                                    value={memoContent}
                                    onChange={handleMemoChange}
                                />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map(msg => {
                                        const isMe = msg.userId === chatUser.id || msg.userId === chatUser.uid;
                                        return (
                                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <span className="text-[10px] text-gray-400 font-bold mb-1 ml-1">{msg.displayName}</span>
                                                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-amber-400 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder="Say hello..."
                                            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-amber-200 transition-all"
                                        />
                                        <button type="submit" disabled={!chatInput.trim()} className="p-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl shadow-md disabled:opacity-50 transition-all hover:shadow-lg">
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
