import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

const Contact = () => {
    const { t } = useTranslation();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // 실제 이메일 전송 없이 UI 피드백만 제공
        setSent(true);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fafaf9', color: '#1c1917' }}>
            <Navbar />
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 32px' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#78716c', textDecoration: 'none', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '48px' }}>
                    <ArrowLeft size={16} /> {t('common.backHome')}
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <MessageSquare size={36} color="#92400e" />
                    <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '48px', fontWeight: 'bold', color: '#1c1917' }}>{t('contact.title')}</h1>
                </div>
                <p style={{ color: '#78716c', fontSize: '17px', marginBottom: '48px', lineHeight: 1.7, fontFamily: 'sans-serif' }}>
                    {t('contact.desc')}
                </p>

                {sent ? (
                    <div style={{
                        background: 'white', border: '1px solid #e7e5e4', borderRadius: '16px',
                        padding: '56px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                    }}>
                        <CheckCircle size={56} color="#16a34a" style={{ margin: '0 auto 20px' }} />
                        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '12px' }}>{t('contact.successTitle')}</h2>
                        <p style={{ color: '#78716c', fontFamily: 'sans-serif', fontSize: '16px' }}>
                            {t('contact.successDesc')}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                            { key: 'name', label: t('contact.formName'), type: 'text', placeholder: 'John Doe' },
                            { key: 'email', label: t('contact.formEmail'), type: 'email', placeholder: 'john@example.com' },
                            { key: 'subject', label: t('contact.formSubject'), type: 'text', placeholder: 'How can we help?' },
                        ].map(field => (
                            <div key={field.key}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#78716c', marginBottom: '8px', fontFamily: 'sans-serif' }}>
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    required
                                    placeholder={field.placeholder}
                                    value={form[field.key]}
                                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                    style={{
                                        width: '100%', padding: '14px 18px', fontSize: '16px',
                                        fontFamily: 'sans-serif', border: '1px solid #e7e5e4',
                                        borderRadius: '10px', background: 'white', outline: 'none',
                                        boxSizing: 'border-box', color: '#1c1917',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#92400e'}
                                    onBlur={e => e.target.style.borderColor = '#e7e5e4'}
                                />
                            </div>
                        ))}
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#78716c', marginBottom: '8px', fontFamily: 'sans-serif' }}>
                                {t('contact.formMessage')}
                            </label>
                            <textarea
                                required
                                rows={6}
                                placeholder={t('contact.formPlaceholderMessage')}
                                value={form.message}
                                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                style={{
                                    width: '100%', padding: '14px 18px', fontSize: '16px',
                                    fontFamily: 'sans-serif', border: '1px solid #e7e5e4',
                                    borderRadius: '10px', background: 'white', outline: 'none',
                                    boxSizing: 'border-box', color: '#1c1917', resize: 'vertical',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#92400e'}
                                onBlur={e => e.target.style.borderColor = '#e7e5e4'}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '10px', padding: '16px 32px',
                                background: '#1c1917', color: 'white',
                                border: 'none', borderRadius: '10px', cursor: 'pointer',
                                fontSize: '16px', fontWeight: 'bold', fontFamily: 'sans-serif',
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#92400e'}
                            onMouseLeave={e => e.currentTarget.style.background = '#1c1917'}
                        >
                            <Send size={18} /> {t('contact.formSend')}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '56px', padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Mail size={22} color="#92400e" />
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1c1917', fontFamily: 'sans-serif' }}>{t('contact.emailDirect')}</div>
                        <div style={{ color: '#78716c', fontSize: '14px', fontFamily: 'sans-serif' }}>support@wanderlust-ai.com</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
