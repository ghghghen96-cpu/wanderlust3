import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Sparkles, Globe, Users } from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
    {
        icon: <Sparkles size={28} color="#92400e" />,
        title: 'AI-Powered Itineraries',
        desc: 'Our intelligent engine analyzes your travel DNA — preferences, pace, vibe, and dining style — to craft a hyper-personalized day-by-day travel plan.'
    },
    {
        icon: <Globe size={28} color="#92400e" />,
        title: '60+ Global Destinations',
        desc: 'From Paris to Patagonia, our curated database covers over 60 major destinations worldwide, each with 50+ unique activities and recommendations.'
    },
    {
        icon: <Users size={28} color="#92400e" />,
        title: 'Built for Every Traveler',
        desc: 'Whether you\'re a solo explorer, a couple seeking romance, or a family planning an adventure — WanderLust AI adapts to your travel style.'
    },
];

const About = () => (
    <div style={{ minHeight: '100vh', background: '#fafaf9', color: '#1c1917' }}>
        <Navbar />

        {/* Hero */}
        <div style={{
            background: 'linear-gradient(135deg, #1c1917, #44403c)',
            color: 'white', padding: '120px 32px 80px',
            textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <Compass size={56} color="#FBBF24" />
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '64px', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.1 }}>
                About WanderLust
            </h1>
            <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, #FBBF24, transparent)', width: '200px', margin: '0 auto 24px' }} />
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '20px', fontFamily: 'sans-serif', fontWeight: 300, maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                We believe every journey deserves a story worth telling.
            </p>
        </div>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '80px 32px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#78716c', textDecoration: 'none', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '56px' }}>
                <ArrowLeft size={16} /> Back to Home
            </Link>

            {/* Mission */}
            <div style={{ marginBottom: '64px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#92400e', fontFamily: 'sans-serif' }}>Our Mission</span>
                <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '40px', marginTop: '12px', marginBottom: '20px' }}>
                    "Not just a plan, but a feeling."
                </h2>
                <p style={{ fontSize: '18px', lineHeight: 1.85, color: '#44403c', fontFamily: 'sans-serif' }}>
                    WanderLust AI was born from a simple frustration: travel planning takes too long, and most tools think in terms of logistics, not experiences.
                    We set out to build something different — a platform that truly understands <em>how</em> you want to travel, not just <em>where</em>.
                    By combining your personal travel preferences with a curated global database of destinations and activities, we generate intelligent, realistic, and emotionally resonant itineraries in seconds.
                </p>
            </div>

            {/* Feature Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '64px' }}>
                {features.map((f, i) => (
                    <div key={i} style={{
                        background: 'white', borderRadius: '16px', padding: '32px 24px',
                        border: '1px solid #e7e5e4', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ marginBottom: '16px' }}>{f.icon}</div>
                        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '10px', color: '#1c1917' }}>{f.title}</h3>
                        <p style={{ color: '#78716c', fontSize: '15px', lineHeight: 1.75, fontFamily: 'sans-serif', margin: 0 }}>{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', background: 'white', borderRadius: '20px', padding: '56px 40px', border: '1px solid #e7e5e4' }}>
                <Compass size={40} color="#92400e" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '36px', marginBottom: '14px' }}>
                    Ready to explore the world?
                </h2>
                <p style={{ color: '#78716c', fontFamily: 'sans-serif', fontSize: '16px', marginBottom: '32px' }}>
                    Let our AI craft the perfect journey for you.
                </p>
                <Link to="/survey" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    padding: '16px 40px', background: '#1c1917', color: 'white',
                    textDecoration: 'none', borderRadius: '50px',
                    fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'bold',
                    letterSpacing: '0.08em'
                }}>
                    Plan My Adventure →
                </Link>
            </div>
        </div>
    </div>
);

export default About;
