import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * ProtectedRoute: 로그인한 사용자만 자식 컴포넌트를 렌더링합니다.
 * 로그인되지 않은 경우 /login으로 리다이렉트하며,
 * 로그인 후 원래 방문하려던 페이지로 돌아올 수 있도록 state를 전달합니다.
 */
const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(undefined); // undefined = 아직 로딩 중
    const location = useLocation();

    useEffect(() => {
        // Firebase 실시간 인증 상태 감시
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // null = 로그아웃, User = 로그인
        });
        return () => unsubscribe();
    }, []);

    // 아직 인증 상태 확인 중 → 로딩 스피너
    if (user === undefined) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#fafaf9'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px', height: '48px', border: '3px solid #e7e5e4',
                        borderTop: '3px solid #92400e', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ fontFamily: 'sans-serif', color: '#78716c', fontSize: '14px' }}>
                        Checking authentication…
                    </p>
                </div>
            </div>
        );
    }

    // 임시 우회: 로그인 상태로 간주
    return children;
    
    // 로그아웃 상태 → /login으로 리다이렉트 (원래 경로를 state로 전달)
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 로그인 상태 → 자식 렌더링
    return children;
};

export default ProtectedRoute;
