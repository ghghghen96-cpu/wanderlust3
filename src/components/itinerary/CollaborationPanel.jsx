import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, FileText, Send, X, Users, Copy, Check, Crown } from 'lucide-react';
import { subscribeToChat, sendChatMessage, subscribeToSession, updateSessionData } from '../../firebase';
import { useTranslation } from 'react-i18next';

/**
 * CollaborationPanel - 실시간 공동 작업 패널
 * - Memo 탭: 공동 메모 (실시간 동기화)
 * - Chat 탭: 실시간 채팅
 * - People 탭: 현재 접속자 목록
 */
export default function CollaborationPanel({ sessionId, user, isOpen, onClose, activeUsers = {} }) {
    const { t } = useTranslation('translation', { keyPrefix: 'itinerary' });
    const [activeTab, setActiveTab] = useState('chat'); // 'memo' | 'chat' | 'people'
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [memoContent, setMemoContent] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const messagesEndRef = useRef(null);
    const memoTimeoutRef = useRef(null);
    const chatInputRef = useRef(null);

    // 게스트 이름 생성 (로그인하지 않은 경우)
    const [guestName] = useState(
        () => user?.displayName || `Traveler-${Math.floor(Math.random() * 1000)}`
    );
    const chatUser = user
        ? { uid: user.uid, displayName: user.displayName || '여행자', photoURL: user.photoURL }
        : { id: guestName, name: guestName };

    // 채팅 & 메모 실시간 구독
    useEffect(() => {
        if (!sessionId || !isOpen) return;

        const unsubChat = subscribeToChat(sessionId, (msgs) => {
            setMessages(msgs);
            // 새 메시지 수신 시 스크롤 하단 이동
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });

        const unsubMemo = subscribeToSession(sessionId, (data) => {
            if (data && data.memos !== undefined) {
                setMemoContent(data.memos);
            }
        });

        return () => {
            if (unsubChat) unsubChat();
            if (unsubMemo) unsubMemo();
        };
    }, [sessionId, isOpen]);

    // 채팅 탭 전환 시 입력창 포커스
    useEffect(() => {
        if (activeTab === 'chat' && isOpen) {
            setTimeout(() => chatInputRef.current?.focus(), 300);
        }
    }, [activeTab, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !sessionId) return;
        try {
            await sendChatMessage(sessionId, chatUser, chatInput.trim());
            setChatInput('');
        } catch (err) {
            console.error('메시지 전송 실패', err);
        }
    };

    const handleMemoChange = (e) => {
        const val = e.target.value;
        setMemoContent(val);
        if (memoTimeoutRef.current) clearTimeout(memoTimeoutRef.current);
        memoTimeoutRef.current = setTimeout(() => {
            if (sessionId) updateSessionData(sessionId, { memos: val });
        }, 500);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    // 현재 접속자 배열
    const userEntries = Object.entries(activeUsers || {});

    // sessionId가 없으면 안내 화면
    if (!sessionId) {
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
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-amber-500" />
                                <span className="font-bold text-gray-800">공동 작업</span>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <Users size={28} className="text-amber-500" />
                            </div>
                            <h3 className="text-lg font-black text-gray-800 mb-2">공유 후 사용 가능</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                상단 <strong>공유(🔗) 버튼</strong>을 눌러 공유 링크를 생성하면<br />
                                채팅, 메모, 공동 편집을 함께 사용할 수 있습니다.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

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
                    {/* 헤더 */}
                    <div className="p-4 border-b border-gray-100 bg-white">
                        {/* 상단: 제목 + 접속자 아바타 + 닫기 */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-bold text-green-600">LIVE</span>
                                </div>
                                {/* 접속자 아바타 목록 */}
                                {userEntries.length > 0 && (
                                    <div className="flex -space-x-2 ml-2">
                                        {userEntries.slice(0, 5).map(([uid, u]) => (
                                            <div
                                                key={uid}
                                                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                                                style={{ backgroundColor: u.color || '#888' }}
                                                title={u.displayName}
                                            >
                                                {u.photoURL
                                                    ? <img src={u.photoURL} alt={u.displayName} className="w-full h-full rounded-full object-cover" />
                                                    : (u.displayName ? u.displayName.charAt(0).toUpperCase() : '?')
                                                }
                                            </div>
                                        ))}
                                        {userEntries.length > 5 && (
                                            <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                                                +{userEntries.length - 5}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <span className="text-xs text-gray-400 font-medium ml-1">
                                    {userEntries.length > 0 ? `${userEntries.length}명 접속 중` : '접속자 없음'}
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                                <X size={18} />
                            </button>
                        </div>

                        {/* 링크 복사 버튼 */}
                        <button
                            onClick={handleCopyLink}
                            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all mb-3 ${
                                linkCopied
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                        >
                            {linkCopied ? <Check size={15} /> : <Copy size={15} />}
                            {linkCopied ? '초대 링크 복사됨!' : '초대 링크 복사'}
                        </button>

                        {/* 탭 버튼 */}
                        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                            {[
                                { id: 'chat', icon: MessageCircle, label: '채팅' },
                                { id: 'memo', icon: FileText, label: '메모' },
                                { id: 'people', icon: Users, label: `참가자 ${userEntries.length}` },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                        activeTab === tab.id
                                            ? 'bg-amber-400 text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <tab.icon size={13} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 콘텐츠 영역 */}
                    <div className="flex-1 overflow-hidden relative bg-slate-50">
                        <AnimatePresence mode="wait">
                            {/* ── 채팅 탭 ── */}
                            {activeTab === 'chat' && (
                                <motion.div
                                    key="chat"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.15 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {messages.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                                <MessageCircle size={32} className="text-gray-300 mb-3" />
                                                <p className="text-sm text-gray-400 font-medium">아직 메시지가 없습니다</p>
                                                <p className="text-xs text-gray-300 mt-1">먼저 인사해 보세요! 👋</p>
                                            </div>
                                        )}
                                        {messages.map(msg => {
                                            const isMe = msg.userId === chatUser.uid || msg.userId === chatUser.id;
                                            const time = msg.timestamp?.toDate?.()?.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) || '';
                                            return (
                                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    {!isMe && (
                                                        <span className="text-[11px] text-gray-400 font-bold mb-1 px-1">
                                                            {msg.displayName || '여행자'}
                                                        </span>
                                                    )}
                                                    <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                                                        isMe
                                                            ? 'bg-amber-400 text-white rounded-tr-sm'
                                                            : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'
                                                    }`}>
                                                        {msg.text}
                                                    </div>
                                                    <span className="text-[10px] text-gray-300 mt-1 px-1">{time}</span>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="p-4 bg-white border-t border-gray-100">
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <input
                                                ref={chatInputRef}
                                                type="text"
                                                value={chatInput}
                                                onChange={e => setChatInput(e.target.value)}
                                                placeholder="메시지 입력..."
                                                className="flex-1 px-4 py-3 bg-gray-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-amber-200 transition-all"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!chatInput.trim()}
                                                className="p-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl shadow-md disabled:opacity-40 transition-all hover:shadow-lg active:scale-95"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </form>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── 메모 탭 ── */}
                            {activeTab === 'memo' && (
                                <motion.div
                                    key="memo"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.15 }}
                                    className="h-full p-4 flex flex-col"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-xs text-gray-500 font-bold">실시간 공동 메모 · 자동 저장</span>
                                    </div>
                                    <textarea
                                        className="flex-1 w-full p-4 bg-yellow-50/50 rounded-2xl resize-none outline-none border border-yellow-100 shadow-inner text-gray-700 placeholder-yellow-300/80 leading-relaxed font-medium focus:ring-2 focus:ring-yellow-200 transition-all text-sm"
                                        placeholder="여행 메모를 함께 작성하세요...&#10;예: 짐 챙기기 목록, 현지 팁, 식당 예약 정보 등"
                                        value={memoContent}
                                        onChange={handleMemoChange}
                                    />
                                </motion.div>
                            )}

                            {/* ── 참가자 탭 ── */}
                            {activeTab === 'people' && (
                                <motion.div
                                    key="people"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.15 }}
                                    className="h-full overflow-y-auto p-4"
                                >
                                    {userEntries.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <Users size={32} className="text-gray-300 mb-3" />
                                            <p className="text-sm text-gray-400 font-medium">아직 접속자가 없습니다</p>
                                            <p className="text-xs text-gray-300 mt-1">링크를 공유해서 친구를 초대하세요!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                                현재 접속 중 · {userEntries.length}명
                                            </p>
                                            {userEntries.map(([uid, u], idx) => (
                                                <div key={uid} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0"
                                                        style={{ backgroundColor: u.color || '#888' }}
                                                    >
                                                        {u.photoURL
                                                            ? <img src={u.photoURL} alt={u.displayName} className="w-full h-full rounded-full object-cover" />
                                                            : (u.displayName ? u.displayName.charAt(0).toUpperCase() : '?')
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-gray-800 text-sm truncate">
                                                                {u.displayName || '여행자'}
                                                            </span>
                                                            {idx === 0 && (
                                                                <Crown size={12} className="text-amber-400 shrink-0" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                                            <span className="text-xs text-gray-400">접속 중</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
