import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BonusRates {
    ratePermanent: number;
    rateProbation: number;
    rateDailyWorker: number;
}

interface ConfigState {
    bonusRates: BonusRates;
    updateBonusRate: (category: keyof BonusRates, amount: number) => void;
    resetToDefaults: () => void;
}

const DEFAULT_RATES: BonusRates = {
    ratePermanent: 5000,
    rateProbation: 3000,
    rateDailyWorker: 2000,
};

export const useConfigStore = create<ConfigState>()(
    persist(
        (set) => ({
            bonusRates: DEFAULT_RATES,
            updateBonusRate: (category, amount) =>
                set((state) => ({
                    bonusRates: {
                        ...state.bonusRates,
                        [category]: amount,
                    },
                })),
            resetToDefaults: () => set({ bonusRates: DEFAULT_RATES }),
        }),
        {
            name: 'pawon-config-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
