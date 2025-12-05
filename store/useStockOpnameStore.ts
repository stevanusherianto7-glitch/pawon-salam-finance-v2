import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StockItem } from '../services/api';

interface StockOpnameState {
    items: StockItem[];
    isDirty: boolean; // Tracks if user has made changes
    setItems: (items: StockItem[]) => void;
    updateItemQty: (id: string, qty: number | '') => void;
    updateItemName: (id: string, name: string) => void;
    resetStockData: () => void;
}

export const useStockOpnameStore = create<StockOpnameState>()(
    persist(
        (set) => ({
            items: [],
            isDirty: false,

            setItems: (items) => set({ items, isDirty: false }),

            updateItemQty: (id, qty) => set((state) => ({
                items: state.items.map(item =>
                    item.id === id ? { ...item, physicalStock: qty } : item
                ),
                isDirty: true
            })),

            updateItemName: (id, name) => set((state) => ({
                items: state.items.map(item =>
                    item.id === id ? { ...item, name } : item
                ),
                isDirty: true
            })),

            resetStockData: () => set({ items: [], isDirty: false }),
        }),
        {
            name: 'stock-opname-storage',
        }
    )
);
