import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Survey from './pages/Survey';
import Itinerary from './pages/Itinerary';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import About from './pages/About';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
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

                {/* 보호된 라우트: 로그인 필수 */}
                <Route
                    path="/mypage"
                    element={
                        <ProtectedRoute>
                            <MyPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
