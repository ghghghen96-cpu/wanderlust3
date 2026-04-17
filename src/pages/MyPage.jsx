import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, LogOut, MapPin, Calendar, Clock, ArrowRight,
    Compass, Trash2, ChevronRight
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logout, getUserPurchases } from '../firebase';
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
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                const userPurchases = await getUserPurchases(u.uid);
                setPurchases(userPurchases);
            } else {
                setPurchases([]);
            }
        });
        return () => unsub();
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
                                        title="View this itinerary again"
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
                                        title="Remove from history"
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
                                                    {template.title || 'Unknown Title'}
                                                </h3>
                                                {template.region && (
                                                    <span style={{ fontSize: '11px', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                        {t(`regions.${template.region}`, { defaultValue: template.region })}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontFamily: 'sans-serif', fontSize: '13px', color: '#78716c' }}>
                                                <User size={12} /> {template.creator || 'Creator'}
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
        </div>
    );
};

export default MyPage;
