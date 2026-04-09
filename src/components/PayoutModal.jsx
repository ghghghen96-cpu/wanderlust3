import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
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
                onClose();
            }, 2500);
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={!isSubmitting && !isSuccess ? onClose : null}
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                    {isSuccess ? (
                        <div className="p-10 flex flex-col items-center justify-center text-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
                            >
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </motion.div>
                            <h2 className="text-2xl font-serif italic text-stone-900 mb-2">Payout Requested!</h2>
                            <p className="text-stone-500 font-sans">Your funds will be transferred to your account within 3-5 business days. Status marked as 'Pending'.</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="bg-stone-50 border-b border-stone-100 px-6 py-5 flex items-center justify-between">
                                <h3 className="text-xl font-serif italic text-stone-800">Request Payout</h3>
                                <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="mb-6 bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-sm text-stone-800 font-medium mb-1">Available to withdraw</p>
                                        <p className="text-2xl font-serif font-bold text-amber-600">${parseFloat(balance).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Bank Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700" 
                                            placeholder="e.g. Chase Bank"
                                            value={bankName}
                                            onChange={e => setBankName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Account Number</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700 font-mono" 
                                            placeholder="000123456789"
                                            value={accountNumber}
                                            onChange={e => setAccountNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Account Holder Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-700" 
                                            placeholder="e.g. John Doe"
                                            value={accountHolder}
                                            onChange={e => setAccountHolder(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`w-full mt-8 py-3.5 rounded-lg text-center font-bold text-white tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                                        isSubmitting ? 'bg-stone-400 cursor-not-allowed' : 'bg-stone-900 hover:bg-amber-500 shadow-md hover:shadow-xl'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Payout'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PayoutModal;
