import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IngredientInput, OverheadCost, ProfitProtectionInput, DEFAULT_OVERHEADS } from '../services/HPPCalculatorService';
import { StockItem } from '../services/api';

interface HppState {
    ingredients: IngredientInput[];
    overheads: OverheadCost[];
    menuName: string;
    customSellingPrice: number;
    params: ProfitProtectionInput;

    // Actions
    setIngredients: (ingredients: IngredientInput[]) => void;
    setOverheads: (overheads: OverheadCost[]) => void;
    setMenuName: (name: string) => void;
    setCustomSellingPrice: (price: number) => void;
    setParams: (params: ProfitProtectionInput) => void;

    // Helpers
    addIngredient: (stockItem: StockItem) => void;
    updateIngredient: (id: string, field: keyof IngredientInput, value: any) => void;
    removeIngredient: (id: string) => void;
    toggleOverhead: (id: string) => void;
    reset: () => void;
}

export const useHppStore = create<HppState>()(
    persist(
        (set) => ({
            ingredients: [],
            overheads: DEFAULT_OVERHEADS,
            menuName: '',
            customSellingPrice: 0,
            params: {
                laborCostPercent: 20,
                fixedCostBuffer: 2000,
                enableRiskFactor: false,
                targetProfitMargin: 30
            },

            setIngredients: (ingredients) => set({ ingredients }),
            setOverheads: (overheads) => set({ overheads }),
            setMenuName: (menuName) => set({ menuName }),
            setCustomSellingPrice: (customSellingPrice) => set({ customSellingPrice }),
            setParams: (params) => set({ params }),

            addIngredient: (stockItem) => set((state) => ({
                ingredients: [
                    ...state.ingredients,
                    {
                        id: `ing-${Date.now()}`,
                        stockItem,
                        qtyNeeded: 0,
                        yieldPercent: 100,
                    }
                ]
            })),

            updateIngredient: (id, field, value) => set((state) => ({
                ingredients: state.ingredients.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            })),

            removeIngredient: (id) => set((state) => ({
                ingredients: state.ingredients.filter(i => i.id !== id)
            })),

            toggleOverhead: (id) => set((state) => ({
                overheads: state.overheads.map(oh =>
                    oh.id === id ? { ...oh, isSelected: !oh.isSelected } : oh
                )
            })),

            reset: () => set({
                ingredients: [],
                overheads: DEFAULT_OVERHEADS,
                menuName: '',
                customSellingPrice: 0,
                params: {
                    laborCostPercent: 20,
                    fixedCostBuffer: 2000,
                    enableRiskFactor: false,
                    targetProfitMargin: 30
                }
            })
        }),
        {
            name: 'hpp-storage',
        }
    )
);
