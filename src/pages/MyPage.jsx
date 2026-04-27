import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, LogOut, MapPin, Calendar, Clock, ArrowRight,
    Compass, Trash2, ChevronRight, TrendingUp, DollarSign,
    CreditCard, Download, ExternalLink, Receipt, Edit2, EyeOff,
    BarChart2, Star, Package, ShoppingBag, History as HistoryIcon,
    X, Upload, CheckCircle, Image, Eye
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import {
    auth, logout, getUserPurchases, listenToUserEarnings,
    getSalesHistory, requestPayout, getUserPublishedTemplates,
    deleteMarketplaceTemplate, updateMarketplaceTemplate,
    unpublishMarketplaceTemplate, uploadThumbnailToStorage
} from '../firebase';
import Navbar from '../components/Navbar';
import i18n from '../i18n';
import { getSearchHistory, deleteHistoryEntry, clearSearchHistory } from '../utils/history';

// ── 날짜 포맷 헬퍼 ──────────────────────────────────────────────────────
const formatDate = (str) => {
    if (!str) return '';
    try {
        const locale = i18n.language === 'ko' ? 'ko-KR' : 'en-US';
        return new Date(str).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return String(str); }
};

const getDays = (start, end, t) => {
    try {
        const diff = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
        return isNaN(diff) ? '' : t('itinerary.daysCount', { count: diff });
    } catch { return ''; }
};

// ── 수정 모달 컴포넌트 ──────────────────────────────────────────────────
const EditTemplateModal = ({ template, onClose, onSave, t }) => {
    const [description, setDescription] = useState(template.description || '');
    const [price, setPrice] = useState(template.price || '');
    const [title, setTitle] = useState(template.title || '');
    const [previewImg, setPreviewImg] = useState(template.thumbnail || template.image || '');
    const [newThumb, setNewThumb] = useState(null); // data URL
    const [loading, setLoading] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        setDescription(template.description || '');
        setPrice(template.price || '');
        setTitle(template.title || '');
        setPreviewImg(template.thumbnail || template.image || '');
        setNewThumb(null);
    }, [template]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setPreviewImg(dataUrl);
                setNewThumb(dataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        const numPrice = Number(price);
        if (!price || isNaN(numPrice) || numPrice <= 0) {
            alert('올바른 가격을 입력해주세요.');
            return;
        }
        if (!description || description.trim().length < 5) {
            alert('설명을 5자 이상 입력해주세요.');
            return;
        }
        if (!title || title.trim().length < 2) {
            alert('제목을 2자 이상 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            await onSave(template.id, {
                price: numPrice,
                description: description.trim(),
                title: title.trim(),
                thumbnail: newThumb || template.thumbnail,
            }, newThumb);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '20px'
        }}>
            <div style={{
                background: 'white', borderRadius: '24px', maxWidth: '480px', width: '100%',
                padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
                animation: 'scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                {/* 헤더 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1c1917', marginBottom: '3px' }}>
                            등록 정보 수정
                        </h3>
                        <p style={{ fontSize: '13px', color: '#78716c', fontFamily: 'sans-serif' }}>
                            수정 후 마켓플레이스에 즉시 반영됩니다
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '10px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                    {/* 제목 수정 */}
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#44403c', fontFamily: 'sans-serif', display: 'block', marginBottom: '8px' }}>
                            템플릿 제목
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="템플릿 제목을 입력하세요"
                            style={{
                                width: '100%', padding: '11px 14px',
                                border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                fontFamily: 'sans-serif', fontSize: '15px', outline: 'none',
                                boxSizing: 'border-box', transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#6366f1'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    {/* 썸네일 */}
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#44403c', fontFamily: 'sans-serif', display: 'block', marginBottom: '8px' }}>
                            대표 썸네일
                        </label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            style={{
                                width: '100%', height: '160px', borderRadius: '14px',
                                overflow: 'hidden', border: '2px dashed #d1d5db',
                                cursor: 'pointer', position: 'relative', background: '#f9fafb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'border-color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
                        >
                            {previewImg ? (
                                <img src={previewImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                                    <Image size={36} style={{ margin: '0 auto 8px', display: 'block' }} />
                                    <span style={{ fontSize: '13px' }}>클릭하여 이미지 선택</span>
                                </div>
                            )}
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                                padding: '20px 12px 10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                color: 'white', fontSize: '12px', fontWeight: '700'
                            }}>
                                <Upload size={13} /> 이미지 변경하기
                            </div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>

                    {/* 가격 */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#44403c', fontFamily: 'sans-serif', display: 'block', marginBottom: '6px' }}>
                            판매 가격 (USD)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: '700', fontSize: '15px' }}>$</span>
                            <input
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="예: 9.99"
                                style={{
                                    width: '100%', padding: '11px 14px 11px 30px',
                                    border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                    fontFamily: 'sans-serif', fontSize: '15px', outline: 'none',
                                    boxSizing: 'border-box', transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#6366f1'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                    </div>

                    {/* 한 줄 설명 */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#44403c', fontFamily: 'sans-serif', display: 'block', marginBottom: '6px' }}>
                            한 줄 소개
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="이 여행 일정만의 특별한 매력을 한 줄로 설명해주세요..."
                            rows={3}
                            style={{
                                width: '100%', padding: '11px 14px',
                                border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                fontFamily: 'sans-serif', fontSize: '14px',
                                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                                lineHeight: '1.6', transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#6366f1'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '13px', background: '#f1f5f9', border: 'none',
                            borderRadius: '12px', color: '#475569', fontWeight: '700',
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px'
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            flex: 2, padding: '13px',
                            background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #1c1917, #44403c)',
                            border: 'none', borderRadius: '12px',
                            color: loading ? '#9ca3af' : 'white',
                            fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'Inter, sans-serif', fontSize: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(28,25,23,0.2)'
                        }}
                    >
                        {loading ? '저장 중...' : (
                            <>
                                <CheckCircle size={16} />
                                저장 및 마켓 즉시 반영
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── 판매 통계 모달 컴포넌트 ─────────────────────────────────────────────
const StatsModal = ({ template, salesHistory, onClose, formatMoney }) => {
    const tplSales = salesHistory.filter(s => s.templateId === template.id);
    const totalRev = tplSales.reduce((sum, s) => sum + Number(s.paidAmount || template.price || 0), 0);
    const myRevenue = totalRev * 0.8;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '20px'
        }}>
            <div style={{
                background: 'white', borderRadius: '24px', maxWidth: '520px', width: '100%',
                maxHeight: '85vh', overflow: 'hidden', flexDirection: 'column', display: 'flex',
                boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
                animation: 'scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                {/* 헤더 */}
                <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <BarChart2 size={18} color="#6366f1" />
                            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>판매 통계</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', fontFamily: 'sans-serif', fontStyle: 'italic' }}>{template.title}</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* 스탯 카드 */}
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                        { label: '총 판매 횟수', value: `${template.purchaseCount || 0}회`, icon: <Package size={18} />, color: '#6366f1' },
                        { label: '내 누적 수익 (80%)', value: formatMoney(myRevenue), icon: <DollarSign size={18} />, color: '#10b981' },
                        { label: '평균 평점', value: template.rating > 0 ? `⭐ ${Number(template.rating).toFixed(1)}` : '평점 없음', icon: <Star size={18} />, color: '#f59e0b' },
                        { label: '등록 가격', value: formatMoney(template.price || 0), icon: <CreditCard size={18} />, color: '#3b82f6' },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: '#f8fafc', borderRadius: '16px', padding: '16px',
                            display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{
                                color: stat.color, background: `${stat.color}18`,
                                width: '36px', height: '36px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {stat.icon}
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>{stat.value}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* 최근 판매 내역 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        최근 판매 내역
                    </h4>
                    {tplSales.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: '14px', background: '#f8fafc', borderRadius: '14px' }}>
                            아직 판매 내역이 없습니다.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {tplSales.slice(0, 10).map((sale, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 14px', background: '#f8fafc', borderRadius: '12px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <span style={{ fontSize: '13px', color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                                        {formatDate(sale.purchasedAt?.toDate?.() || new Date())}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#10b981' }}>
                                        +{formatMoney(Number(sale.paidAmount || template.price || 0) * 0.8)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── 마이페이지 메인 ───────────────────────────────────────────────────
const MyPage = () => {
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('history');
    const [history, setHistory] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [earnings, setEarnings] = useState({ currentBalance: 0, totalEarnings: 0, templatesSold: 0 });
    const [salesHistory, setSalesHistory] = useState([]);
    const [publishedTemplates, setPublishedTemplates] = useState([]);

    // 모달 상태
    const [deleteModal, setDeleteModal] = useState({ show: false, templateId: null, thumbnailUrl: null });
    const [unpublishModal, setUnpublishModal] = useState({ show: false, templateId: null });
    const [editModal, setEditModal] = useState({ show: false, template: null });
    const [statsModal, setStatsModal] = useState({ show: false, template: null });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const navigate = useNavigate();

    useEffect(() => {
        let unsubEarnings = null;
        const unsubAuth = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                // 병렬 데이터 로드
                const [userPurchases, sales, published] = await Promise.all([
                    getUserPurchases(u.uid),
                    getSalesHistory(u.uid),
                    getUserPublishedTemplates(u.uid)
                ]);
                setPurchases(userPurchases);
                setSalesHistory(sales);
                setPublishedTemplates(published);

                // 수익 실시간 구독
                unsubEarnings = listenToUserEarnings(u.uid, (data) => setEarnings(data));
            } else {
                setPurchases([]);
                setEarnings({ currentBalance: 0, totalEarnings: 0, templatesSold: 0 });
                setSalesHistory([]);
                setPublishedTemplates([]);
            }
        });
        return () => {
            unsubAuth();
            if (unsubEarnings) unsubEarnings();
        };
    }, []);

    useEffect(() => {
        const load = () => setHistory(getSearchHistory());
        load();
        window.addEventListener('storage', load);
        return () => window.removeEventListener('storage', load);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const formatMoney = (amount) => {
        const num = Number(amount) || 0;
        if (i18n.language === 'ko') {
            return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(Math.round(num * 1400));
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    };

    const handleLogout = async () => { await logout(); navigate('/'); };
    const deleteEntry = (id) => setHistory(deleteHistoryEntry(id));
    const clearAll = () => { clearSearchHistory(); setHistory([]); };
    const replan = (entry) => navigate('/itinerary', {
        state: { destination: entry.destination, startDate: entry.startDate, endDate: entry.endDate, focus: entry.focus, pace: entry.pace, vibe: entry.vibe, dining: entry.dining }
    });
    const goToTemplate = (templateId, template) => navigate(`/template/${templateId}`, { state: { template } });

    const handleWithdraw = async () => {
        if (earnings.currentBalance <= 0) { showToast(t('myPage.noBalance'), 'error'); return; }
        try {
            await requestPayout(user.uid, earnings.currentBalance, {
                bankName: t('myPage.walletName'), accountNumber: '**** **** 1234',
                accountHolder: user.displayName || ''
            });
            showToast(t('myPage.withdrawSuccess'));
        } catch { showToast(t('myPage.payoutFail'), 'error'); }
    };

    // 완전 삭제
    const handleDeleteTemplate = async () => {
        if (!deleteModal.templateId) return;
        try {
            await deleteMarketplaceTemplate(deleteModal.templateId, deleteModal.thumbnailUrl);
            setPublishedTemplates(prev => prev.filter(tp => tp.id !== deleteModal.templateId));
            setDeleteModal({ show: false, templateId: null, thumbnailUrl: null });
            showToast(t('myPage.deleteSuccess'));
        } catch { showToast(t('common.error'), 'error'); }
    };

    // 비공개 처리 (마켓에서 내리기)
    const handleUnpublish = async () => {
        if (!unpublishModal.templateId) return;
        try {
            await unpublishMarketplaceTemplate(unpublishModal.templateId);
            setPublishedTemplates(prev => prev.map(tp =>
                tp.id === unpublishModal.templateId ? { ...tp, status: 'Inactive', is_published: false } : tp
            ));
            setUnpublishModal({ show: false, templateId: null });
            showToast('마켓플레이스에서 비공개 처리되었습니다.');
        } catch { showToast(t('common.error'), 'error'); }
    };

    // 다시 공개
    const handleRepublish = async (templateId) => {
        try {
            await updateMarketplaceTemplate(templateId, { status: 'Active', is_published: true });
            setPublishedTemplates(prev => prev.map(tp =>
                tp.id === templateId ? { ...tp, status: 'Active', is_published: true } : tp
            ));
            showToast('마켓플레이스에 다시 공개되었습니다! ✓');
        } catch { showToast(t('common.error'), 'error'); }
    };

    // 수정 저장
    const handleEditSave = async (templateId, updates, newThumbDataUrl) => {
        try {
            let thumbnailUrl = updates.thumbnail;
            if (newThumbDataUrl && newThumbDataUrl.startsWith('data:image') && user) {
                thumbnailUrl = await uploadThumbnailToStorage(newThumbDataUrl, user.uid);
            }
            const finalUpdates = { ...updates, thumbnail: thumbnailUrl };
            await updateMarketplaceTemplate(templateId, finalUpdates);
            setPublishedTemplates(prev => prev.map(tp =>
                tp.id === templateId ? { ...tp, ...finalUpdates } : tp
            ));
            setEditModal({ show: false, template: null });
            showToast('마켓플레이스에 즉시 반영되었습니다! ✓');
        } catch (e) {
            console.error(e);
            showToast('저장에 실패했습니다.', 'error');
        }
    };

    // ── 탭 정의 ────────────────────────────────────────────────────────
    const TABS = [
        { id: 'history', label: '여행 이력', icon: <HistoryIcon size={15} /> },
        { id: 'published', label: '내 등록 일정', icon: <Package size={15} />, badge: publishedTemplates.length },
        { id: 'purchased', label: '구매한 일정', icon: <ShoppingBag size={15} />, badge: purchases.length },
        { id: 'revenue', label: '수익 대시보드', icon: <TrendingUp size={15} /> },
    ];

    // ── 공통 스타일 사전정의 ────────────────────────────────────────────
    const btnBase = {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px', border: 'none', borderRadius: '10px',
        fontSize: '13px', fontWeight: '700', cursor: 'pointer',
        transition: 'all 0.18s', fontFamily: 'Inter, sans-serif'
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fafaf9' }}>
            <Navbar />

            {/* ── 헤더 배너 ──────────────────────────────────────────── */}
            <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #44403c 100%)', padding: '80px 32px 0' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {/* 프로필 행 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap', paddingBottom: '32px' }}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" style={{ width: '96px', height: '96px', borderRadius: '50%', border: '3px solid #FBBF24', boxShadow: '0 4px 24px rgba(0,0,0,0.45)' }} />
                        ) : (
                            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '3px solid #FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={44} color="white" />
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '36px', color: 'white', marginBottom: '6px' }}>
                                {user?.displayName || t('myPage.traveler')}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
                                <Mail size={14} /> <span>{user?.email || ''}</span>
                            </div>
                            <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '20px', padding: '4px 14px', color: '#FBBF24', fontSize: '13px', fontWeight: '700' }}>
                                <Compass size={13} />
                                {t('myPage.tripsCount', { count: history.length })}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                        >
                            <LogOut size={15} /> {t('myPage.signOut')}
                        </button>
                    </div>

                    {/* ── 탭 바 ─────────────────────────────────────── */}
                    <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', paddingBottom: '0' }}>
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px',
                                        padding: '12px 20px', border: 'none', cursor: 'pointer',
                                        fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '700',
                                        borderRadius: '12px 12px 0 0', transition: 'all 0.2s', whiteSpace: 'nowrap',
                                        background: isActive ? 'white' : 'transparent',
                                        color: isActive ? '#1c1917' : 'rgba(255,255,255,0.6)',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'white'; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {tab.badge > 0 && (
                                        <span style={{
                                            background: isActive ? '#FBBF24' : 'rgba(251,191,36,0.7)',
                                            color: '#1c1917', borderRadius: '12px', padding: '1px 8px',
                                            fontSize: '11px', fontWeight: '800', minWidth: '20px', textAlign: 'center'
                                        }}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── 탭 콘텐츠 영역 ────────────────────────────────────── */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>

                {/* ══════ TAB 1: 여행 이력 ══════ */}
                {activeTab === 'history' && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                            <div>
                                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1c1917', marginBottom: '4px' }}>{t('myPage.historyTitle')}</h2>
                                <p style={{ fontFamily: 'sans-serif', color: '#78716c', fontSize: '14px' }}>{t('myPage.historySubtitle')}</p>
                            </div>
                            {history.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', border: '1px solid #e7e5e4', borderRadius: '8px', color: '#78716c', fontSize: '13px', cursor: 'pointer' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#78716c'; }}
                                >
                                    <Trash2 size={14} /> {t('myPage.clearAll')}
                                </button>
                            )}
                        </div>

                        {history.length === 0 ? (
                            <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '20px', padding: '64px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <MapPin size={48} color="#d6d3d1" style={{ margin: '0 auto 20px', display: 'block' }} />
                                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1c1917', marginBottom: '10px' }}>{t('myPage.noTrips')}</h3>
                                <p style={{ color: '#78716c', fontSize: '15px', marginBottom: '28px' }}>{t('myPage.noTripsDesc')}</p>
                                <Link to="/survey" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: '#1c1917', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: 'bold' }}>
                                    {t('myPage.planFirst')} <ArrowRight size={16} />
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {history.map((entry) => (
                                        <div key={entry.id} style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', transition: 'box-shadow 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'}
                                        >
                                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #92400e, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <MapPin size={22} color="white" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1c1917', marginBottom: '6px', fontStyle: 'italic' }}>{entry.destination}</h3>
                                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                    {entry.startDate && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#78716c' }}><Calendar size={12} /> {formatDate(entry.startDate)} – {formatDate(entry.endDate)}{getDays(entry.startDate, entry.endDate, t) && ` · ${getDays(entry.startDate, entry.endDate, t)}`}</span>}
                                                    {entry.vibe && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#78716c' }}><Compass size={12} /> {entry.vibe}</span>}
                                                    {entry.pace && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#78716c' }}><Clock size={12} /> {entry.pace}</span>}
                                                </div>
                                                {entry.focus?.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                                                        {entry.focus.map(f => <span key={f} style={{ padding: '3px 10px', background: '#fef3c7', borderRadius: '20px', fontSize: '12px', color: '#92400e', fontWeight: 'bold' }}>{f}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                                <button onClick={() => replan(entry)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#1c1917', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#92400e'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#1c1917'}
                                                >
                                                    {t('myPage.viewPlan')} <ChevronRight size={14} />
                                                </button>
                                                <button onClick={() => deleteEntry(entry.id)} style={{ padding: '10px 12px', background: 'transparent', border: '1px solid #e7e5e4', borderRadius: '10px', color: '#78716c', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#78716c'; }}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                                    <Link to="/survey" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 36px', background: 'transparent', border: '1.5px solid #d6d3d1', borderRadius: '50px', color: '#44403c', textDecoration: 'none', fontSize: '15px', fontWeight: 'bold' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#92400e'; e.currentTarget.style.color = '#92400e'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#d6d3d1'; e.currentTarget.style.color = '#44403c'; }}
                                    >
                                        <Compass size={17} /> {t('myPage.planNew')}
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ══════ TAB 2: 내 등록 일정 ══════ */}
                {activeTab === 'published' && (
                    <div>
                        <div style={{ marginBottom: '28px' }}>
                            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1c1917', marginBottom: '6px' }}>
                                {t('myPage.publishedTitle')}
                            </h2>
                            <p style={{ color: '#78716c', fontSize: '14px', fontFamily: 'sans-serif' }}>
                                마켓플레이스에 등록된 내 일정을 관리하고 수익 현황을 한눈에 파악하세요.
                            </p>
                        </div>

                        {publishedTemplates.length === 0 ? (
                            <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '20px', padding: '64px 32px', textAlign: 'center' }}>
                                <Package size={48} color="#d6d3d1" style={{ margin: '0 auto 20px', display: 'block' }} />
                                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1c1917', marginBottom: '10px' }}>등록된 일정이 없습니다</h3>
                                <p style={{ color: '#78716c', fontSize: '15px', marginBottom: '28px' }}>일정을 생성 후 마켓플레이스에 등록해 수익을 창출해보세요.</p>
                                <Link to="/survey" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: '#1c1917', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: 'bold' }}>
                                    일정 만들기 <ArrowRight size={16} />
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {publishedTemplates.map(tpl => {
                                    const isActive = tpl.status === 'Active' && tpl.is_published !== false;
                                    const tplSales = salesHistory.filter(s => s.templateId === tpl.id);
                                    const tplRevenue = tplSales.reduce((sum, s) => sum + Number(s.paidAmount || tpl.price || 0), 0) * 0.8;

                                    return (
                                        <div key={tpl.id} style={{
                                            background: 'white', border: '1px solid #e7e5e4', borderRadius: '20px',
                                            overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                            transition: 'box-shadow 0.2s, opacity 0.2s',
                                            opacity: isActive ? 1 : 0.75
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'}
                                        >
                                            <div style={{ display: 'flex' }}>
                                                {/* 썸네일 */}
                                                <div style={{ width: '140px', minHeight: '140px', background: '#f1f5f9', position: 'relative', flexShrink: 0 }}>
                                                    {tpl.thumbnail || tpl.image ? (
                                                        <img 
                                                            src={tpl.thumbnail || tpl.image} 
                                                            alt={tpl.title} 
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '140px' }} 
                                                        />
                                                    ) : (
                                                        <div style={{ width: '100%', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Image size={28} color="#9ca3af" />
                                                        </div>
                                                    )}
                                                    {/* 판매 횟수 오버레이 뱃지 */}
                                                    <div style={{
                                                        position: 'absolute', top: '8px', left: '8px',
                                                        background: 'rgba(0,0,0,0.72)', color: 'white',
                                                        borderRadius: '8px', padding: '3px 8px',
                                                        fontSize: '11px', fontWeight: '800',
                                                        backdropFilter: 'blur(4px)'
                                                    }}>
                                                        🛒 {tpl.purchaseCount || 0}
                                                    </div>
                                                </div>

                                                {/* 콘텐츠 */}
                                                <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
                                                    {/* 제목 + 상태 */}
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '19px', color: '#1c1917', fontStyle: 'italic', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {tpl.title}
                                                            </h3>
                                                            {tpl.description && (
                                                                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                                    {tpl.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span style={{
                                                            fontSize: '11px', fontWeight: '800', padding: '4px 12px',
                                                            borderRadius: '20px', flexShrink: 0, whiteSpace: 'nowrap',
                                                            background: isActive ? '#dcfce7' : '#f1f5f9',
                                                            color: isActive ? '#16a34a' : '#64748b'
                                                        }}>
                                                            {isActive ? '● 공개중' : '○ 비공개'}
                                                        </span>
                                                    </div>

                                                    {/* 수익 뱃지 행 */}
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: '700' }}>
                                                            <Receipt size={12} /> 판매 {tpl.purchaseCount || 0}회
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: '700' }}>
                                                            <DollarSign size={12} /> 내 수익 {formatMoney(tplRevenue)}
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fefce8', color: '#ca8a04', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: '700' }}>
                                                            <CreditCard size={12} /> 가격 {formatMoney(tpl.price || 0)}
                                                        </span>
                                                    </div>

                                                    {/* 액션 버튼 행 */}
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        {/* 수정하기 */}
                                                        <button
                                                            onClick={() => setEditModal({ show: true, template: tpl })}
                                                            style={{ ...btnBase, background: '#1c1917', color: 'white', boxShadow: '0 2px 8px rgba(28,25,23,0.18)' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#92400e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#1c1917'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                        >
                                                            <Edit2 size={13} /> 수정하기
                                                        </button>

                                                        {/* 판매 통계 */}
                                                        <button
                                                            onClick={() => setStatsModal({ show: true, template: tpl })}
                                                            style={{ ...btnBase, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                        >
                                                            <BarChart2 size={13} /> 판매 통계
                                                        </button>

                                                        {/* 보기 */}
                                                        <button
                                                            onClick={() => navigate(`/template/${tpl.id}`)}
                                                            style={{ ...btnBase, background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                        >
                                                            <Eye size={13} /> 보기
                                                        </button>

                                                        {/* 공개/비공개 토글 */}
                                                        {isActive ? (
                                                            <button
                                                                onClick={() => setUnpublishModal({ show: true, templateId: tpl.id })}
                                                                style={{ ...btnBase, background: '#fff7ed', color: '#ea580c', border: '1px solid #fdba74' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#ffedd5'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                            >
                                                                <EyeOff size={13} /> 마켓에서 내리기
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRepublish(tpl.id)}
                                                                style={{ ...btnBase, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                            >
                                                                <Eye size={13} /> 다시 공개하기
                                                            </button>
                                                        )}

                                                        {/* 완전 삭제 */}
                                                        <button
                                                            onClick={() => setDeleteModal({ show: true, templateId: tpl.id, thumbnailUrl: tpl.thumbnail })}
                                                            style={{ ...btnBase, background: 'transparent', color: '#ef4444', border: '1px solid #fee2e2' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                        >
                                                            <Trash2 size={13} /> 완전 삭제
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════ TAB 3: 구매한 일정 ══════ */}
                {activeTab === 'purchased' && (
                    <div>
                        <div style={{ marginBottom: '28px' }}>
                            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1c1917', marginBottom: '4px' }}>{t('myPage.purchasedTitle')}</h2>
                            <p style={{ color: '#78716c', fontSize: '14px' }}>{t('myPage.purchasedDesc')}</p>
                        </div>

                        {purchases.length === 0 ? (
                            <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '20px', padding: '64px 32px', textAlign: 'center' }}>
                                <Compass size={48} color="#d6d3d1" style={{ margin: '0 auto 20px', display: 'block' }} />
                                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#44403c', marginBottom: '8px' }}>{t('myPage.noPurchasesTitle')}</h3>
                                <p style={{ color: '#78716c', fontSize: '15px', marginBottom: '24px' }}>{t('myPage.noPurchasesDesc')}</p>
                                <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: '#1c1917', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: 'bold' }}>
                                    {t('myPage.goMarketplace')} <ArrowRight size={16} />
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {purchases.map((purchase) => {
                                    const template = purchase.planData || {};
                                    return (
                                        <div key={purchase.docId} style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                                            onClick={() => goToTemplate(purchase.templateId, template)}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'}
                                        >
                                            <div style={{ width: '80px', height: '60px', borderRadius: '10px', overflow: 'hidden', background: '#e5e7eb', flexShrink: 0 }}>
                                                {template.image && <img src={template.image} alt={template.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ fontFamily: 'serif', fontSize: '18px', color: '#1c1917', fontStyle: 'italic', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {template.title || t('myPage.unknownTitle')}
                                                </h3>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#78716c' }}>
                                                    <User size={12} /> {template.creator || t('myPage.creatorDefault', { defaultValue: 'Creator' })}
                                                    {template.region && <><span>•</span><span>{t(`regions.${template.region}`, { defaultValue: template.region })}</span></>}
                                                </div>
                                            </div>
                                            <ChevronRight size={20} color="#a8a29e" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════ TAB 4: 수익 대시보드 ══════ */}
                {activeTab === 'revenue' && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '8px' }}>
                                    <div style={{ width: '24px', height: '24px', background: 'rgba(99,102,241,0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrendingUp size={14} />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('myPage.businessCenter')}</span>
                                </div>
                                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '32px', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.02em' }}>
                                    {t('myPage.revenueDashboard')}
                                </h2>
                            </div>
                            <button
                                onClick={handleWithdraw}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <Download size={16} /> {t('myPage.withdraw')}
                            </button>
                        </div>

                        {/* 스탯 카드 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                            {[
                                { label: t('myPage.templatesSoldLabel'), value: earnings.templatesSold, sub: t('myPage.lifetimeSales'), icon: <Receipt size={20} />, color: '#6366f1', trend: '+12%' },
                                { label: t('myPage.totalEarningsLabel'), value: formatMoney(earnings.totalEarnings), sub: t('myPage.grossRevenue'), icon: <DollarSign size={20} />, color: '#10b981', trend: '+8.4%' },
                                { label: t('myPage.availablePayoutLabel'), value: formatMoney(earnings.currentBalance), sub: t('myPage.readyToWithdraw'), icon: <CreditCard size={20} />, color: '#f59e0b', trend: 'Current' },
                            ].map((card, idx) => (
                                <div key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '32px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ color: card.color, background: `${card.color}12`, width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: card.trend.startsWith('+') ? '#10b981' : '#64748b', background: card.trend.startsWith('+') ? '#10b98112' : '#f1f5f9', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>{card.trend}</span>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>{card.label}</h4>
                                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', fontFamily: 'Inter, sans-serif', marginBottom: '4px', letterSpacing: '-0.03em' }}>{card.value}</div>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>{card.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 판매 내역 테이블 */}
                        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <div style={{ padding: '28px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{t('myPage.recentSales')}</h3>
                                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>최근 10건</span>
                            </div>
                            {salesHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 0', background: '#f8fafc' }}>
                                    <ExternalLink size={32} color="#cbd5e1" style={{ margin: '0 auto 12px', display: 'block' }} />
                                    <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>{t('myPage.noSales')}</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc' }}>
                                                {[t('myPage.settlementDate'), t('myPage.productName'), t('myPage.customer'), t('myPage.netAmount')].map((h, i) => (
                                                    <th key={i} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '14px 24px', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesHistory.slice(0, 10).map((sale, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td style={{ padding: '18px 24px', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                                                        {formatDate(sale.purchasedAt?.toDate?.() || new Date())}
                                                    </td>
                                                    <td style={{ padding: '18px 24px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                                                                <img src={sale.planData?.thumbnail_url || sale.planData?.thumbnail || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{sale.planData?.title || t('myPage.unknownTitle')}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '18px 24px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>👤</div>
                                                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('myPage.userPrefix')}#{sale.uid?.substring(0, 6)}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                                        <span style={{ fontSize: '15px', fontWeight: '900', color: '#10b981' }}>+{formatMoney(sale.paidAmount || sale.planData?.price || 0)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── 수정 모달 ────────────────────────────────────────────── */}
            {editModal.show && editModal.template && (
                <EditTemplateModal
                    template={editModal.template}
                    onClose={() => setEditModal({ show: false, template: null })}
                    onSave={handleEditSave}
                    t={t}
                />
            )}

            {/* ── 비공개 확인 모달 ─────────────────────────────────────── */}
            {unpublishModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '24px', maxWidth: '400px', width: '100%', padding: '36px', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', textAlign: 'center', animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                        <div style={{ width: '68px', height: '68px', background: '#fff7ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <EyeOff size={34} color="#ea580c" />
                        </div>
                        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1c1917', marginBottom: '12px' }}>
                            마켓플레이스에서 내리기
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' }}>
                            정말 마켓플레이스에서 삭제하시겠습니까?<br />
                            <strong style={{ color: '#1c1917' }}>구매자가 더 이상 이 일정을 볼 수 없게 됩니다.</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setUnpublishModal({ show: false, templateId: null })} style={{ flex: 1, padding: '14px', background: '#f1f5f9', border: 'none', borderRadius: '14px', color: '#475569', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                취소
                            </button>
                            <button onClick={handleUnpublish} style={{ flex: 1, padding: '14px', background: '#ea580c', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(234,88,12,0.25)' }}>
                                비공개 처리
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 완전 삭제 확인 모달 ──────────────────────────────────── */}
            {deleteModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '24px', maxWidth: '400px', width: '100%', padding: '36px', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', textAlign: 'center', animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                        <div style={{ width: '68px', height: '68px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Trash2 size={34} color="#ef4444" />
                        </div>
                        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1c1917', marginBottom: '12px' }}>
                            {t('common.delete')}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' }}>
                            {t('myPage.deleteConfirm')}
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setDeleteModal({ show: false, templateId: null, thumbnailUrl: null })} style={{ flex: 1, padding: '14px', background: '#f1f5f9', border: 'none', borderRadius: '14px', color: '#475569', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                {t('common.cancel')}
                            </button>
                            <button onClick={handleDeleteTemplate} style={{ flex: 1, padding: '14px', background: '#ef4444', border: 'none', borderRadius: '14px', color: 'white', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}>
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 판매 통계 모달 ───────────────────────────────────────── */}
            {statsModal.show && statsModal.template && (
                <StatsModal
                    template={statsModal.template}
                    salesHistory={salesHistory}
                    onClose={() => setStatsModal({ show: false, template: null })}
                    formatMoney={formatMoney}
                />
            )}

            {/* ── 토스트 알림 ──────────────────────────────────────────── */}
            {toast.show && (
                <div style={{
                    position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? '#ef4444' : '#1e293b',
                    color: 'white', padding: '14px 28px', borderRadius: '50px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 4000,
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '14px', fontWeight: '700', animation: 'slideUp 0.3s ease-out',
                    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif'
                }}>
                    <div style={{ borderRadius: '50%', padding: '3px', display: 'flex', background: 'rgba(255,255,255,0.2)' }}>
                        {toast.type === 'error' ? <X size={14} color="white" /> : <CheckCircle size={14} color="white" />}
                    </div>
                    {toast.message}
                </div>
            )}

            <style>{`
                @keyframes scaleUp { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes slideUp { from { transform: translate(-50%, 16px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default MyPage;
