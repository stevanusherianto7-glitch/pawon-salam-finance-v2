import React, { useState, useEffect } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { usePerformanceStore } from '../../store/performanceStore';
import { usePointStore } from '../../store/usePointStore';
import { useAuthStore } from '../../store/authStore';
import { Employee, UserRole, PerformanceReview, EmployeeArea } from '../../types';
import { Star, Save, User, ChevronLeft, Award, AlertCircle } from 'lucide-react';
import { PremiumGlassCard } from '../../components/PremiumGlassCard';

interface PerformanceAuditScreenProps {
    onNavigate: (screen: string) => void;
    onBack?: () => void;
}

const CRITERIA = [
    { id: 'discipline', label: 'Disiplin & Waktu', icon: '⏰' },
    { id: 'teamwork', label: 'Kerjasama Tim', icon: '🤝' },
    { id: 'service', label: 'Service Quality', icon: '🛎️' },
    { id: 'cleanliness', label: 'Kebersihan Area', icon: '✨' },
    { id: 'speed', label: 'Kecepatan Kerja', icon: '⚡' }
];

export const PerformanceAuditScreen: React.FC<PerformanceAuditScreenProps> = ({ onNavigate, onBack }) => {
    const { user } = useAuthStore();
    const { employees } = useEmployeeStore();
    const { saveReview, isLoading } = usePerformanceStore();
    const { addPoints } = usePointStore();

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [scores, setScores] = useState<Record<string, number>>({});
    const [comment, setComment] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Filter employees: Managers can only audit Staff (FOH/BOH)
    const staffList = employees.filter(e => e.role === UserRole.EMPLOYEE);

    const handleScoreChange = (criteriaId: string, score: number) => {
        setScores(prev => ({ ...prev, [criteriaId]: score }));
    };

    const calculateAverage = () => {
        const values = Object.values(scores);
        if (values.length === 0) return '0.0';
        const sum = values.reduce((a, b) => a + b, 0);
        return (sum / CRITERIA.length).toFixed(1); // Assume all criteria must be filled?
    };

    const isFormValid = () => {
        return selectedEmployeeId && CRITERIA.every(c => scores[c.id] > 0) && comment.length > 5;
    };

    const handleSubmit = async () => {
        if (!isFormValid() || !user) return;

        const averageScore = parseFloat(calculateAverage());

        const review: PerformanceReview = {
            id: `pr-${Date.now()}`,
            employeeId: selectedEmployeeId,
            reviewerId: user.id,
            periodMonth: new Date().getMonth() + 1,
            periodYear: new Date().getFullYear(),
            area: employees.find(e => e.id === selectedEmployeeId)?.area || EmployeeArea.FOH,
            scores: scores,
            notes: { manager_note: comment },
            overallScore: averageScore,
            overallComment: comment,
            isFinalized: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const success = await saveReview(review);

        if (success) {
            // Gamification Trigger: Perfect Audit
            if (averageScore === 5.0) {
                addPoints(selectedEmployeeId, 5, 'PERFECT_AUDIT', 'Perfect 5.0 Performance Audit');
            }

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setScores({});
                setComment('');
                setSelectedEmployeeId('');
                if (onBack) onBack();
            }, 2000);
        } else {
            alert('Gagal menyimpan audit.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 pt-12 pb-6 rounded-b-[2rem] shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-800">Performance Audit</h1>
                        <p className="text-xs text-gray-500 font-medium">Penilaian Kinerja Harian</p>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-4 relative z-20 space-y-4">
                {/* Employee Selector */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Pilih Karyawan</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {staffList.map(emp => (
                            <div
                                key={emp.id}
                                onClick={() => setSelectedEmployeeId(emp.id)}
                                className={`shrink-0 w-20 flex flex-col items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${selectedEmployeeId === emp.id ? 'bg-blue-50 border-blue-500 shadow-md scale-105' : 'bg-gray-50 border-gray-100 opacity-70'}`}
                            >
                                <img src={emp.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                                <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{emp.name.split(' ')[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedEmployeeId && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Criteria Form */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 text-sm">Kriteria Penilaian</h3>
                                <div className="bg-blue-50 px-2 py-1 rounded-lg text-blue-600 font-bold text-xs">
                                    Avg: {calculateAverage()}
                                </div>
                            </div>

                            {CRITERIA.map(criterion => (
                                <div key={criterion.id} className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-gray-600">
                                        <span>{criterion.icon} {criterion.label}</span>
                                        <span className={scores[criterion.id] === 5 ? 'text-green-600 font-bold' : ''}>{scores[criterion.id] || 0}/5</span>
                                    </div>
                                    <div className="flex justify-between gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => handleScoreChange(criterion.id, star)}
                                                className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${scores[criterion.id] >= star ? 'bg-amber-400 text-white shadow-sm' : 'bg-gray-100 text-gray-300'}`}
                                            >
                                                <Star size={14} fill={scores[criterion.id] >= star ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comment Section */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Catatan Manager</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Berikan feedback konstruktif..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 h-24 resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!isFormValid() || isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                        >
                            {isLoading ? 'Menyimpan...' : (
                                <>
                                    <Save size={18} /> Simpan Penilaian
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award size={32} className="text-green-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-800 mb-2">Audit Tersimpan!</h2>
                        <p className="text-sm text-gray-500 mb-4">Penilaian kinerja berhasil dicatat.</p>
                        {parseFloat(calculateAverage()) === 5.0 && (
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl mb-2 animate-pulse">
                                <p className="text-xs font-bold text-amber-600">🏆 PERFECT SCORE! +5 Poin</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
