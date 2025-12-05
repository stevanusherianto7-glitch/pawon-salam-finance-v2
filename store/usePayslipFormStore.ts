import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PayrollData } from '../types';

interface PayslipFormState {
    formData: PayrollData;
    setFormData: (data: Partial<PayrollData>) => void;
    resetForm: () => void;
}

const INITIAL_FORM_DATA: PayrollData = {
    month: 'NOVEMBER 2025', // Should be dynamic ideally, but matching current default
    employeeName: '',
    nik: '',
    position: '',
    department: '',
    // status is not in PayrollData interface in types.ts but was in the component state. 
    // I will check types.ts again. It seems types.ts PayrollData does NOT have 'status'.
    // However, the component uses it. I will extend the interface locally or use the one from types if compatible.
    // Let's look at types.ts again.
    // types.ts PayrollData: month, employeeName, nik, position, basicSalary, allowances, positionAllowance, attendanceDays, overtime, tax, otherDeductions.
    // It is missing 'status' and 'department'.
    // Wait, types.ts line 558:
    // export interface PayrollData { month, employeeName, nik, position, basicSalary, allowances, positionAllowance, attendanceDays, overtime, tax, otherDeductions }
    // It indeed misses 'department' and 'status'.
    // I will extend it here to match the component's needs.
    basicSalary: 0,
    allowances: 0,
    positionAllowance: 0,
    attendanceDays: 0,
    overtime: 0,
    tax: 0,
    otherDeductions: 0,
} as PayrollData; // Casting to avoid missing property errors if I don't add them yet

// Extending the type to match component usage
export interface ExtendedPayrollData extends PayrollData {
    department: string;
    status: string;
}

const INITIAL_EXTENDED_DATA: ExtendedPayrollData = {
    month: 'NOVEMBER 2025',
    employeeName: '',
    nik: '',
    position: '',
    department: '',
    status: '',
    basicSalary: 0,
    allowances: 0,
    positionAllowance: 0,
    attendanceDays: 0,
    overtime: 0,
    tax: 0,
    otherDeductions: 0,
};

interface PayslipFormStore {
    formData: ExtendedPayrollData;
    setFormData: (data: Partial<ExtendedPayrollData>) => void;
    resetForm: () => void;
}

export const usePayslipFormStore = create<PayslipFormStore>()(
    persist(
        (set) => ({
            formData: INITIAL_EXTENDED_DATA,

            setFormData: (updates) => set((state) => ({
                formData: { ...state.formData, ...updates }
            })),

            resetForm: () => set({ formData: INITIAL_EXTENDED_DATA }),
        }),
        {
            name: 'payslip-draft-storage',
        }
    )
);
