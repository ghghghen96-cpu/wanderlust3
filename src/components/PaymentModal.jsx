import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldCheck, CheckCircle, CreditCard, Globe, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as PortOne from '@portone/browser-sdk/v2';

// ─── 환경 변수 (Vite: import.meta.env.VITE_*) ────────────────────────────────
const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID;
const KR_CHANNEL_KEY = import.meta.env.VITE_KR_CHANNEL_KEY;
const CARD_CHANNEL_KEY = import.meta.env.VITE_CARD_CHANNEL_KEY || KR_CHANNEL_KEY; // 카드 전용 키가 없으면 기본 키 사용
const GLOBAL_CHANNEL_KEY = import.meta.env.VITE_GLOBAL_CHANNEL_KEY;

// ─── 결제 수단 옵션 ────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
    {
        id: 'kakaopay',
        label: '카카오페이',
        icon: '💛',
        currency: 'KRW',
        channelKey: KR_CHANNEL_KEY,
        method: { type: 'EASY_PAY', easyPayProvider: 'KAKAOPAY' },
    },
    {
        id: 'card',
        label: '신용/체크카드',
        icon: '💳',
        currency: 'KRW',
        channelKey: CARD_CHANNEL_KEY,
        method: { type: 'CARD' },
    },
    {
        id: 'paypal',
        label: 'PayPal (USD)',
        icon: '🌐',
        currency: 'USD',
        channelKey: GLOBAL_CHANNEL_KEY,
        method: { type: 'PAYPAL' },
    },
];

// ─── 금액 변환 ────────────────────────────────────────────────────────────────
// KRW, USD 공통: 포트원 V2 일부 PG는 소수점을 허용하지 않으므로 안전하게 정수화 (Math.round)
// 환율: 1 USD ≈ 1,400 KRW (실서비스 시 실시간 환율 API 연동 권장)
const EXCHANGE_RATE_KRW = 1400;

const getAmount = (priceUSD, currency) => {
    const baseAmount = currency === 'KRW' 
        ? Number(priceUSD) * EXCHANGE_RATE_KRW 
        : Number(priceUSD);
    
    // 모든 통화에 대해 Math.round를 적용하여 PG사 소수점 오류 방지
    return Math.round(baseAmount);
};

// ─── 고유한 주문 ID 생성 ────────────────────────────────────────────────────
const generateOrderId = () => `wanderlust-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ─── PAYMENT MODAL COMPONENT ──────────────────────────────────────────────────
const PaymentModal = ({ isOpen, onClose, plan, onSuccess, user }) => {
    const { t } = useTranslation();
    const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handlePay = async () => {
        // ─── 디버깅: 어떤 키가 누락되었는지 콘솔에서 확인 가능 ─────────────────────
        console.log('[PortOne Debug] Store ID:', STORE_ID ? 'OK' : 'MISSING');
        console.log('[PortOne Debug] Channel Key:', selectedMethod.channelKey ? 'OK' : 'MISSING');
        console.log('[PortOne Debug] Selected Method:', selectedMethod.id);

        if (!STORE_ID) {
            setErrorMsg('VITE_PORTONE_STORE_ID 환경 변수가 설정되지 않았습니다. 서버를 재시작해 보세요.');
            return;
        }
        if (!selectedMethod.channelKey) {
            setErrorMsg(`${selectedMethod.label}용 채널 키(VITE_KR_CHANNEL_KEY 등)가 누락되었습니다.`);
            return;
        }

        setIsProcessing(true);
        setErrorMsg('');

        const orderId = generateOrderId();
        const currency = selectedMethod.currency;
        // 포트원 V2의 일부 PG는 USD인 경우에도 소수점을 허용하지 않을 수 있으므로 정수화 고려
        // 만약 $9.99 같은 소수점이 꼭 필요하다면 PG 설정을 확인해야 합니다.
        // 여기서는 안전하게 Math.round를 적용합니다.
        const amount = getAmount(plan.price, currency);

        try {
            // ─── 포트원 V2 결제 요청 ───────────────────────────────────────────
            const response = await PortOne.requestPayment({
                storeId: STORE_ID,
                channelKey: selectedMethod.channelKey,
                paymentId: orderId,
                orderName: plan.title,
                totalAmount: amount,
                currency: currency, // CURRENCY_ 제거 (V2 표준)
                payMethod: selectedMethod.method.type,
                ...(selectedMethod.method.easyPayProvider && {
                    easyPay: { easyPayProvider: selectedMethod.method.easyPayProvider },
                }),
                customer: {
                    email: user?.email || '',
                    fullName: user?.displayName || 'Wanderlust User',
                },
                bypass: {
                    // 테스트 환경에서 바로 성공 처리 (실서비스 시 제거)
                    ...(import.meta.env.DEV && { testPayment: true }),
                },
            });

            // ─── 결제창 닫힘 / 취소 처리 ─────────────────────────────────────
            if (!response || response.code) {
                const errCode = response?.code || 'UNKNOWN';
                if (errCode === 'PORTONE_ACCOUNT_NOT_CONNECTED' || errCode.includes('CANCEL')) {
                    setErrorMsg('결제가 취소되었습니다. 다시 시도해주세요.');
                } else {
                    setErrorMsg(`결제 실패: ${response?.message || '알 수 없는 오류'} (${errCode})`);
                }
                setIsProcessing(false);
                return;
            }

            // ─── 결제 성공 → DB 기록 및 상태 업데이트 ───────────────────────
            if (response.paymentId) {
                // 부모(Marketplace)로 성공 이벤트 전달 → DB 기록 & 구매 상태 업데이트
                const responseData = {
                    ...plan,
                    paymentId: response.paymentId,
                    orderId,
                    paidAmount: amount,
                    paidCurrency: currency,
                };
                onSuccess(responseData);

                // 성공 화면 표시
                setIsSuccess(true);
            } else {
                setErrorMsg(t('payment.invalidResponse'));
                setIsProcessing(false);
            }

        } catch (err) {
            console.error('[PortOne] 결제 오류:', err);
            if (err?.message?.includes('cancel') || err?.message?.includes('닫')) {
                setErrorMsg('결제창을 닫으셨습니다. 다시 시도해주세요.');
            } else {
                setErrorMsg(`결제 중 오류가 발생했습니다: ${err.message || '네트워크 오류'}`);
            }
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {/* 배경 오버레이 - 클릭 시 닫힘 */}
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                onClick={!isProcessing ? onClose : undefined}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#111111] border border-[#334155] rounded-[24px] w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 배경 글로우 */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[220px] h-[110px] bg-[#FF8A71]/15 blur-[70px] pointer-events-none" />

                    {/* ─── 닫기 버튼 ─────────────────────────────────────── */}
                    {!isProcessing && !isSuccess && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors z-50 p-2 hover:bg-[#1E293B] rounded-full cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {/* ─── 성공 화면 ──────────────────────────────────────── */}
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-10 text-center flex flex-col items-center justify-center min-h-[380px] relative z-10"
                        >
                            <div className="w-24 h-24 bg-gradient-to-tr from-[#34d399]/20 to-[#10b981]/20 text-[#10b981] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-[#10b981]/30">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-serif mb-2 text-white">{t('payment.successTitle')}</h3>
                            <p className="text-slate-400 text-sm mb-6">{t('payment.successSubtitle')}</p>
                            
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-gradient-to-r from-[#FF8A71] to-[#FF6B9B] text-white font-bold rounded-xl shadow-lg hover:shadow-[#FF8A71]/20 transition-all active:scale-95 cursor-pointer"
                            >
                                {t('payment.viewDetails')}
                            </button>
                            
                            <p className="text-xs text-slate-500 mt-6 animate-pulse">{t('payment.autoRedirect')}</p>
                        </motion.div>
                    ) : (
                        /* ─── 결제 폼 ───────────────────────────────────── */
                        <div className="p-8 relative z-10">
                            {/* 헤더 */}
                            <div className="mb-6 pr-8">
                                <h2 className="text-2xl font-serif text-white mb-1">{t('payment.title')}</h2>
                                <p className="text-slate-400 text-sm">{t('payment.subtitle')}</p>
                            </div>

                            {/* 상품 요약 */}
                            <div className="bg-[#1E293B]/50 p-4 rounded-xl mb-6 border border-[#334155] flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#334155] shrink-0">
                                    <img
                                        src={plan.image || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=200'}
                                        alt="Plan"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-200 truncate">{plan.title}</h4>
                                    <p className="text-xs text-slate-500">{t('payment.creator', { name: plan.creator || plan.creatorName })}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="font-bold text-lg bg-gradient-to-r from-[#FF8A71] to-[#FF6B9B] bg-clip-text text-transparent">
                                        ${plan.price}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {selectedMethod.currency === 'KRW'
                                            ? `≈ ₩${getAmount(plan.price, 'KRW').toLocaleString()}`
                                            : '$'}
                                    </div>
                                </div>
                            </div>

                            {/* 결제 수단 선택 */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    {t('payment.methodTitle')}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PAYMENT_METHODS.map((method) => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setSelectedMethod(method)}
                                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                                selectedMethod.id === method.id
                                                    ? 'border-[#FF8A71] bg-[#FF8A71]/10 text-white'
                                                    : 'border-[#334155] text-slate-400 hover:border-[#475569] hover:text-slate-300'
                                            }`}
                                        >
                                            <span className="text-xl">{method.icon}</span>
                                            <span className="leading-tight text-center">{method.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 결제 정보 요약 */}
                            <div className="bg-[#1E293B]/30 rounded-xl p-4 mb-5 border border-[#334155]/50 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">{t('payment.methodTitle')}</span>
                                    <span className="text-white font-medium">
                                        {selectedMethod.icon} {selectedMethod.label}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">{t('marketplace.budget')}</span>
                                    <span className="text-white font-medium">{selectedMethod.currency}</span>
                                </div>
                                <div className="border-t border-[#334155]/50 pt-2 flex justify-between">
                                    <span className="text-slate-300 font-bold">{t('payment.finalAmount')}</span>
                                    <span className="font-bold bg-gradient-to-r from-[#FF8A71] to-[#FF6B9B] bg-clip-text text-transparent text-base">
                                        {selectedMethod.currency === 'KRW'
                                            ? `₩${getAmount(plan.price, 'KRW').toLocaleString()}`
                                            : `$${plan.price}`}
                                    </span>
                                </div>
                            </div>

                            {/* 에러 메시지 */}
                            {errorMsg && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                                >
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </motion.div>
                            )}

                            {/* 결제 버튼 */}
                            <button
                                type="button"
                                onClick={handlePay}
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-xl text-center font-bold text-white tracking-wide shadow-lg transition-all duration-300 border border-[#FF8A71]/20 hover:border-[#FF8A71]/50 cursor-pointer ${
                                    isProcessing
                                        ? 'bg-[#334155] cursor-wait text-slate-400'
                                        : 'bg-gradient-to-r from-[#FF8A71]/80 to-[#FF6B9B]/80 hover:from-[#FF8A71] hover:to-[#FF6B9B]'
                                }`}
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {t('payment.processing')}
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        {selectedMethod.id === 'paypal' ? <Globe size={18} /> : <CreditCard size={18} />}
                                        {t('payment.payWith', { method: selectedMethod.label })}
                                        <span className="opacity-60">•</span>
                                        {selectedMethod.currency === 'KRW'
                                            ? `₩${getAmount(plan.price, 'KRW').toLocaleString()}`
                                            : `$${plan.price}`}
                                    </span>
                                )}
                            </button>

                            {/* 보안 뱃지 */}
                            <div className="flex items-center justify-center gap-2 mt-5 text-slate-500 text-xs font-medium">
                                <ShieldCheck size={13} />
                                <span>{t('payment.security')}</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;
