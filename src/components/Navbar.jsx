import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Compass, LogOut, User, Menu, X } from 'lucide-react';
import { auth, logout } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginModal from './LoginModal';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = ({ i18n, isMobile = false }) => {
    const currentLang = i18n.language;
    const languages = [
        { code: 'en', label: 'EN' },
        { code: 'ko', label: 'KO' }
    ];

    return (
        <div className={`relative flex items-center bg-[#1E293B] backdrop-blur-sm border border-[#334155] rounded-full p-1 ${isMobile ? 'w-full max-w-[160px]' : 'w-24'}`}>
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`relative z-10 flex-1 py-1 text-xs font-bold tracking-widest transition-colors duration-300 ${
                        currentLang === lang.code ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    {lang.label}
                    {currentLang === lang.code && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-full -z-10 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #FF8A71 0%, #FF6B9B 100%)' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            unsubscribe();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setIsMobileMenuOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
            
            <nav className={`fixed top-0 w-full z-50 flex justify-between items-center transition-all duration-500 border-b border-white/5 ${
                isScrolled ? 'bg-[#111111]/80 backdrop-blur-xl py-4 shadow-2xl' : 'bg-[#111111]/60 backdrop-blur-md py-6'
            } px-6 md:px-10`}>
                
                {/* Logo */}
                <RouterLink to="/" className="flex items-center gap-3 group">
                    <Compass size={32} className="text-white group-hover:rotate-45 transition-transform duration-500" />
                    <span className="text-2xl md:text-3xl font-serif italic tracking-wider text-white">WanderLust</span>
                </RouterLink>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-6 items-center">
                    
                    <RouterLink 
                        to="/marketplace" 
                        className="text-xs font-bold tracking-[0.1em] uppercase text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        {t('nav.marketplace')}
                    </RouterLink>

                    {/* Language Selector Desktop */}
                    <LanguageSwitcher i18n={i18n} />

                    {user ? (
                        <div className="flex items-center gap-4 border-l border-[#334155] pl-6 ml-2">
                            <RouterLink to="/mypage" className="text-xs font-bold tracking-[0.1em] uppercase text-slate-300 hover:text-white transition-colors">
                                {t('nav.myTrips')}
                            </RouterLink>
                            <div className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#334155] transition-colors px-3 py-1.5 rounded-full border border-[#334155] cursor-pointer">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full border border-white/20" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                                        <User size={12} className="text-white" />
                                    </div>
                                )}
                                <span className="text-xs font-bold tracking-wider text-white">{user.displayName || t('nav.traveler')}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-[#FF6B9B] transition-colors"
                                title={t('nav.logout')}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 border-l border-[#334155] pl-6 ml-2">
                            <RouterLink 
                                to="/login"
                                className="text-xs font-bold tracking-[0.1em] uppercase text-white px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
                            >
                                {t('nav.login')}
                            </RouterLink>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-slate-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-full left-0 w-full bg-[#111111] border-b border-[#334155] p-6 flex flex-col gap-6 md:hidden shadow-2xl"
                        >
                            {/* Language Selector Mobile */}
                            <div className="flex items-center justify-between py-2 border-b border-[#334155]">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t('nav.language')}</span>
                                <LanguageSwitcher i18n={i18n} isMobile={true} />
                            </div>

                            <RouterLink to="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-widest uppercase text-slate-200 flex items-center justify-between py-2">
                                {t('nav.marketplace')}
                            </RouterLink>

                            {user ? (
                                <>
                                    <RouterLink to="/mypage" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-widest uppercase text-slate-200 py-2">{t('nav.myTrips')}</RouterLink>
                                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-sm font-bold tracking-widest uppercase text-[#FF8A71] hover:text-[#FF6B9B] text-left py-2 transition-colors">{t('nav.logout')}</button>
                                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#334155]">
                                        {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-[#334155]" />}
                                        <span className="text-white font-medium text-sm">{user.displayName}</span>
                                    </div>
                                </>
                            ) : (
                                <RouterLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 text-center text-sm font-bold tracking-widest uppercase text-white py-3 rounded-full bg-gradient-to-r from-[#FF8A71] to-[#FF6B9B] shadow-lg">
                                    {t('nav.login')}
                                </RouterLink>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            {/* Spacer */}
            <div className="h-[80px] bg-[#111111]" />
        </>
    );
};

export default Navbar;
