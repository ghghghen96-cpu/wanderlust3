import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Landing from './pages/Landing';
import Survey from './pages/Survey';
import Itinerary from './pages/Itinerary';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import About from './pages/About';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import Marketplace from './pages/Marketplace';
import TemplateDetail from './pages/TemplateDetail';
import ProtectedRoute from './components/ProtectedRoute';

// ─── 전역 에러 바운더리: 어디서든 에러 발생 시 흰 화면 대신 안내 화면 표시 ─────
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] 앱 에러 발생:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    background: '#0f172a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    color: '#e2e8f0',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        일시적인 문제가 발생했습니다
                    </h1>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '400px' }}>
                        오류가 발생했습니다. 진행 중이거나 작성 중인 일정이 있다면 다시 시도해 주세요.
                    </p>
                    <button
                        onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
                        style={{
                            padding: '0.75rem 2rem',
                            background: 'linear-gradient(135deg, #FF8A71, #FF6B9B)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1rem',
                        }}
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Routes>
                    {/* 공개 라우트 */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/survey" element={<Survey />} />
                    <Route path="/itinerary" element={<Itinerary />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/marketplace" element={<Marketplace />} />

                    {/* 보호된 라우트: 로그인 필수 */}
                    <Route
                        path="/mypage"
                        element={
                            <ProtectedRoute>
                                <MyPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/template/:id"
                        element={
                            <ProtectedRoute>
                                <TemplateDetail />
                            </ProtectedRoute>
                        }
                    />
                    {/* 존재하지 않는 경로는 홈으로 리다이렉트 */}
                    <Route path="*" element={<Landing />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
