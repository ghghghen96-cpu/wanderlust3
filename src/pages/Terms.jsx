import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

const Terms = () => {
    const { t } = useTranslation();

    const sections = [
        { title: t('terms.s1Title'), body: t('terms.s1Body') },
        { title: t('terms.s2Title'), body: t('terms.s2Body') },
        { title: t('terms.s3Title'), body: t('terms.s3Body') },
        { title: t('terms.s4Title'), body: t('terms.s4Body') },
        { title: t('terms.s5Title'), body: t('terms.s5Body') },
        { title: t('terms.s6Title'), body: t('terms.s6Body') },
        { title: t('terms.s7Title'), body: t('terms.s7Body') },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#fafaf9', color: '#1c1917' }}>
            <Navbar />
            <div style={{ maxWidth: '780px', margin: '0 auto', padding: '80px 32px' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#78716c', textDecoration: 'none', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '48px' }}>
                    <ArrowLeft size={16} /> {t('common.backHome')}
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <FileText size={36} color="#92400e" />
                    <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '48px', fontWeight: 'bold', color: '#1c1917' }}>{t('terms.title')}</h1>
                </div>
                <p style={{ color: '#78716c', fontSize: '14px', marginBottom: '48px', letterSpacing: '0.05em' }}>{t('terms.lastUpdated')}</p>
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

export default Terms;
