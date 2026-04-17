import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';

const PrivacyPolicy = () => (
    <div style={{ minHeight: '100vh', background: '#fafaf9', color: '#1c1917' }}>
        <Navbar />
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '80px 32px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#78716c', textDecoration: 'none', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '48px' }}>
                <ArrowLeft size={16} /> Back to Home
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <Shield size={36} color="#92400e" />
                <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '48px', fontWeight: 'bold', color: '#1c1917' }}>Privacy Policy</h1>
            </div>
            <p style={{ color: '#78716c', fontSize: '14px', marginBottom: '48px', letterSpacing: '0.05em' }}>Last updated: March 26, 2026</p>
            <div style={{ fontSize: '17px', lineHeight: '1.85', color: '#44403c', fontFamily: 'sans-serif' }}>
                {[
                    {
                        title: '1. Information We Collect',
                        body: `WanderLust AI collects information you provide directly to us when you use our service, including your name, email address, travel preferences, and any other information you submit through our survey forms. We may also collect information automatically, such as usage data, browser type, IP address, and device information when you access our platform.`
                    },
                    {
                        title: '2. How We Use Your Information',
                        body: `We use the information we collect to provide, maintain, and improve our services, generate personalized travel itineraries, communicate with you about updates or service changes, and ensure the security and integrity of our platform. We do not sell your personal information to third parties.`
                    },
                    {
                        title: '3. Data Retention',
                        body: `We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time by contacting us through our Contact page.`
                    },
                    {
                        title: '4. Cookies',
                        body: `WanderLust AI uses cookies and similar tracking technologies to enhance your experience on our platform. These include essential cookies required for the service to function, and analytics cookies that help us understand how users interact with our platform. You may disable cookies in your browser settings, though this may affect the functionality of the service.`
                    },
                    {
                        title: '5. Third-Party Services',
                        body: `Our service integrates with third-party platforms, including Google Firebase for authentication and data storage. These services have their own privacy policies and terms of service. We encourage you to review them separately.`
                    },
                    {
                        title: '6. Your Rights',
                        body: `You have the right to access, correct, or delete your personal data. You may also request that we restrict the processing of your data or object to its processing. To exercise these rights, please contact us at the address provided on our Contact page.`
                    },
                    {
                        title: '7. Changes to This Policy',
                        body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date above.`
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

export default PrivacyPolicy;
