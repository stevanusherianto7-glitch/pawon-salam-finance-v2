import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Smartphone, Users, Utensils, Megaphone, Crown, LogIn, Briefcase, Zap, Banknote, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { BackgroundPattern } from '../components/layout/BackgroundPattern';

// --- 1. THE SHELL: BaseAuthCard ---
const BaseAuthCard = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden transition-all duration-300 relative">
        {/* Decorative Shine Effect */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-400/10 rounded-full blur-3xl pointer-events-none transition-all duration-700"></div>
        {children}
    </div>
);

export const LoginScreen = () => {
    const [view, setView] = useState<'LOGIN' | 'ROLES'>('LOGIN');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const { login, isLoading } = useAuthStore();

    const DEMO_ROLES = [
        { label: 'Super Admin', name: 'IT Support Sistem', phone: '08888888888', icon: Zap },
        { label: 'Executive Admin', name: 'Dr. Veronica Dhian Rusnasari. SpPD, M.MRS', phone: '081325736911', icon: Crown },
        { label: 'Human Resources Manager', name: 'Ana Jumnanik', phone: '085640028589', icon: Users },
        { label: 'Restaurant Manager', name: 'Wawan', phone: '085219481806', icon: Utensils },
        { label: 'Finance Manager', name: 'Boston Endi Sitompul', phone: '082312398289', icon: Banknote },
        { label: 'Marketing Manager', name: 'Anto', phone: '082125265827', icon: Megaphone },
        { label: 'Staff (FOH / BOH)', name: 'Contoh Staff', phone: '081313042461', icon: Briefcase }
    ];

    const handleRoleSelect = (role: any) => {
        setError('');
        setPhoneNumber(role.phone);
        setView('LOGIN');
        // Small delay to ensure view switch happened before focusing
        setTimeout(() => phoneInputRef.current?.focus(), 100);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (phoneNumber.length < 3) {
            setError('Masukkan nomor HP yang valid.');
            return;
        }

        const res = await login(phoneNumber.trim());
        if (!res.success) {
            const msg = res.message || `Login gagal. Periksa kembali No. HP Anda.`;
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 bg-gradient-to-b from-orange-50 to-white font-sans relative overflow-hidden">
            <BackgroundPattern />

            {/* Header Logo Area */}
            <div className={`mb-8 text-center transition-all duration-500 ${view === 'ROLES' ? 'scale-90 opacity-80' : 'scale-100'}`}>
                <div className="mb-4 animate-slide-in-down">
                    <Logo variant="color" size="lg" />
                </div>
            </div>

            {/* The Unified Card */}
            <div className="w-full max-w-sm relative z-20">
                <BaseAuthCard>
                    {view === 'LOGIN' ? (
                        // === LOGIN FORM VIEW ===
                        <div className="p-8 flex flex-col gap-6 animate-fade-in-up">

                            {/* Header */}
                            <div className="flex flex-col items-center justify-center">
                                <h2 className="text-[11px] font-bold text-orange-600 uppercase tracking-[0.3em] drop-shadow-sm">Login User</h2>
                                <p className="text-[10px] text-gray-500 mt-1.5 font-medium">Gunakan nomor HP terdaftar</p>
                            </div>

                            <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-orange-50 text-orange-500 transition-colors group-focus-within/input:bg-orange-100 group-focus-within/input:text-orange-600">
                                        <Smartphone size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        ref={phoneInputRef}
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-14 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-gray-800 placeholder-gray-400 text-sm shadow-sm"
                                        placeholder="Nomor HP"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-2 w-full py-4 rounded-2xl font-bold text-white active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl shadow-orange-500/30 relative group/btn overflow-hidden tracking-widest text-sm"
                                >
                                    {/* Glass Shine Removed for Strict Compliance */}
                                    {/* <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover/btn:animate-shine"></div> */}

                                    {isLoading ? (
                                        <span className="flex items-center gap-2 relative z-10"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>
                                    ) : (
                                        <span className="flex items-center gap-2 relative z-10"><LogIn size={18} /> MASUK</span>
                                    )}
                                </button>
                            </form>

                            {/* Switch to Roles */}
                            <div className="text-center pt-2">
                                <button
                                    onClick={() => setView('ROLES')}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
                                >
                                    <Users size={14} />
                                    Pilih Akun
                                </button>
                            </div>

                        </div>
                    ) : (
                        // === ROLE SELECTOR VIEW ===
                        <div className="flex flex-col h-[500px] animate-fade-in-up"> {/* Fixed height for consistency/scroll */}

                            <div className="pt-8 px-8 pb-0 bg-white/50 backdrop-blur-sm z-10 shrink-0">
                                <h2 className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase mb-6">
                                    PILIH AKUN
                                </h2>
                            </div>

                            {/* Scrollable List */}
                            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3 scrollbar-hide">
                                {DEMO_ROLES.map((role, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleRoleSelect(role)}
                                        className="w-full flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-orange-50 hover:border-orange-200 transition-all group text-left active:scale-[0.98]"
                                        style={{ animationDelay: `${idx * 50}ms` }} // Staggered animation effect if we added animation class
                                    >
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:bg-orange-100 transition-all shrink-0">
                                            <role.icon size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-700 text-sm group-hover:text-orange-700 transition-colors">{role.label}</p>
                                            {role.name && <p className="text-[10px] text-slate-400 font-medium truncate group-hover:text-slate-500">{role.name}</p>}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Footer Action */}
                            <div className="p-6 border-t border-slate-100 bg-white/50 backdrop-blur-sm shrink-0">
                                <button
                                    onClick={() => setView('LOGIN')}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    <ArrowLeft size={14} />
                                    Kembali
                                </button>
                            </div>
                        </div>
                    )}
                </BaseAuthCard>

                {/* Error Toast (Floating Below) */}
                {error && (
                    <div className="absolute top-full left-0 right-0 mt-4 mx-4 p-3 rounded-xl bg-red-50/90 backdrop-blur-sm border border-red-200 flex flex-col gap-2 animate-shake shadow-lg shadow-red-500/10 z-0">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse"></div>
                                    <p className="text-[10px] text-red-700 font-bold leading-tight uppercase tracking-wide">Login Gagal</p>
                                </div>
                                <button onClick={() => setError('')} className="text-[10px] text-red-600 hover:text-red-800 font-bold">Tutup</button>
                            </div>
                            <p className="text-xs text-red-600 leading-tight">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center relative z-10">
                <p className="text-[10px] text-gray-400 font-bold text-shadow-sm flex flex-col items-center gap-1 opacity-80">
                    <span>&copy; 2025 Pawon Salam Enterprise</span>
                </p>
            </div>
        </div>
    );
};