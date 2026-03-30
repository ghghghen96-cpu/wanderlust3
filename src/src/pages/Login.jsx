import { Compass, LogIn, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auth, signInWithGoogle } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 이미 로그인된 경우 원래 페이지 또는 홈으로 이동
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) navigate(from, { replace: true });
        });
        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            // onAuthStateChanged가 감지하여 자동으로 리다이렉트
        } catch (err) {
            setError(t('login.fail'));
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
            padding: '24px'
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
                padding: '56px 48px', maxWidth: '420px', width: '100%', textAlign: 'center',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5)'
            }}>
                {/* 로고 */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <Compass size={52} color="#FBBF24" />
                </div>
                <h1 style={{
                    fontFamily: 'Georgia, serif', fontStyle: 'italic',
                    fontSize: '40px', color: 'white', marginBottom: '6px'
                }}>
                    WanderLust
                </h1>
                <div style={{
                    height: '2px',
                    background: 'linear-gradient(to right, transparent, #FBBF24, transparent)',
                    margin: '0 auto 24px', width: '120px'
                }} />
                <p style={{
                    fontFamily: 'sans-serif', color: 'rgba(255,255,255,0.6)',
                    fontSize: '15px', marginBottom: '40px', lineHeight: 1.6
                }}>
                    {t('login.welcome')}
                </p>

                {/* 에러 메시지 */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                        color: '#fca5a5', fontFamily: 'sans-serif', fontSize: '14px'
                    }}>
                        <AlertCircle size={16} color="#fca5a5" />
                        {error}
                    </div>
                )}

                {/* Google 로그인 버튼 */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '14px',
                        padding: '16px 24px', background: 'white',
                        border: 'none', borderRadius: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s', marginBottom: '20px'
                    }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    {/* Google SVG 아이콘 */}
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.5 0 6.3 1.2 8.4 3.2l6.2-6.2C34.7 3 29.8 1 24 1 14.9 1 7.2 6.3 3.6 13.9l7.3 5.7C12.5 13.5 17.8 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.5 24.5c0-1.7-.2-3.3-.5-4.9H24v9.3h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.9-9.9 7.2-17.3z" />
                        <path fill="#FBBC05" d="M10.9 28.4C10.3 26.8 10 25.1 10 23.4s.3-3.4.9-4.9L3.6 12.8C1.3 17 0 21.5 0 26.5s1.4 9.4 3.8 13.3l7.1-5.4z" />
                        <path fill="#34A853" d="M24 47c5.8 0 10.8-1.9 14.4-5.2l-7.4-5.7c-2 1.3-4.5 2.1-7 2.1-6.2 0-11.5-4.1-13.3-9.8l-7.1 5.4C7.1 41.6 14.9 47 24 47z" />
                    </svg>
                    <span style={{
                        fontFamily: 'sans-serif', fontSize: '16px',
                        fontWeight: 'bold', color: '#1c1917'
                    }}>
                        {loading ? t('login.signingIn') : t('login.googleBtn')}
                    </span>
                </button>

                {/* 홈으로 돌아가기 */}
                <a
                    href="/"
                    style={{
                        display: 'block', fontFamily: 'sans-serif',
                        fontSize: '13px', color: 'rgba(255,255,255,0.4)',
                        textDecoration: 'none', letterSpacing: '0.05em',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                    ← {t('login.backHome')}
                </a>
            </div>
        </div>
    );
};

export default Login;
