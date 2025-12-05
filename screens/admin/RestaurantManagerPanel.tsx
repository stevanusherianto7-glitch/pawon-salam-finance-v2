import React, { useEffect } from 'react';
import { Calculator, CheckSquare, Calendar, FilePlus, AlertTriangle, Package, TrendingUp, Users, ChevronRight, Wallet, Activity } from 'lucide-react';
import { PremiumGlassCard } from '../../components/PremiumGlassCard';
import { usePerformanceStore } from '../../store/performanceStore';


interface Props {
    onNavigate: (screen: string) => void;
}

export const RestaurantManagerPanel: React.FC<Props> = ({ onNavigate }) => {
    const { weeklyScore, fetchWeeklyScore } = usePerformanceStore();

    useEffect(() => {
        fetchWeeklyScore();
    }, [fetchWeeklyScore]);

    return (
        <div className="px-4 -mt-6 relative z-10 space-y-3">

            {/* WORKFLOW #2: Dynamic Team Performance KPI */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Kinerja Tim (Mingguan)</p>
                    <h2 className="text-3xl font-black">{weeklyScore}%</h2>
                    <p className="text-[10px] mt-1 flex items-center gap-1"><Activity size={10} /> Realtime Compliance</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                    <TrendingUp size={24} className="text-white" />
                </div>
            </div>

            {/* Quick Actions Grid - PREMIUM GLASS STYLE */}
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2.5 text-xs uppercase tracking-wider">Menu Utama</h3>
                <div className="grid grid-cols-2 gap-2">
                    <PremiumGlassCard title="Checklist" subtitle="Performa Harian" icon={CheckSquare} onClick={() => onNavigate('dailyChecklistList')} themeColor="orange" />
                    <PremiumGlassCard title="Shift" subtitle="Jadwal Staff" icon={Calendar} onClick={() => onNavigate('shiftScheduler')} themeColor="blue" />
                    <PremiumGlassCard title="Cuti" subtitle="Input Izin" icon={FilePlus} onClick={() => onNavigate('adminLeaveRequest')} themeColor="teal" />
                    <PremiumGlassCard title="Monitoring" subtitle="Laporan Staff" icon={AlertTriangle} onClick={() => onNavigate('jobdeskMonitor')} themeColor="red" />
                    <PremiumGlassCard title="Stock Opname" subtitle="Input Stok Fisik" icon={Package} onClick={() => onNavigate('stockOpname')} themeColor="green" />
                    <PremiumGlassCard title="Audit Kinerja" subtitle="Nilai Staff" icon={Users} onClick={() => onNavigate('performanceAudit')} themeColor="blue" />
                    <PremiumGlassCard title="Kalkulator HPP" subtitle="Simulasi Menu" icon={Calculator} onClick={() => onNavigate('hppCalculator')} themeColor="orange" />
                    <PremiumGlassCard title="Laporan Biaya" subtitle="Smart OPEX" icon={Wallet} onClick={() => onNavigate('smartOpex')} themeColor="purple" />
                    <PremiumGlassCard title="Slip Gaji Saya" subtitle="Riwayat Gaji" icon={Wallet} onClick={() => onNavigate('employeePayslips')} themeColor="teal" />
                </div>
            </div>

            {/* Stats & Reports */}
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onNavigate('hrTrendReport')} className="p-2.5 bg-yellow-50 text-yellow-800 rounded-xl text-[10px] font-bold border border-yellow-100 flex items-center justify-center gap-2 hover:bg-yellow-100 shadow-sm">
                    <TrendingUp size={14} /> Laporan Tren
                </button>
                <button onClick={() => onNavigate('hrTopPerformance')} className="p-2.5 bg-purple-50 text-purple-800 rounded-xl text-[10px] font-bold border border-purple-100 flex items-center justify-center gap-2 hover:bg-purple-100 shadow-sm">
                    <Users size={14} /> Top Performance
                </button>
            </div>
        </div>
    );
};
