import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePointStore } from '../../store/usePointStore';
import { CheckCircle, Circle, Award, ListTodo } from 'lucide-react';
import { PremiumGlassCard } from '../../components/PremiumGlassCard';

interface JobdeskScreenProps {
    onNavigate?: (screen: string) => void;
}

const DAILY_TASKS = [
    { id: 't1', label: 'Clock In Tepat Waktu', points: 0 }, // Handled by Attendance
    { id: 't2', label: 'Cek Seragam & Grooming', points: 0 },
    { id: 't3', label: 'Setup Station / Area Kerja', points: 0 },
    { id: 't4', label: 'Mise en place Lengkap', points: 0 },
    { id: 't5', label: 'Kebersihan Area (Awal Shift)', points: 0 },
    { id: 't6', label: 'Handover Shift Sebelumnya', points: 0 },
    { id: 't7', label: 'Kebersihan Area (Akhir Shift)', points: 0 },
    { id: 't8', label: 'Clock Out', points: 0 }, // Handled by Attendance
];

export const JobdeskScreen: React.FC<JobdeskScreenProps> = ({ onNavigate }) => {
    const { user } = useAuthStore();
    const { addPoints } = usePointStore();

    // In a real app, this would be persisted in a store or DB
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const toggleTask = (taskId: string) => {
        if (isSubmitted) return;
        setCompletedTasks(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const progress = (completedTasks.length / DAILY_TASKS.length) * 100;

    const handleSubmit = () => {
        setIsSubmitted(true);

        // Gamification Trigger: Task Master
        if (completedTasks.length === DAILY_TASKS.length) {
            if (user) {
                addPoints(user.id, 3, 'TASK_MASTER', 'Completed all daily tasks');
                setShowSuccess(true);
            }
        } else {
            // Maybe partial points? For now, all or nothing for bonus.
            alert('Jobdesk disimpan. Lengkapi semua untuk bonus poin!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white px-4 pt-12 pb-6 rounded-b-[2rem] shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-full">
                        <ListTodo size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800">Daily Jobdesk</h1>
                        <p className="text-xs text-gray-500 font-medium">Selesaikan tugas harianmu!</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                        <span>Progress Harian</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 mt-6 space-y-4">
                {DAILY_TASKS.map((task, index) => (
                    <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-95 cursor-pointer ${completedTasks.includes(task.id)
                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                : 'bg-white border-gray-100 opacity-80'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${completedTasks.includes(task.id) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                            {completedTasks.includes(task.id) ? <CheckCircle size={16} /> : <Circle size={16} />}
                        </div>
                        <span className={`font-medium text-sm ${completedTasks.includes(task.id) ? 'text-gray-800' : 'text-gray-500'}`}>
                            {task.label}
                        </span>
                    </div>
                ))}

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitted || completedTasks.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 mt-8 disabled:opacity-50 disabled:shadow-none"
                >
                    {isSubmitted ? 'Tersimpan' : 'Simpan Jobdesk'}
                </button>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award size={32} className="text-amber-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-800 mb-2">TASK MASTER!</h2>
                        <p className="text-sm text-gray-500 mb-4">Kamu menyelesaikan semua tugas hari ini.</p>
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl mb-4 animate-pulse">
                            <p className="text-xs font-bold text-amber-600">🏆 BONUS +3 Poin</p>
                        </div>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200"
                        >
                            Mantap!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
