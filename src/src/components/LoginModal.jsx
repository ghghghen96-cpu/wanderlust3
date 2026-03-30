import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from './Button';
import { signInWithGoogle } from '../firebase';

const LoginModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-secondary mb-2">
                        {isLogin ? 'Welcome Back' : 'Join WanderLust AI'}
                    </h2>
                    <p className="text-gray-500">
                        {isLogin ? 'Enter your details to access your trips.' : 'Start your journey with us today.'}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                placeholder="hello@example.com"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <Button fullWidth className="mt-6" onClick={() => {
                        alert("Successfully logged in! (Demo)");
                        onClose();
                    }}>
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </Button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400 uppercase tracking-widest text-xs font-bold">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                const user = await signInWithGoogle();
                                if (user) {
                                    alert(`Welcome, ${user.displayName}!`);
                                    onClose();
                                }
                            } catch (error) {
                                console.error("Login Error:", error);
                                // 상세 오류 메시지 출력
                                alert(`Google login failed: ${error.message}\n\nPlease ensure Google Auth is enabled in Firebase Console and localhost is an authorized domain.`);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-secondary text-base"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Google Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        className="text-primary font-bold hover:underline"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
