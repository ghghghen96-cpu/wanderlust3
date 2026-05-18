import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, DollarSign, Building, CreditCard, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const PayoutModal = ({ isOpen, onClose, balance, onConfirm }) => {
    const { t } = useTranslation();
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onConfirm(balance, { bankName, accountNumber, accountHolder });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setBankName('');
                setAccountNumber('');
                setAccountHolder('');
                onClose();
            }, 2500);
        } catch (error) {
            console.error('[PayoutModal] 출금 신청 오류:', error);
            setIsSubmitting(false);
        }
    };

    // 입력 필드 공통 스타일
    const inputClass = `
        w-full px-4 py-3 rounded-xl border border-[#334155] 
        bg-[#1E293B]/80 text-slate-200 placeholder-slate-500
        focus:outline-none focus:ring-2 focus:ring-[#FF8A71]/50 focus:border-[#FF8A71]/50
        transition-all duration-200 text-sm
    `;

    const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2";

    return (
        <AnimatePresence>
            {/* 배경 오버레이 */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    onClick={!isSubmitting && !isSuccess ? onClose : undefined}
                />

                {/* 모달 본체 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-[#111111] border border-[#334155] rounded-[24px] w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                    {/* 배경 글로우 */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[220px] h-[120px] bg-[#FF8A71]/10 blur-[70px] pointer-events-none" />

                    {/* 성공 화면 */}
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-10 text-center flex flex-col items-center justify-center min-h-[340px] relative z-10"
                        >
                            <div className="w-20 h-20 bg-gradient-to-tr from-[#34d399]/20 to-[#10b981]/20 rounded-full flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(16,185,129,0.25)] border border-[#10b981]/30">
                                <CheckCircle size={40} className="text-[#10b981]" />
                            </div>
                            <h3 className="text-2xl font-serif text-white mb-2">
                                {t('myPage.withdrawSuccess') || '출금 신청 완료!'}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                                영업일 기준 3-5일 내 입금됩니다.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="relative z-10">
                            {/* 헤더 */}
                            <div className="flex items-center justify-between px-7 py-5 border-b border-[#334155]/60">
                                <div>
                                    <h3 className="text-lg font-serif text-white">
                                        {t('myPage.withdraw') || '출금 신청'}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {t('myPage.availablePayoutLabel') || '출금 가능 금액'}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-[#1E293B] rounded-full"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* 잔액 표시 */}
                            <div className="mx-6 mt-5 bg-gradient-to-r from-[#FF8A71]/10 to-[#FF6B9B]/10 border border-[#FF8A71]/20 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#FF8A71]/20 rounded-full flex items-center justify-center shrink-0">
                                    <DollarSign size={18} className="text-[#FF8A71]" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">
                                        {t('myPage.readyToWithdraw') || '정산 대기 중'}
                                    </p>
                                    <p className="text-2xl font-black bg-gradient-to-r from-[#FF8A71] to-[#FF6B9B] bg-clip-text text-transparent">
                                        ${parseFloat(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* 주의사항 */}
                            <div className="mx-6 mt-3 flex items-start gap-2 text-xs text-amber-400/80">
                                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                                <span>영업일 기준 3~5일 내 지정 계좌로 송금됩니다.</span>
                            </div>

                            {/* 폼 */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* 은행명 */}
                                <div>
                                    <label className={labelClass}>
                                        <Building size={10} className="inline mr-1.5 opacity-60" />
                                        {t('myPage.bankName') || '은행명'}
                                    </label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="예: 국민은행, Kakao Bank"
                                        value={bankName}
                                        onChange={e => setBankName(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* 계좌번호 */}
                                <div>
                                    <label className={labelClass}>
                                        <CreditCard size={10} className="inline mr-1.5 opacity-60" />
                                        {t('myPage.accountNumber') || '계좌번호'}
                                    </label>
                                    <input
                                        type="text"
                                        className={`${inputClass} font-mono tracking-wider`}
                                        placeholder="숫자만 입력 (예: 110-123-456789)"
                                        value={accountNumber}
                                        onChange={e => setAccountNumber(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* 예금주 */}
                                <div>
                                    <label className={labelClass}>
                                        <User size={10} className="inline mr-1.5 opacity-60" />
                                        {t('myPage.accountHolder') || '예금주명'}
                                    </label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="예: 홍길동"
                                        value={accountHolder}
                                        onChange={e => setAccountHolder(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* 제출 버튼 */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full mt-2 py-4 rounded-xl font-bold text-white tracking-wide transition-all duration-300 cursor-pointer ${
                                        isSubmitting
                                            ? 'bg-[#334155] cursor-wait text-slate-400'
                                            : 'bg-gradient-to-r from-[#FF8A71] to-[#FF6B9B] hover:opacity-90 shadow-[0_8px_24px_rgba(255,138,113,0.3)] hover:shadow-[0_12px_30px_rgba(255,138,113,0.4)] hover:scale-[1.01] active:scale-[0.99]'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            처리 중...
                                        </span>
                                    ) : (
                                        t('myPage.withdraw') || '출금 신청하기'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PayoutModal;
