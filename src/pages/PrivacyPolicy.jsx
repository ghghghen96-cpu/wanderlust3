import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    const sections = [
        { title: t('privacy.s1Title'), body: t('privacy.s1Body') },
        { title: t('privacy.s2Title'), body: t('privacy.s2Body') },
        { title: t('privacy.s3Title'), body: t('privacy.s3Body') },
        { title: t('privacy.s4Title'), body: t('privacy.s4Body') },
        { title: t('privacy.s5Title'), body: t('privacy.s5Body') },
        { title: t('privacy.s6Title'), body: t('privacy.s6Body') },
        { title: t('privacy.s7Title'), body: t('privacy.s7Body') },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#fafaf9', color: '#1c1917' }}>
            <Navbar />
            <div style={{ maxWidth: '780px', margin: '0 auto', padding: '80px 32px' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#78716c', textDecoration: 'none', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '48px' }}>
                    <ArrowLeft size={16} /> {t('common.backHome')}
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <Shield size={36} color="#92400e" />
                    <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '48px', fontWeight: 'bold', color: '#1c1917' }}>{t('privacy.title')}</h1>
                </div>
                <p style={{ color: '#78716c', fontSize: '14px', marginBottom: '48px', letterSpacing: '0.05em' }}>{t('privacy.lastUpdated')}</p>
                <div style={{ fontSize: '17px', lineHeight: '1.85', color: '#44403c', fontFamily: 'sans-serif' }}>
                    {sections.map((section, i) => (
                        <div key={i} style={{ marginBottom: '36px' }}>
                            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'bold', color: '#1c1917', marginBottom: '12px' }}>{section.title}</h2>
                            <p style={{ margin: 0 }}>{section.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
