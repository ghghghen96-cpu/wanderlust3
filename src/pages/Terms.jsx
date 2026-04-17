import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';

const Terms = () => (
    <div style={{ minHeight: '100vh', background: '#fafaf9', color: '#1c1917' }}>
        <Navbar />
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '80px 32px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#78716c', textDecoration: 'none', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '48px' }}>
                <ArrowLeft size={16} /> Back to Home
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <FileText size={36} color="#92400e" />
                <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '48px', fontWeight: 'bold', color: '#1c1917' }}>Terms of Service</h1>
            </div>
            <p style={{ color: '#78716c', fontSize: '14px', marginBottom: '48px', letterSpacing: '0.05em' }}>Last updated: March 26, 2026</p>
            <div style={{ fontSize: '17px', lineHeight: '1.85', color: '#44403c', fontFamily: 'sans-serif' }}>
                {[
                    {
                        title: '1. Acceptance of Terms',
                        body: `By accessing or using WanderLust AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. These terms apply to all visitors, users, and others who access or use the service.`
                    },
                    {
                        title: '2. Description of Service',
                        body: `WanderLust AI provides an AI-powered travel itinerary planning platform. The service generates personalized, day-by-day travel plans based on user preferences. The itineraries are generated algorithmically and are intended as suggestions only — actual conditions, prices, and availability of places mentioned may vary.`
                    },
                    {
                        title: '3. User Accounts',
                        body: `To access certain features, you must create an account using Google Sign-In. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.`
                    },
                    {
                        title: '4. Acceptable Use',
                        body: `You agree not to use WanderLust AI for any unlawful purpose or in any way that could damage, disable, or impair the service. You may not attempt to gain unauthorized access to any part of the platform or its related systems.`
                    },
                    {
                        title: '5. Disclaimer of Warranties',
                        body: `WanderLust AI is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or that the results obtained from the use of the service will be accurate or reliable.`
                    },
                    {
                        title: '6. Limitation of Liability',
                        body: `To the fullest extent permitted by law, WanderLust AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.`
                    },
                    {
                        title: '7. Modifications to Terms',
                        body: `We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the service after any changes constitutes your acceptance of the new terms.`
                    }
                ].map((section, i) => (
                    <div key={i} style={{ marginBottom: '36px' }}>
                        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'bold', color: '#1c1917', marginBottom: '12px' }}>{section.title}</h2>
                        <p style={{ margin: 0 }}>{section.body}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default Terms;
