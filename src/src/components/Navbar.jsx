import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, LogOut, User, Menu, X } from 'lucide-react';
import { auth, logout } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginModal from './LoginModal';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = ({ i18n, isMobile = false }) => {
    const currentLang = i18n.language;
    const languages = [
        { code: 'en', label: isMobile ? 'English' : 'EN' },
        { code: 'ko', label: isMobile ? '한국어' : 'KO' }
    ];

    return (
        <div className={`relative flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1 ${isMobile ? 'w-full max-w-[200px]' : 'w-24'}`}>
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`relative z-10 flex-1 py-1.5 text-xs font-black tracking-widest uppercase transition-colors duration-300 ${
                        currentLang === lang.code ? 'text-secondary' : 'text-white/40 hover:text-white/70'
                    }`}
                >
                    {lang.label}
                    {currentLang === lang.code && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
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
            
            <nav className="fixed top-0 w-full z-50 px-6 md:px-10 py-6 flex justify-between items-center transition-all duration-300 bg-secondary/20 backdrop-blur-md border-b border-white/10">
                <Link to="/" className="flex items-center gap-3 group">
                    <Compass size={64} className="text-white drop-shadow-md group-hover:rotate-45 transition-transform duration-500" />
                    <span className="text-4xl md:text-5xl font-serif italic tracking-wider text-white drop-shadow-md">WanderLust</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-8 items-center">
                    
                    {/* Language Selector Desktop */}
                    <LanguageSwitcher i18n={i18n} />

                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link to="/mypage" className="text-sm font-bold tracking-[0.2em] uppercase text-white/70 hover:text-white transition-colors">
                                {t('nav.myTrips')}
                            </Link>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white/40" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <User size={16} className="text-white" />
                                    </div>
                                )}
                                <span className="text-xs font-bold tracking-wider uppercase text-white">{user.displayName || t('nav.traveler')}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-white/60 hover:text-white transition-colors"
                                title={t('nav.logout')}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link 
                            to="/login"
                            className="text-2xl font-bold tracking-[0.2em] uppercase text-white hover:underline underline-offset-8 decoration-2"
                        >
                            {t('nav.login')}
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-white p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Drawer */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-secondary/95 backdrop-blur-xl border-b border-white/10 p-8 flex flex-col gap-6 md:hidden animate-in slide-in-from-top duration-300 shadow-2xl">
                        <div className="h-[1px] bg-white/10 w-full" />
                        
                        {/* Language Selector Mobile */}
                        <div className="flex flex-col gap-3 py-2">
                            <span className="text-white/60 text-sm font-bold uppercase tracking-wider">{t('nav.language')}</span>
                            <LanguageSwitcher i18n={i18n} isMobile={true} />
                        </div>

                        {user ? (
                            <>
                                <div className="flex items-center gap-4 mb-2">
                                    {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border border-white/20" />}
                                    <span className="text-white font-bold text-lg">{user.displayName}</span>
                                </div>
                                <Link to="/mypage" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold tracking-widest uppercase text-white/80 hover:text-white py-2 transition-colors">{t('nav.myTrips')}</Link>
                                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-base font-bold tracking-widest uppercase text-white/80 hover:text-white text-left py-2 transition-colors">{t('nav.logout')}</button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold tracking-widest uppercase text-white py-2 hover:text-primary transition-colors">{t('nav.login')}</Link>
                        )}
                    </div>
                )}
            </nav>
            {/* Spacer to prevent content from going under fixed navbar */}
            <div className="h-24 w-full" />
        </>
    );
};

export default Navbar;
