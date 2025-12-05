import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Smartphone, Users, Utensils, Megaphone, Crown, LogIn, Briefcase, Zap, Banknote } from 'lucide-react';
import { Logo } from '../components/Logo';
import { BackgroundPattern } from '../components/layout/BackgroundPattern';

export const LoginScreen = () => {
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
        <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-orange-50 to-white font-sans relative">
            <BackgroundPattern />

            {/* BAGIAN ATAS: Logo & Form (Static) */}
            <div className="flex-none px-6 pt-8 pb-4 relative z-20 flex flex-col items-center w-full">
                <div className="mb-6 animate-slide-in-down">
                    <Logo variant="color" size="lg" />
                </div>

                {/* Form Container - Premium Glass (Single Layer) */}
                <div className="w-full max-w-sm mx-auto bg-white/80 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] p-6 shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
                    {/* Decorative Shine Effect */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-400/20 transition-all duration-700"></div>

                    {/* Inner Zone A: Login Form (Clean White, No Double Glass) */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="shrink-0 flex flex-col items-center justify-center mb-5">
                            <h2 className="text-[11px] font-bold text-orange-600 uppercase tracking-[0.3em] drop-shadow-sm">Login User</h2>
                            <p className="text-[10px] text-gray-500 mt-1 font-medium">Gunakan nomor HP terdaftar</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-orange-50 text-orange-500 transition-colors group-focus-within/input:bg-orange-100 group-focus-within/input:text-orange-600">
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
                                className="!mt-6 w-full py-4 rounded-2xl font-bold text-white active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl shadow-orange-500/30 relative group/btn overflow-hidden tracking-widest text-sm"
                            >
                                {/* Glass Shine */}
                                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover/btn:animate-shine"></div>

                                {isLoading ? (
                                    <span className="flex items-center gap-2 relative z-10"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>
                                ) : (
                                    <span className="flex items-center gap-2 relative z-10"><LogIn size={18} /> MASUK</span>
                                )}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 rounded-xl bg-red-50/90 backdrop-blur-sm border border-red-200 flex flex-col gap-2 animate-shake shadow-lg shadow-red-500/10">
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
            </div>

            {/* BAGIAN TENGAH: List Akun (Scrollable) */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-2 scrollbar-hide w-full max-w-sm mx-auto relative z-10">
                {/* Separator with Gap */}
                <div className="flex items-center gap-3 py-6 sticky top-0 bg-gradient-to-b from-orange-50/95 via-orange-50/90 to-transparent backdrop-blur-sm z-20 -mx-2 px-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                    <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Pilih Akun</p>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                </div>

                <div className="space-y-3 pb-8">
                    {DEMO_ROLES.map((role, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleRoleSelect(role)}
                            className="group relative w-full flex items-center gap-4 p-3.5 text-left bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 hover:bg-white/90 active:scale-[0.98] shadow-sm"
                        >
                            {/* Ambient Lighting */}
                            <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-orange-100/50 to-rose-100/50 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Pop-out Icon */}
                            <div className="bg-white rounded-xl p-2.5 shadow-sm border border-orange-100/50 transition-all duration-300 group-hover:shadow-md group-hover:scale-110 group-hover:rotate-3 group-hover:border-orange-200">
                                <role.icon size={20} className="text-orange-500" strokeWidth={2} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 relative z-10">
                                <p className="text-xs font-bold text-gray-800 tracking-tight group-hover:text-orange-700 transition-colors">{role.label}</p>
                                {role.name && <p className="text-[10px] text-gray-500 font-medium truncate group-hover:text-gray-600">{role.name}</p>}
                            </div>

                            {/* Arrow Icon */}
                            <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300 bg-orange-50 rounded-full p-1 shadow-sm">
                                <LogIn size={14} className="text-orange-500" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* BAGIAN BAWAH: Footer (Static) */}
            <div className="flex-none py-4 text-center relative z-10">
                <p className="text-[10px] text-gray-400 font-bold text-shadow-sm flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                    <span>&copy; 2025 Pawon Salam Enterprise</span>
                </p>
            </div>
        </div>
    );
};