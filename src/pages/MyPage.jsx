import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, LogOut, MapPin, Calendar, Clock, ArrowRight,
    Compass, Trash2, ChevronRight, TrendingUp, DollarSign, 
    CreditCard, Download, ExternalLink, Receipt
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logout, getUserPurchases, listenToUserEarnings, getSalesHistory, requestPayout } from '../firebase';
import Navbar from '../components/Navbar';
import i18n from '../i18n';
import { saveSearchHistory, getSearchHistory, deleteHistoryEntry, clearSearchHistory } from '../utils/history';

// 날짜 포맷 헬퍼
const formatDate = (str) => {
    if (!str) return '';
    try {
        // i18n 언어 설정에 따라 날짜 포맷 변경
        const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
        return new Date(str).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return str; }
};

const getDays = (start, end, t) => {
    try {
        const diff = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
        return isNaN(diff) ? '' : t('itinerary.daysCount', { count: diff });
    } catch { return ''; }
};

// ─── 마이페이지 ────────────────────────────────────────────────────
const MyPage = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [earnings, setEarnings] = useState({ currentBalance: 0, totalEarnings: 0, templatesSold: 0 });
    const [salesHistory, setSalesHistory] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        let unsubEarnings = null;
        const unsubAuth = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                // 구매한 템플릿
                const userPurchases = await getUserPurchases(u.uid);
                setPurchases(userPurchases);

                // 수익 실시간 구독
                unsubEarnings = listenToUserEarnings(u.uid, (data) => {
                    setEarnings(data);
                });

                // 판매 내역 조회
                const sales = await getSalesHistory(u.uid);
                setSalesHistory(sales);
            } else {
                setPurchases([]);
                setEarnings({ currentBalance: 0, totalEarnings: 0, templatesSold: 0 });
                setSalesHistory([]);
            }
        });
        return () => {
            unsubAuth();
            if (unsubEarnings) unsubEarnings();
        };
    }, []);

    useEffect(() => {
        // localStorage에서 검색 이력 불러오기
        const load = () => {
            setHistory(getSearchHistory());
        };
        load();
        // 다른 탭에서 변경 시에도 갱신
        window.addEventListener('storage', load);
        return () => window.removeEventListener('storage', load);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const deleteEntry = (id) => {
        setHistory(deleteHistoryEntry(id));
    };

    const clearAll = () => {
        clearSearchHistory();
        setHistory([]);
    };

    const replan = (entry) => {
        navigate('/itinerary', {
            state: {
                destination: entry.destination,
                startDate: entry.startDate,
                endDate: entry.endDate,
                focus: entry.focus,
                pace: entry.pace,
                vibe: entry.vibe,
                dining: entry.dining,
            }
        });
    };

    const goToTemplate = (templateId, template) => {
        navigate(`/template/${templateId}`, { state: { template } });
    };

    // 통화 포맷팅 (언어별 분기)
    const formatMoney = (amount) => {
        const lang = i18n.language;
        if (lang === 'ko') {
            // KRW 환율 (1 USD ≈ 1400 KRW) 적용하여 원화 표시
            const amountKRW = Math.round(amount * 1400);
            return new Intl.NumberFormat('ko-KR', { 
                style: 'currency', 
                currency: 'KRW',
                maximumFractionDigits: 0 
            }).format(amountKRW);
        } else {
            return new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
            }).format(amount);
        }
    };

    const handleWithdraw = async () => {
        if (earnings.currentBalance <= 0) {
            setToast({ show: true, message: t('myPage.noBalance') });
            setTimeout(() => setToast({ show: false, message: '' }), 3000);
            return;
        }

        try {
            await requestPayout(user.uid, earnings.currentBalance, {
                bankName: t('myPage.walletName'),
                accountNumber: '**** **** 1234',
                accountHolder: user.displayName || t('myPage.anonymousUser')
            });
            setToast({ 
                show: true, 
                message: t('myPage.withdrawSuccess')
            });
            setTimeout(() => setToast({ show: false, message: '' }), 4000);
        } catch (error) {
            setToast({ show: true, message: t('myPage.payoutFail') });
            setTimeout(() => setToast({ show: false, message: '' }), 3000);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fafaf9' }}>
            <Navbar />

            {/* ── 헤더 배너 ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1c1917, #44403c)',
                padding: '80px 32px 60px',
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
                    {/* 프로필 사진 */}
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt="Profile"
                            style={{ width: '96px', height: '96px', borderRadius: '50%', border: '3px solid #FBBF24', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                        />
                    ) : (
                        <div style={{
                            width: '96px', height: '96px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)', border: '3px solid #FBBF24',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <User size={44} color="white" />
                        </div>
                    )}
                    {/* 이름 & 이메일 */}
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontFamily: 'Georgia, serif', fontStyle: 'italic',
                            fontSize: '36px', color: 'white', marginBottom: '6px'
                        }}>
                            {user?.displayName || t('myPage.traveler')}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', fontFamily: 'sans-serif', fontSize: '15px' }}>
                            <Mail size={15} />
                            <span>{user?.email || ''}</span>
                        </div>
                        <div style={{
                            marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
                            borderRadius: '20px', padding: '4px 14px',
                            color: '#FBBF24', fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 'bold'
                        }}>
                            <Compass size={13} />
                            {t('myPage.tripsCount', { count: history.length })}
                        </div>
                    </div>
                    {/* 로그아웃 버튼 */}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px',
                            color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif',
                            fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#fca5a5'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                    >
                        <LogOut size={16} /> {t('myPage.signOut')}
                    </button>
                </div>
            </div>

            {/* ── 메인 콘텐츠 ── */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>

                {/* 검색 이력 헤더 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1c1917', marginBottom: '4px' }}>
                            {t('myPage.historyTitle')}
                        </h2>
                        <p style={{ fontFamily: 'sans-serif', color: '#78716c', fontSize: '14px' }}>
                            {t('myPage.historySubtitle')}
                        </p>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={clearAll}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', background: 'transparent',
                                border: '1px solid #e7e5e4', borderRadius: '8px',
                                color: '#78716c', fontFamily: 'sans-serif', fontSize: '13px',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#78716c'; }}
                        >
                            <Trash2 size={14} /> {t('myPage.clearAll')}
                        </button>
                    )}
                </div>

                {/* 이력 목록 */}
                {history.length === 0 ? (
                    <div style={{
                        background: 'white', border: '1px solid #e7e5e4', borderRadius: '20px',
                        padding: '64px 32px', textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                    }}>
                        <MapPin size={48} color="#d6d3d1" style={{ margin: '0 auto 20px' }} />
                        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1c1917', marginBottom: '10px' }}>
                            {t('myPage.noTrips')}
                        </h3>
                        <p style={{ fontFamily: 'sans-serif', color: '#78716c', fontSize: '15px', marginBottom: '28px' }}>
                            {t('myPage.noTripsDesc')}
                        </p>
                        <Link to="/survey" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '14px 32px', background: '#1c1917', color: 'white',
                            textDecoration: 'none', borderRadius: '50px',
                            fontFamily: 'sans-serif', fontSize: '15px', fontWeight: 'bold'
                        }}>
                            {t('myPage.planFirst')} <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {history.map((entry) => (
                            <div key={entry.id} style={{
                                background: 'white', border: '1px solid #e7e5e4', borderRadius: '16px',
                                padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                                transition: 'box-shadow 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'}
                            >
                                {/* 아이콘 */}
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #92400e, #b45309)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <MapPin size={22} color="white" />
                                </div>

                                {/* 내용 */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        fontFamily: 'Georgia, serif', fontSize: '20px',
                                        color: '#1c1917', marginBottom: '6px', fontStyle: 'italic'
                                    }}>
                                        {entry.destination}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        {entry.startDate && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'sans-serif', fontSize: '13px', color: '#78716c' }}>
                                                <Calendar size={12} /> {formatDate(entry.startDate)} – {formatDate(entry.endDate)}
                                                {getDays(entry.startDate, entry.endDate, t) && ` · ${getDays(entry.startDate, entry.endDate, t)}`}
                                            </span>
                                        )}
                                        {entry.vibe && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'sans-serif', fontSize: '13px', color: '#78716c' }}>
                                                <Compass size={12} /> {entry.vibe}
                                            </span>
                                        )}
                                        {entry.pace && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'sans-serif', fontSize: '13px', color: '#78716c' }}>
                                                <Clock size={12} /> {entry.pace}
                                            </span>
                                        )}
                                    </div>
                                    {entry.focus?.length > 0 && (
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                                            {entry.focus.map(f => (
                                                <span key={f} style={{
                                                    padding: '3px 10px', background: '#fef3c7',
                                                    borderRadius: '20px', fontSize: '12px',
                                                    fontFamily: 'sans-serif', color: '#92400e', fontWeight: 'bold'
                                                }}>{f}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 액션 버튼 */}
                                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                    <button
                                        onClick={() => replan(entry)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '10px 18px', background: '#1c1917',
                                            color: 'white', border: 'none', borderRadius: '10px',
                                            fontFamily: 'sans-serif', fontSize: '13px',
                                            fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#92400e'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#1c1917'}
                                        title={t('myPage.viewItineraryTooltip')}
                                    >
                                        {t('myPage.viewPlan')} <ChevronRight size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteEntry(entry.id)}
                                        style={{
                                            padding: '10px 12px', background: 'transparent',
                                            border: '1px solid #e7e5e4', borderRadius: '10px',
                                            color: '#78716c', cursor: 'pointer', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#78716c'; }}
                                        title={t('myPage.removeHistoryTooltip')}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 새 여행 계획 CTA */}
                {history.length > 0 && (
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <Link to="/survey" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            padding: '14px 36px', background: 'transparent',
                            border: '1.5px solid #d6d3d1', borderRadius: '50px',
                            color: '#44403c', textDecoration: 'none',
                            fontFamily: 'sans-serif', fontSize: '15px',
                            fontWeight: 'bold', transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#92400e'; e.currentTarget.style.color = '#92400e'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d6d3d1'; e.currentTarget.style.color = '#44403c'; }}
                        >
                            <Compass size={17} /> {t('myPage.planNew')}
                        </Link>
                    </div>
                )}

                {/* ── 프리미엄 수익 대시보드 (Revenue Dashboard) ── */}
                <div style={{ marginTop: '80px', marginBottom: '80px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '8px' }}>
                                <div style={{ width: '24px', height: '24px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp size={14} />
                                </div>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('myPage.businessCenter')}
                                </span>
                            </div>
                            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '32px', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.02em' }}>
                                {t('myPage.revenueDashboard')}
                            </h2>
                        </div>
                        <button
                            onClick={handleWithdraw}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 24px', background: '#0f172a', color: 'white',
                                border: 'none', borderRadius: '12px', fontFamily: 'Inter, sans-serif',
                                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <Download size={16} /> {t('myPage.withdraw')}
                        </button>
                    </div>

                    {/* 스태츠 카드 그리드 (Stripe Style) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                        {[
                            { 
                                label: t('myPage.templatesSoldLabel'), 
                                value: earnings.templatesSold, 
                                sub: t('myPage.lifetimeSales'), 
                                icon: <Receipt size={20} />, 
                                color: '#6366f1',
                                trend: '+12%' 
                            },
                            { 
                                label: t('myPage.totalEarningsLabel'), 
                                value: formatMoney(earnings.totalEarnings), 
                                sub: t('myPage.grossRevenue'), 
                                icon: <DollarSign size={20} />, 
                                color: '#10b981',
                                trend: '+8.4%'
                            },
                            { 
                                label: t('myPage.availablePayoutLabel'), 
                                value: formatMoney(earnings.currentBalance), 
                                sub: t('myPage.readyToWithdraw'), 
                                icon: <CreditCard size={20} />, 
                                color: '#f59e0b',
                                trend: 'Current'
                            }
                        ].map((card, idx) => (
                            <div key={idx} style={{
                                background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px',
                                padding: '32px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                display: 'flex', flexDirection: 'column', gap: '20px',
                                transition: 'transform 0.2s ease',
                                cursor: 'default'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ color: card.color, background: `${card.color}10`, width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {card.icon}
                                    </div>
                                    <span style={{ 
                                        fontSize: '11px', fontWeight: '800', 
                                        color: card.trend.startsWith('+') ? '#10b981' : '#64748b', 
                                        background: card.trend.startsWith('+') ? '#10b98115' : '#f1f5f9',
                                        padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase'
                                    }}>
                                        {card.trend}
                                    </span>
                                </div>
                                <div>
                                    <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>{card.label}</h4>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', fontFamily: 'Inter, sans-serif', marginBottom: '4px', letterSpacing: '-0.03em' }}>
                                        {card.value}
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>{card.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 판매 내역 리스트 (Clean Fintech Style) */}
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: '32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
                                {t('myPage.recentSales')}
                            </h3>
                            <button style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                                {t('myPage.viewAll')}
                            </button>
                        </div>
                        
                        {salesHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', background: '#f8fafc' }}>
                                <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <ExternalLink size={24} color="#cbd5e1" />
                                </div>
                                <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>
                                    {t('myPage.noSales')}
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <th style={{ textAlign: 'left', padding: '16px 32px', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('myPage.settlementDate')}</th>
                                            <th style={{ textAlign: 'left', padding: '16px 32px', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('myPage.productName')}</th>
                                            <th style={{ textAlign: 'left', padding: '16px 32px', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('myPage.customer')}</th>
                                            <th style={{ textAlign: 'right', padding: '16px 32px', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('myPage.netAmount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ divideY: '1px solid #f1f5f9' }}>
                                        {salesHistory.slice(0, 5).map((sale, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} 
                                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '20px 32px', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                                                    {formatDate(sale.purchasedAt?.toDate?.() || new Date())}
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e2e8f0', overflow: 'hidden' }}>
                                                            <img src={sale.planData?.thumbnail_url || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{sale.planData?.title || t('myPage.unknownTitle')}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>👤</div>
                                                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('myPage.userPrefix')}{sale.uid?.substring(0, 4)}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#10b981' }}>+{formatMoney(sale.planData?.price || 0)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 구매한 템플릿 섹션 ── */}
                <div style={{ marginTop: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                        <div>
                            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1c1917', marginBottom: '4px' }}>
                                {t('myPage.purchasedTitle')}
                            </h2>
                            <p style={{ fontFamily: 'sans-serif', color: '#78716c', fontSize: '14px' }}>
                                {t('myPage.purchasedDesc')}
                            </p>
                        </div>
                    </div>

                    {purchases.length === 0 ? (
                        <div style={{
                            background: 'white', border: '1px solid #e7e5e4', borderRadius: '20px',
                            padding: '48px 32px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'inline-flex', padding: '16px', background: '#f5f5f4', borderRadius: '50%', marginBottom: '16px' }}>
                                <Compass size={36} color="#a8a29e" />
                            </div>
                            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#44403c', marginBottom: '8px' }}>
                                {t('myPage.noPurchasesTitle')}
                            </h3>
                            <p style={{ fontFamily: 'sans-serif', color: '#78716c', fontSize: '15px', marginBottom: '24px' }}>
                                {t('myPage.noPurchasesDesc')}
                            </p>
                            <Link to="/marketplace" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '14px 32px', background: '#1c1917', color: 'white',
                                textDecoration: 'none', borderRadius: '50px',
                                fontFamily: 'sans-serif', fontSize: '15px', fontWeight: 'bold'
                            }}>
                                {t('myPage.goMarketplace')} <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {purchases.map((purchase) => {
                                const template = purchase.planData || {};
                                return (
                                    <div key={purchase.docId} style={{
                                        background: 'white', border: '1px solid #e7e5e4', borderRadius: '16px',
                                        padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                                        cursor: 'pointer', transition: 'box-shadow 0.2s', position: 'relative'
                                    }}
                                        onClick={() => goToTemplate(purchase.templateId, template)}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'}
                                    >
                                        <div style={{
                                            width: '80px', height: '60px', borderRadius: '10px', overflow: 'hidden', background: '#e5e7eb'
                                        }}>
                                            {template.image && (
                                                <img src={template.image} alt={template.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h3 style={{
                                                    fontFamily: 'serif', fontSize: '18px', color: '#1c1917', fontStyle: 'italic',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                }}>
                                                    {template.title || t('myPage.unknownTitle')}
                                                </h3>
                                                {template.region && (
                                                    <span style={{ fontSize: '11px', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                        {t(`regions.${template.region}`, { defaultValue: template.region })}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontFamily: 'sans-serif', fontSize: '13px', color: '#78716c' }}>
                                                <User size={12} /> {template.creator || t('myPage.creatorDefault', { defaultValue: 'Creator' })}
                                                {template.budget && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{t(`budgets.${template.budget}`, { defaultValue: template.budget })}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div style={{ flexShrink: 0, paddingRight: '4px' }}>
                                            <ChevronRight size={20} color="#a8a29e" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* 토스트 알림 */}
            {toast.show && (
                <div style={{
                    position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                    background: '#1e293b', color: 'white', padding: '16px 32px',
                    borderRadius: '50px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', gap: '12px',
                    fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 'bold',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <div style={{ background: '#10b981', borderRadius: '50%', padding: '4px' }}>
                        <ChevronRight size={14} color="white" />
                    </div>
                    {toast.message}
                    <style>{`
                        @keyframes slideUp {
                            from { transform: translate(-50%, 20px); opacity: 0; }
                            to { transform: translate(-50%, 0); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default MyPage;
