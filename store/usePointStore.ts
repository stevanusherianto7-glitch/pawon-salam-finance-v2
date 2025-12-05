import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useConfigStore } from './useConfigStore';
import { useEmployeeStore } from './employeeStore';
import { Employee, EmploymentCategory } from '../types';

export type PointType = 'EARLY_BIRD' | 'TASK_MASTER' | 'PERFECT_AUDIT' | 'MANUAL_ADJUSTMENT' | 'EOTM_BONUS';

export interface PointTransaction {
    id: string;
    employeeId: string;
    amount: number;
    type: PointType;
    reason: string;
    timestamp: number;
    date: string; // YYYY-MM-DD
}

interface PointState {
    transactions: PointTransaction[];

    // Actions
    addPoints: (employeeId: string, amount: number, type: PointType, reason: string) => void;
    getEmployeePoints: (employeeId: string, month: number, year: number) => number;
    calculateMonthlyBonus: (employeeId: string, month: number, year: number) => number;
    getLeaderboard: (month: number, year: number) => { employeeId: string; name: string; avatarUrl: string; totalPoints: number; rank: number }[];
    calculateEOTM: (month: number, year: number) => { employeeId: string; name: string; avatarUrl: string; score: number } | null;
    resetPoints: () => void;
}

export const usePointStore = create<PointState>()(
    persist(
        (set, get) => ({
            transactions: [],

            addPoints: (employeeId, amount, type, reason) => {
                const newTransaction: PointTransaction = {
                    id: Math.random().toString(36).substr(2, 9),
                    employeeId,
                    amount,
                    type,
                    reason,
                    timestamp: Date.now(),
                    date: new Date().toISOString().split('T')[0]
                };
                set((state) => ({
                    transactions: [newTransaction, ...state.transactions]
                }));
            },

            getEmployeePoints: (employeeId, month, year) => {
                const { transactions } = get();
                return transactions
                    .filter(t => {
                        const d = new Date(t.timestamp);
                        return t.employeeId === employeeId &&
                            d.getMonth() + 1 === month &&
                            d.getFullYear() === year;
                    })
                    .reduce((sum, t) => sum + t.amount, 0);
            },

            calculateMonthlyBonus: (employeeId, month, year) => {
                const totalPoints = get().getEmployeePoints(employeeId, month, year);
                if (totalPoints <= 0) return 0;

                const employee = useEmployeeStore.getState().employees.find(e => e.id === employeeId);
                if (!employee) return 0;

                const config = useConfigStore.getState();
                let rate = 0;

                switch (employee.category) {
                    case EmploymentCategory.PERMANENT:
                        rate = config.bonusRates.ratePermanent;
                        break;
                    case EmploymentCategory.PROBATION:
                        rate = config.bonusRates.rateProbation;
                        break;
                    case EmploymentCategory.DAILY_WORKER:
                        rate = config.bonusRates.rateDailyWorker;
                        break;
                    default:
                        rate = config.bonusRates.ratePermanent; // Fallback
                }

                return totalPoints * rate;
            },

            getLeaderboard: (month, year) => {
                const { transactions } = get();
                const employees = useEmployeeStore.getState().employees;

                // 1. Group points by employee
                const pointsMap = new Map<string, number>();

                transactions.forEach(t => {
                    const d = new Date(t.timestamp);
                    if (d.getMonth() + 1 === month && d.getFullYear() === year) {
                        const current = pointsMap.get(t.employeeId) || 0;
                        pointsMap.set(t.employeeId, current + t.amount);
                    }
                });

                // 2. Map to leaderboard format
                const leaderboard = Array.from(pointsMap.entries()).map(([empId, points]) => {
                    const emp = employees.find(e => e.id === empId);
                    return {
                        employeeId: empId,
                        name: emp?.name || 'Unknown',
                        avatarUrl: emp?.avatarUrl || 'https://via.placeholder.com/150',
                        totalPoints: points,
                        rank: 0
                    };
                });

                // 3. Sort descending
                leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

                // 4. Assign ranks
                leaderboard.forEach((item, index) => {
                    item.rank = index + 1;
                });

                return leaderboard;
            },

            calculateEOTM: (month, year) => {
                const leaderboard = get().getLeaderboard(month, year);
                // We need performance reviews too. 
                // Using require to avoid potential circular dependency issues if performanceStore imports pointStore later.
                const { reviews } = require('./performanceStore').usePerformanceStore.getState();

                if (leaderboard.length === 0) return null;

                const candidates = leaderboard.map(candidate => {
                    // Get average performance score for this month
                    const candidateReviews = reviews.filter((r: any) =>
                        r.employeeId === candidate.employeeId &&
                        r.periodMonth === month &&
                        r.periodYear === year
                    );

                    const avgPerfScore = candidateReviews.length > 0
                        ? candidateReviews.reduce((sum: number, r: any) => sum + r.overallScore, 0) / candidateReviews.length
                        : 0;

                    // Formula: (Points * 0.5) + (AvgScore * 10 * 0.5)
                    // Example: 100 points -> 50. 5.0 score -> 50. Total 100.
                    const finalScore = (candidate.totalPoints * 0.5) + (avgPerfScore * 10 * 0.5);

                    return {
                        ...candidate,
                        avgPerfScore,
                        finalScore
                    };
                });

                // Sort by final score
                candidates.sort((a, b) => b.finalScore - a.finalScore);

                if (candidates.length > 0) {
                    const winner = candidates[0];
                    return {
                        employeeId: winner.employeeId,
                        name: winner.name,
                        avatarUrl: winner.avatarUrl,
                        score: winner.finalScore
                    };
                }
                return null;
            },

            resetPoints: () => set({ transactions: [] })
        }),
        {
            name: 'point-storage',
            storage: createJSONStorage(() => localStorage)
        }
    )
);
