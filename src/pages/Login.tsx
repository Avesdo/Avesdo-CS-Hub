import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
    const { user, loginWithGoogle, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] p-4 font-sans">
            <div className="w-full max-w-[520px] bg-white rounded-[24px] shadow-[0px_12px_48px_rgba(0,0,0,0.06)] border border-slate-100 text-center flex flex-col items-center overflow-hidden">
                <div className="px-12 pt-14 pb-8 flex flex-col items-center w-full">
                    {/* Brand Logo */}
                    <img 
                        alt="Avesdo" 
                        className="h-[46px] w-auto object-contain mb-10" 
                        src="https://lh3.googleusercontent.com/d/1HgOfOymPbhh2hjSxeqiZmbe20o6uDlVk" 
                    />

                    <h1 className="text-[26px] font-bold text-[#0F172A] mb-4">Welcome to CS Hub</h1>
                    <p className="text-[15px] text-[#64748B] mb-8 max-w-[360px] mx-auto leading-relaxed">
                        Please sign in using your Avesdo Google account to access the hub
                    </p>

                    <button
                        onClick={loginWithGoogle}
                        className="flex w-full items-center justify-center gap-3 rounded-[12px] bg-white px-4 py-3.5 text-[16px] font-semibold text-[#334155] shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        <svg className="h-[20px] w-[20px]" aria-hidden="true" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>
                
                <div className="w-full px-6 pb-6">
                    <div className="p-5 bg-[#F8FAFC] border border-slate-200 rounded-[16px] flex items-start gap-4 text-left w-full">
                        <ShieldCheck className="w-[20px] h-[20px] text-[#65A30D] shrink-0 mt-0.5" strokeWidth={2.5} />
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[14px] font-bold text-[#1E293B]">Strict Domain Authorization</span>
                            <span className="text-[13px] leading-relaxed text-[#64748B]">
                                Access is restricted to authorized @avesdo.com personnel.<br/>
                                All activities are securely logged and monitored.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
