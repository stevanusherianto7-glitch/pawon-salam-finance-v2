import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronDown, Trash2, Printer } from 'lucide-react';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { UserRole, Employee, EmployeeArea } from '../../types';
import { usePayslipFormStore } from '../../store/usePayslipFormStore';

// --- INTERFACES ---

interface Props {
    onBack?: () => void;
}

interface PayrollData {
    month: string;
    employeeName: string;
    nik: string;
    position: string;
    department: string;
    status: string;
    basicSalary: number;
    allowances: number;
    positionAllowance: number;
    attendanceDays: number;
    overtime: number;
    tax: number;
    otherDeductions: number;
}

// --- VISUAL COMPONENTS (For PDF Preview) ---
// Kept original SVG components for the actual slip design
const SlipMotifTopRight = () => (
    <div className="absolute top-0 right-0 z-0 pointer-events-none">
        <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 right-0 w-[60%] md:w-auto h-auto print:w-[15cm]">
            <path d="M400 0L400 220C320 200 200 180 120 0H400Z" fill="#FB923C" fillOpacity="0.5" />
            <circle cx="360" cy="60" r="25" fill="#EA580C" fillOpacity="0.6" />
            <circle cx="310" cy="40" r="15" fill="#F97316" fillOpacity="0.8" />
            <circle cx="260" cy="30" r="10" fill="#FB923C" fillOpacity="0.9" />
            <circle cx="320" cy="100" r="18" fill="#FDBA74" fillOpacity="0.7" />
            <circle cx="280" cy="140" r="8" fill="#EA580C" fillOpacity="0.5" />
            <circle cx="380" cy="130" r="12" fill="#C2410C" fillOpacity="0.6" />
            <circle cx="350" cy="160" r="6" fill="#FDBA74" fillOpacity="0.8" />
        </svg>
    </div>
);

const SlipMotifTopLeft = () => (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 z-0 pointer-events-none w-[30%] md:w-auto h-auto print:w-[8cm]">
        <circle cx="30" cy="50" r="18" fill="#F97316" fillOpacity="0.8" />
        <circle cx="65" cy="25" r="10" fill="#FB923C" fillOpacity="0.8" />
        <circle cx="20" cy="90" r="8" fill="#FDBA74" fillOpacity="0.9" />
        <circle cx="60" cy="70" r="5" fill="#EA580C" fillOpacity="0.6" />
        <circle cx="85" cy="45" r="4" fill="#C2410C" fillOpacity="0.5" />
    </svg>
);

const SlipMotifBottomLeft = () => (
    <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 left-0 z-0 pointer-events-none w-[30%] md:w-auto h-auto print:w-[8cm]">
        <path d="M0 150C20 100 80 80 120 150H0Z" fill="#FDBA74" fillOpacity="0.8" />
    </svg>
);

const SlipMotifBottomRight = () => (
    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 right-0 z-0 pointer-events-none w-[25%] md:w-auto h-auto print:w-[6cm]">
        <circle cx="120" cy="110" r="12" fill="#F97316" fillOpacity="0.8" />
        <circle cx="95" cy="130" r="8" fill="#FB923C" fillOpacity="0.8" />
        <circle cx="130" cy="80" r="5" fill="#FDBA74" fillOpacity="0.9" />
        <circle cx="80" cy="140" r="4" fill="#EA580C" fillOpacity="0.6" />
    </svg>
);

const SlipLogo = () => (
    <div className="flex items-center gap-5 text-orange-600">
        <div className="w-24 h-24 text-orange-600 relative flex items-center justify-center">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full"
            >
                <circle cx="50" cy="50" r="44" />
                <path d="M28 72 Q 28 28 72 28 Q 72 72 28 72 Z" />
                <line x1="28" y1="72" x2="72" y2="28" />
                <line x1="28" y1="72" x2="19" y2="81" />
            </svg>
        </div>
        <div className="text-left">
            <p className="text-5xl font-bold tracking-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Pawon Salam</p>
            <p className="text-base tracking-[0.3em] uppercase text-orange-600 opacity-90 font-medium mt-1">Resto & Catering</p>
        </div>
    </div>
);

// --- HELPER COMPONENTS ---

const SlipRow: React.FC<{ label: string; value: string | number; valuePrefix?: string, isBold?: boolean, rightAlign?: boolean, disableMono?: boolean }> = ({ label, value, valuePrefix, isBold = false, rightAlign = true, disableMono = false }) => (
    <div className={`flex items-start ${isBold ? 'font-bold' : ''}`}>
        <div className="w-1/2">{label}</div>
        <div className="w-auto pr-4">:</div>
        <div className={`flex-1 ${rightAlign ? 'text-right' : 'text-left'} ${(!disableMono && rightAlign) ? 'font-mono tabular-nums' : ''}`}>{valuePrefix}{value}</div>
    </div>
);

const SlipSeparator: React.FC<{ symbol: string }> = ({ symbol }) => (
    <div className="flex items-center">
        <div className="w-1/2"></div>
        <div className="w-auto pr-4 invisible">:</div>
        <div className="flex-1 flex items-center text-right">
            <div className="flex-grow border-b border-gray-800"></div>
            <span className="ml-2 w-4 font-bold text-lg">{symbol}</span>
        </div>
    </div>
);

const SlipSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
        <p className="font-bold tracking-wide">{title}</p>
        <div className="mt-2 space-y-1 text-sm">
            {children}
        </div>
    </div>
);

// UPDATED PAYROLL INPUT: Handles 0 value and updated styling
const PayrollInput: React.FC<{
    label: string;
    id: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: 'text' | 'number';
    placeholder?: string;
    isCurrency?: boolean;
}> = ({ label, id, name, value, onChange, type = 'text', placeholder = '', isCurrency = false }) => (
    <div className="flex flex-col group">
        <label htmlFor={id} className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-orange-500">
            {label}
        </label>
        <div className="relative">
            {isCurrency && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm font-medium transition-colors group-focus-within:text-orange-600">
                    Rp
                </span>
            )}
            <input
                id={id}
                name={name}
                type={type}
                // LOGIC FIX: Show empty string if value is 0 (unless user specifically typed 0, but here we want to clear default 0s)
                value={value === 0 ? '' : value}
                onChange={onChange}
                placeholder={placeholder || (type === 'number' ? '0' : '')}
                inputMode={type === 'number' ? 'numeric' : 'text'}
                className={`w-full px-3.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 font-semibold text-slate-800 placeholder-slate-300 shadow-sm ${isCurrency ? 'pl-11 font-mono tracking-tight' : ''}`}
            />
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const PayslipGeneratorScreen: React.FC<Props> = ({ onBack }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { employees, fetchEmployees } = useEmployeeStore();
    const { fetchHistory, history } = useAttendanceStore();

    // Persistent Store
    const { formData, setFormData, resetForm } = usePayslipFormStore();

    // State for the date picker
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showSlip, setShowSlip] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        if (employees.length === 0) {
            fetchEmployees();
        }
    }, [employees.length, fetchEmployees]);

    // Update formData.month when selectedDate changes
    useEffect(() => {
        const formattedMonth = selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
        setFormData({ month: formattedMonth });
    }, [selectedDate, setFormData]);

    // WORKFLOW #1: Auto-Calculate Attendance
    useEffect(() => {
        if (formData.nik && history.length > 0) {
            const monthIndex = selectedDate.getMonth();
            const year = selectedDate.getFullYear();

            const monthlyLogs = history.filter(log => {
                const logDate = new Date(log.date);
                return logDate.getMonth() === monthIndex && logDate.getFullYear() === year;
            });

            // Count Present or Late
            const daysWorked = monthlyLogs.filter(l => l.status === 'PRESENT' || l.status === 'LATE').length;

            // Calculate Overtime (Mock logic: > 9 hours = overtime)
            let overtimeHours = 0;
            monthlyLogs.forEach(log => {
                if (log.checkInTime && log.checkOutTime) {
                    const start = new Date(log.checkInTime).getTime();
                    const end = new Date(log.checkOutTime).getTime();
                    const hours = (end - start) / (1000 * 60 * 60);
                    if (hours > 9) overtimeHours += Math.floor(hours - 9);
                }
            });

            // Auto-update form logic (only overwrites if user hasn't manually edited maybe? For now simple overwrite)
            // Ideally we should check if isDirty, but for generator, auto-fill is usually preferred.
            setFormData({
                attendanceDays: daysWorked,
                overtime: overtimeHours * 20000 // Rate: 20k/hour
            });
        }
    }, [history, selectedDate, formData.nik, setFormData]);

    const handleReset = () => {
        if (window.confirm("Reset formulir? Data yang belum disimpan akan hilang.")) {
            resetForm();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
        });
    };

    // Categorize Employees
    const { managementEmployees, staffEmployees } = useMemo(() => {
        const management: Employee[] = [];
        const staff: Employee[] = [];

        employees.forEach(emp => {
            if (emp.isActive === false) return; // Skip inactive employees

            if ([UserRole.HR_MANAGER, UserRole.RESTAURANT_MANAGER, UserRole.FINANCE_MANAGER, UserRole.MARKETING_MANAGER, UserRole.BUSINESS_OWNER, UserRole.SUPER_ADMIN].includes(emp.role)) {
                management.push(emp);
            } else {
                staff.push(emp);
            }
        });

        return { managementEmployees: management, staffEmployees: staff };
    }, [employees]);

    const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const empId = e.target.value;
        const employee = employees.find(emp => emp.id === empId);

        if (employee) {
            // Trigger Workflow #1
            fetchHistory(employee.id);

            // Infer Department and Status
            let department = 'Operasional';
            let status = 'Karyawan Tetap';

            if ([UserRole.HR_MANAGER, UserRole.RESTAURANT_MANAGER, UserRole.FINANCE_MANAGER, UserRole.MARKETING_MANAGER, UserRole.BUSINESS_OWNER, UserRole.SUPER_ADMIN].includes(employee.role)) {
                status = 'Management';
                if (employee.role === UserRole.HR_MANAGER) department = 'Human Resources';
                if (employee.role === UserRole.FINANCE_MANAGER) department = 'Finance & Accounting';
                if (employee.role === UserRole.MARKETING_MANAGER) department = 'Marketing & Sales';
                if (employee.role === UserRole.RESTAURANT_MANAGER) department = 'Restaurant Manager';
            } else {
                if (employee.area === EmployeeArea.BOH) department = 'Kitchen (BOH)';
                if (employee.area === EmployeeArea.FOH) department = 'Service (FOH)';
                if (employee.area === EmployeeArea.MANAGEMENT) department = 'Management';
            }

            setFormData({
                employeeName: employee.name,
                nik: employee.id || 'N/A',
                position: getRoleDisplayName(employee.role, employee.area),
                department: department,
                status: status,
            });
        }
    };

    const getRoleDisplayName = (role: UserRole, area: EmployeeArea) => {
        switch (role) {
            case UserRole.RESTAURANT_MANAGER: return 'Restaurant Manager';
            case UserRole.HR_MANAGER: return 'HR Manager';
            case UserRole.FINANCE_MANAGER: return 'Finance Manager';
            case UserRole.MARKETING_MANAGER: return 'Marketing Manager';
            case UserRole.BUSINESS_OWNER: return 'Business Owner';
            case UserRole.SUPER_ADMIN: return 'Super Admin';
            case UserRole.ADMIN: return 'Administrator';
            case UserRole.EMPLOYEE:
                if (area === EmployeeArea.BOH) return 'Kitchen Staff';
                if (area === EmployeeArea.FOH) return 'Service Staff';
                return 'Staff';
            default: return 'Staff';
        }
    };

    const formatNumber = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateGross = (): number => {
        return formData.basicSalary + formData.allowances + formData.positionAllowance + formData.overtime;
    };

    const calculateTotalDeductions = (): number => {
        return formData.tax + formData.otherDeductions;
    };

    const calculateNet = (): number => {
        return calculateGross() - calculateTotalDeductions();
    };

    const handlePrint = async () => {
        setIsPrinting(true);
        // Small delay to allow react to render if needed, essentially just window.print() 
        // OR using PDF generation libs if required. Window print is safer for precise CSS layout.
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    const handleGenerate = () => {
        setShowSlip(true);
    };

    return (
        <div className="fixed inset-0 bg-slate-50 flex flex-col w-full h-full overflow-hidden font-sans">
            <style>
                {`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    /* Hide everything by default */
                    body > * { visibility: hidden; }
                    /* Only show the print container */
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
                }
                `}
            </style>

            {!showSlip ? (
                // === FORM VIEW: PAWON PROTOCOL LAYOUT ===
                <>
                    {/* 1. Header (Fixed Height) */}
                    <header className="shrink-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div className="flex flex-col items-center">
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Slip Gaji</h1>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Pawon Salam Finance</p>
                        </div>

                        <button
                            onClick={handleReset}
                            className="w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all active:scale-95 border border-rose-100"
                            title="Reset Form"
                        >
                            <Trash2 size={18} />
                        </button>
                    </header>

                    {/* 2. Content (Scrollable Middle) */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
                        <div className="max-w-2xl mx-auto space-y-8">

                            {/* Section: Data Karyawan */}
                            <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Data Karyawan</h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Month Picker */}
                                    <div className="flex flex-col">
                                        <label className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode Gaji</label>
                                        <GlassDatePicker
                                            selectedDate={selectedDate}
                                            onChange={setSelectedDate}
                                            mode="month-year"
                                            theme="light"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Name Dropdown */}
                                    <div className="flex flex-col group">
                                        <label className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-orange-500">Nama Karyawan</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-3.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 font-semibold text-slate-800 appearance-none shadow-sm cursor-pointer"
                                                onChange={handleEmployeeSelect}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Pilih Nama Karyawan...</option>
                                                <optgroup label="MANAGEMENT">
                                                    {managementEmployees.map(emp => (
                                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="STAFF">
                                                    {staffEmployees.map(emp => (
                                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <PayrollInput label="NIK / ID" id="nik" name="nik" value={formData.nik} onChange={handleInputChange} />
                                        <PayrollInput label="Jabatan" id="position" name="position" value={formData.position} onChange={handleInputChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <PayrollInput label="Departemen" id="department" name="department" value={formData.department} onChange={handleInputChange} />
                                        <PayrollInput label="Status" id="status" name="status" value={formData.status} onChange={handleInputChange} />
                                    </div>

                                    <PayrollInput label="Jumlah Hari Masuk" id="attendanceDays" name="attendanceDays" type="number" value={formData.attendanceDays} onChange={handleInputChange} />
                                </div>
                            </section>

                            {/* Section: Pendapatan */}
                            <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Penerimaan</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PayrollInput label="Upah Pokok" id="basicSalary" name="basicSalary" type="number" value={formData.basicSalary} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Tunjangan Jabatan" id="positionAllowance" name="positionAllowance" type="number" value={formData.positionAllowance} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Lembur" id="overtime" name="overtime" type="number" value={formData.overtime} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Paket / Tunjangan Lain" id="allowances" name="allowances" type="number" value={formData.allowances} onChange={handleInputChange} isCurrency />
                                </div>
                            </section>

                            {/* Section: Potongan */}
                            <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Potongan</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PayrollInput label="Pajak PPh 21" id="tax" name="tax" type="number" value={formData.tax} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Lain-lain / Kasbon" id="otherDeductions" name="otherDeductions" type="number" value={formData.otherDeductions} onChange={handleInputChange} isCurrency />
                                </div>
                            </section>

                        </div>
                    </main>

                    {/* 3. Footer (Fixed Bottom) */}
                    <footer className="shrink-0 z-30 bg-white border-t border-slate-200 p-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        <div className="max-w-2xl mx-auto flex gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Total Salary</p>
                                <p className="text-xl font-bold text-slate-800 tracking-tight">Rp {formatNumber(calculateNet())}</p>
                            </div>
                            <button
                                onClick={handleGenerate}
                                className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98] rounded-xl font-bold tracking-wide text-white py-3.5 px-8 transition-all transform focus:outline-none focus:ring-4 focus:ring-orange-300 flex items-center justify-center gap-2"
                            >
                                Generate Slip <ArrowLeft size={16} className="rotate-180" />
                            </button>
                        </div>
                    </footer>
                </>
            ) : (
                // === PREVIEW VIEW (Full Screen Overlay) ===
                <div className="relative w-full h-full bg-slate-800 overflow-y-auto">
                    {/* Sticky Top Bar for Preview */}
                    <div className="sticky top-0 left-0 right-0 z-[50] p-4 bg-slate-900/90 backdrop-blur-md flex items-center justify-between border-b border-white/10 print:hidden">
                        <button
                            onClick={() => setShowSlip(false)}
                            className="flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                        >
                            <ArrowLeft size={18} />
                            Edit Data
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-white text-slate-900 hover:bg-orange-50 font-bold py-2 px-4 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
                        >
                            {isPrinting ? 'Printing...' : <><Printer size={18} /> Print PDF</>}
                        </button>
                    </div>

                    {/* The Slip Paper */}
                    <div className="p-4 md:p-10 min-h-full flex justify-center items-start print:p-0 print:m-0">
                        <div
                            id="print-area"
                            ref={printRef}
                            className="bg-white rounded-none md:rounded-xl shadow-2xl overflow-hidden relative font-serif text-gray-800 print:w-full print:max-w-none print:h-full print:bg-white print:shadow-none print:rounded-none print:m-0 print:overflow-visible w-[210mm] min-h-[297mm] mx-auto scale-[0.8] origin-top md:scale-100"
                        >
                            <SlipMotifTopLeft />
                            <SlipMotifTopRight />
                            <SlipMotifBottomLeft />
                            <SlipMotifBottomRight />

                            {/* Header Area */}
                            <div className="relative z-20 print:static print:p-8 p-12">
                                <header className="text-center">
                                    <div className="flex justify-start print:ml-4">
                                        <SlipLogo />
                                    </div>
                                    <div className="text-right absolute top-8 right-8">
                                        <h1 className="text-2xl font-bold text-orange-600 uppercase tracking-widest mb-1">SLIP GAJI</h1>
                                        <p className="text-sm font-bold text-gray-600">Periode: {formData.month}</p>
                                        <p className="text-xs text-gray-400">No: PS/{new Date().getFullYear()}/{new Date().getMonth() + 1}/001</p>
                                    </div>
                                </header>
                            </div>

                            {/* Content Area */}
                            <div className="px-16 pt-4 pb-32 md:px-24 md:pt-6 md:pb-44 print:static print:px-16 print:pt-4 print:pb-16 relative z-10 flex flex-col justify-between h-auto min-h-[600px]">

                                {/* Employee Info Grid */}
                                <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-8 text-sm border-t-2 border-orange-600 pt-6">
                                    <SlipRow label="Nama" value={formData.employeeName} disableMono={true} />
                                    <SlipRow label="NIK / ID" value={formData.nik} disableMono={true} />
                                    <SlipRow label="Jabatan" value={formData.position} disableMono={true} />
                                    <SlipRow label="Status" value={formData.status} disableMono={true} />
                                    <SlipRow label="Departemen" value={formData.department} disableMono={true} />
                                    <SlipRow label="Grade / Gol" value="-" disableMono={true} />
                                </div>

                                <div className="grid grid-cols-2 gap-8 items-start">
                                    {/* LEFT COLUMN: PENERIMAAN */}
                                    <div>
                                        <div className="bg-orange-600 text-white font-bold text-xs uppercase tracking-wider py-1.5 px-3 mb-4 rounded-sm">
                                            PENERIMAAN
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <SlipRow label="Gaji Pokok" value={formatNumber(formData.basicSalary)} rightAlign={true} />
                                            <SlipRow label="Tunjangan Jabatan" value={formatNumber(formData.positionAllowance)} rightAlign={true} />
                                            <SlipRow label="Uang Makan" value={formatNumber(0)} rightAlign={true} />
                                            <SlipRow label="Lembur" value={formatNumber(formData.overtime)} rightAlign={true} />
                                            <SlipRow label="Paket" value={formatNumber(formData.allowances)} rightAlign={true} />

                                            <div className="mt-4 pt-2 border-t border-gray-200 bg-gray-50 p-2 rounded">
                                                <div className="flex items-start font-bold text-green-700">
                                                    <div className="w-1/2">Total Penerimaan</div>
                                                    <div className="w-auto pr-4">:</div>
                                                    <div className="flex-1 text-right font-mono tracking-tight">Rp {formatNumber(calculateGross())}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT COLUMN: POTONGAN */}
                                    <div>
                                        <div className="bg-orange-800 text-white font-bold text-xs uppercase tracking-wider py-1.5 px-3 mb-4 rounded-sm">
                                            POTONGAN
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <SlipRow label="PPh 21" value={formatNumber(formData.tax)} rightAlign={true} />
                                            <SlipRow label="BPJS Kesehatan" value={formatNumber(0)} rightAlign={true} />
                                            <SlipRow label="Lain-lain" value={formatNumber(formData.otherDeductions)} rightAlign={true} />

                                            <div className="mt-4 pt-2 border-t border-gray-200 bg-gray-50 p-2 rounded">
                                                <div className="flex items-start font-bold text-red-600">
                                                    <div className="w-1/2">Total Potongan</div>
                                                    <div className="w-auto pr-4">:</div>
                                                    <div className="flex-1 text-right font-mono tracking-tight">Rp {formatNumber(calculateTotalDeductions())}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TAKE HOME PAY */}
                                <div className="mt-8 flex items-stretch">
                                    <div className="bg-orange-600 text-white font-bold text-sm uppercase tracking-wider py-3 px-6 flex items-center w-1/3">
                                        TAKE HOME PAY
                                    </div>
                                    <div className="bg-orange-50 border border-orange-100 flex-1 flex items-center justify-end px-6 py-3">
                                        <span className="text-2xl font-bold text-orange-600 font-mono tracking-tight">Rp {formatNumber(calculateNet())}</span>
                                    </div>
                                </div>

                                {/* SIGNATURES */}
                                <div className="mt-16 grid grid-cols-2 gap-12 text-center text-xs">
                                    <div>
                                        <p className="mb-16 font-medium">Disetujui Oleh,</p>
                                        <div className="border-t border-gray-300 w-2/3 mx-auto pt-2">
                                            <p className="font-bold">HRD Manager</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-16 font-medium">Diterima Oleh,</p>
                                        <div className="border-t border-gray-300 w-2/3 mx-auto pt-2">
                                            <p className="font-bold">{formData.employeeName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER TRANSFER INFO */}
                                <div className="mt-auto pt-8">
                                    <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Ditransfer Ke:</div>
                                    <div className="border border-gray-200 rounded p-3 text-xs w-64">
                                        <p className="font-bold text-gray-800">BCA (Bank Central Asia)</p>
                                        <p className="font-mono my-1">123-456-7890</p>
                                        <p className="text-gray-500 uppercase">A.N. {formData.employeeName || 'NAMA PENERIMA'}</p>
                                    </div>
                                    <div className="mt-4 text-center text-[10px] text-gray-400">
                                        Dicetak secara otomatis oleh sistem Pawon Salam Payroll
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
