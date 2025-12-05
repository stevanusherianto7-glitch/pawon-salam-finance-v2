import React, { useState } from 'react';
import { useConfigStore } from '../../store/useConfigStore';
import { ArrowLeft, Save, RotateCcw, DollarSign, TrendingUp, Users, Briefcase } from 'lucide-react';
import { colors } from '../../theme/colors';

interface BonusConfigScreenProps {
    onBack?: () => void;
}

export const BonusConfigScreen: React.FC<BonusConfigScreenProps> = ({ onBack }) => {
    const { bonusRates, updateBonusRate, resetToDefaults } = useConfigStore();
    const [localRates, setLocalRates] = useState(bonusRates);
    const [isDirty, setIsDirty] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (key: keyof typeof bonusRates, value: string) => {
        const numValue = parseInt(value.replace(/\D/g, '')) || 0;
        setLocalRates(prev => ({ ...prev, [key]: numValue }));
        setIsDirty(true);
    };

    const handleSave = () => {
        updateBonusRate('ratePermanent', localRates.ratePermanent);
        updateBonusRate('rateProbation', localRates.rateProbation);
        updateBonusRate('rateDailyWorker', localRates.rateDailyWorker);
        setIsDirty(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Reset semua nilai ke default?')) {
            resetToDefaults();
            setLocalRates({
                ratePermanent: 5000,
                rateProbation: 3000,
                rateDailyWorker: 2000,
            });
            setIsDirty(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 pt-12 pb-6 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Konfigurasi Bonus</h1>
                        <p className="text-xs text-gray-500">Atur nilai Rupiah per Poin untuk setiap kategori</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg h-fit">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 text-sm">Sistem Poin & Bonus</h3>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                            Nilai ini akan dikalikan dengan total poin yang dikumpulkan karyawan setiap bulan untuk menghitung bonus kinerja.
                            <br />
                            <span className="font-mono text-[10px] mt-1 block">Rumus: Total Poin × Rate Kategori = Bonus Bulanan</span>
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Permanent */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Briefcase className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Karyawan Tetap</h3>
                                <p className="text-[10px] text-gray-400">Status: PERMANENT</p>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                            <input
                                type="text"
                                value={localRates.ratePermanent.toLocaleString('id-ID')}
                                onChange={(e) => handleChange('ratePermanent', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Probation */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Users className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Masa Percobaan</h3>
                                <p className="text-[10px] text-gray-400">Status: PROBATION</p>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                            <input
                                type="text"
                                value={localRates.rateProbation.toLocaleString('id-ID')}
                                onChange={(e) => handleChange('rateProbation', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Daily Worker */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Daily Worker</h3>
                                <p className="text-[10px] text-gray-400">Status: DAILY_WORKER</p>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                            <input
                                type="text"
                                value={localRates.rateDailyWorker.toLocaleString('id-ID')}
                                onChange={(e) => handleChange('rateDailyWorker', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 flex items-center gap-3 z-20 max-w-md mx-auto">
                <button
                    onClick={handleReset}
                    className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    <RotateCcw className="w-6 h-6" />
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${isDirty ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    <Save className="w-5 h-5" />
                    {showSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}
                </button>
            </div>
        </div>
    );
};
