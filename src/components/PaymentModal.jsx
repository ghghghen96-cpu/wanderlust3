import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, plan, onSuccess }) => {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form inputs
    const [card, setCard] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    if (!isOpen) return null;

    const handlePay = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        // 결제 지연 시간 시뮬레이션
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess(plan); // 부모 컴포넌트에 구매 완료 이벤트 전달
                setIsSuccess(false);
            }, 2500);
        }, 2000);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#111111] border border-[#334155] rounded-[24px] w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-[#FF8A71]/20 blur-[60px] pointer-events-none" />

                    {/* 닫기 버튼 */}
                    {!isProcessing && !isSuccess && (
                        <button 
                            onClick={onClose} 
                            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors z-10 p-2 hover:bg-[#1E293B] rounded-full"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {isSuccess ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="p-10 text-center flex flex-col items-center justify-center min-h-[400px] relative z-10"
                        >
                            <div className="w-24 h-24 bg-gradient-to-tr from-[#34d399]/20 to-[#10b981]/20 text-[#10b981] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-[#10b981]/30">
                                <CheckCircle size={48} className="animate-[bounce_0.5s_ease-out]" />
                            </div>
                            <h3 className="text-2xl font-serif mb-3 text-white">Payment Successful</h3>
                            <p className="text-slate-400">Your itinerary has been added to your library.</p>
                        </motion.div>
                    ) : (
                        <div className="p-8 relative z-10">
                            <div className="mb-8 pr-8">
                                <h2 className="text-2xl font-serif text-white mb-2">Complete Purchase</h2>
                                <p className="text-slate-400 text-sm">Unlock the full itinerary details.</p>
                            </div>

                            {/* 플랜 요약 */}
                            <div className="bg-[#1E293B]/50 p-4 rounded-xl mb-6 border border-[#334155] flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#334155]">
                                    <img src={plan.image} alt="Plan" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-200 line-clamp-1">{plan.title}</h4>
                                    <p className="text-xs text-slate-500">by {plan.creator}</p>
                                </div>
                                <div className="font-serif font-bold text-lg bg-gradient-to-r from-[#FF8A71] to-[#FF6B9B] bg-clip-text text-transparent">
                                    ${plan.price}
                                </div>
                            </div>

                            <form onSubmit={handlePay} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Card Number</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            maxLength="19"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full bg-[#1A222F] text-slate-200 pl-11 pr-4 py-3.5 border border-[#334155] rounded-xl focus:outline-none focus:border-[#FF8A71] focus:ring-1 focus:ring-[#FF8A71] transition-all font-mono text-sm placeholder-slate-600"
                                            value={card}
                                            onChange={(e) => setCard(e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 '))}
                                            required
                                        />
                                        <CreditCard size={18} className="absolute left-4 top-4 text-slate-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Expiry Date</label>
                                        <input 
                                            type="text" 
                                            placeholder="MM/YY"
                                            maxLength="5"
                                            className="w-full bg-[#1A222F] text-slate-200 px-4 py-3.5 border border-[#334155] rounded-xl focus:outline-none focus:border-[#FF8A71] focus:ring-1 focus:ring-[#FF8A71] transition-all font-mono text-sm placeholder-slate-600"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CVC</label>
                                        <input 
                                            type="password" 
                                            placeholder="123"
                                            maxLength="3"
                                            className="w-full bg-[#1A222F] text-slate-200 px-4 py-3.5 border border-[#334155] rounded-xl focus:outline-none focus:border-[#FF8A71] focus:ring-1 focus:ring-[#FF8A71] transition-all font-mono text-sm placeholder-slate-600"
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full py-4 mt-6 rounded-xl text-center font-bold text-white tracking-widest uppercase shadow-lg transition-all duration-300 relative overflow-hidden group border border-[#FF8A71]/20 hover:border-[#FF8A71]/50 ${
                                        isProcessing ? 'bg-[#334155] cursor-wait text-slate-400' : 'bg-gradient-to-r from-[#FF8A71]/80 to-[#FF6B9B]/80 hover:from-[#FF8A71] hover:to-[#FF6B9B]'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            Pay Now <span className="opacity-60">•</span> ${plan.price}
                                        </span>
                                    )}
                                </button>
                            </form>

                            <div className="flex items-center justify-center gap-2 mt-8 text-slate-500 text-xs font-medium">
                                <ShieldCheck size={14} />
                                <span>Secured by 256-bit encryption</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// 결제 완료 로직은 PaymentModal에서 수행하지 않고,
// 부모인 Marketplace.jsx에서 처리합니다. PaymentModal은 UI만 담당합니다.
export default PaymentModal;
