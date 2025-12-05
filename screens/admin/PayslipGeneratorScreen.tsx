import React, { useState, useRef, useEffect, useMemo } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ArrowLeft, ChevronDown, Trash2 } from 'lucide-react';
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

// --- VISUAL COMPONENTS (Copied from CreatePayslip) ---

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
        <label htmlFor={id} className="mb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider transition-colors group-focus-within:text-orange-500">
            {label}
        </label>
        <div className="relative">
            {isCurrency && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm font-medium transition-colors group-focus-within:text-orange-500">
                    Rp
                </span>
            )}
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                inputMode={type === 'number' ? 'numeric' : 'text'}
                className={`w-full px-3 py-2.5 text-sm bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 font-semibold text-gray-800 placeholder-gray-300 ${isCurrency ? 'pl-10 font-mono tracking-tight' : ''}`}
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

            // Auto-update form
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
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
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
                if (employee.role === UserRole.RESTAURANT_MANAGER) department = 'Restaurant Management';
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

    const handlePrint = () => {
        window.print();
    };

    const handleGenerate = () => {
        setShowSlip(true);
    };

    return (
        <div className="min-h-screen bg-orange-50 font-sans print:p-0 print:m-0 print:bg-white">
            {!showSlip ? (
                // FORM VIEW - 3 Part Layout
                <div className="flex flex-col h-screen max-w-md mx-auto bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.05)] rounded-2xl border border-white/20 md:max-w-4xl md:h-auto md:min-h-screen md:my-8 overflow-hidden">

                    {/* 1. STATIC HEADER */}
                    <div className="flex-none p-6 border-b border-gray-100/50 bg-white/50 backdrop-blur-sm z-10 relative">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={onBack} className="text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1 text-sm font-medium">
                                <ArrowLeft size={16} /> Kembali
                            </button>
                            <button
                                onClick={handleReset}
                                className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={12} /> Reset Form
                            </button>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 text-orange-600 flex-shrink-0">
                                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                    <circle cx="50" cy="50" r="44" />
                                    <path d="M28 72 Q 28 28 72 28 Q 72 72 28 72 Z" />
                                    <line x1="28" y1="72" x2="72" y2="28" />
                                    <line x1="28" y1="72" x2="19" y2="81" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Slip Gaji</h1>
                                <div className="text-gray-600">
                                    <p className="font-bold text-lg text-gray-800">Pawon Salam</p>
                                    <p className="text-sm text-gray-500">Resto & Catering</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. SCROLLABLE CONTENT */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white/30 scrollbar-thin">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Data Penerima</h3>
                                <div className="space-y-4">
                                    <div className="flex flex-col group">
                                        <label className="mb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider transition-colors group-focus-within:text-orange-500">Periode Gaji (Bulan & Tahun)</label>
                                        <GlassDatePicker
                                            selectedDate={selectedDate}
                                            onChange={setSelectedDate}
                                            mode="month-year"
                                            theme="light"
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Employee Select with Optgroups */}
                                        <div className="flex flex-col group">
                                            <label className="mb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider transition-colors group-focus-within:text-orange-500">Nama</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 font-semibold text-gray-800 appearance-none"
                                                    onChange={handleEmployeeSelect}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Pilih Nama...</option>
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
                                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                                    <ChevronDown size={16} />
                                                </div>
                                            </div>
                                        </div>
                                        <PayrollInput label="NIK (Auto)" id="nik" name="nik" value={formData.nik} onChange={handleInputChange} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <PayrollInput label="Jabatan (Auto)" id="position" name="position" value={formData.position} onChange={handleInputChange} />
                                        <PayrollInput label="Departemen (Auto)" id="department" name="department" value={formData.department} onChange={handleInputChange} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <PayrollInput label="Status (Auto)" id="status" name="status" value={formData.status} onChange={handleInputChange} />
                                        <PayrollInput label="Jumlah Hari Masuk" id="attendanceDays" name="attendanceDays" type="number" value={formData.attendanceDays} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-t border-gray-100 pt-6">Penerimaan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PayrollInput label="Upah Pokok" id="basicSalary" name="basicSalary" type="number" value={formData.basicSalary} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Tunjangan Jabatan" id="positionAllowance" name="positionAllowance" type="number" value={formData.positionAllowance} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Lembur" id="overtime" name="overtime" type="number" value={formData.overtime} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Paket" id="allowances" name="allowances" type="number" value={formData.allowances} onChange={handleInputChange} isCurrency />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-t border-gray-100 pt-6">Potongan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PayrollInput label="Pajak" id="tax" name="tax" type="number" value={formData.tax} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Lain-lain" id="otherDeductions" name="otherDeductions" type="number" value={formData.otherDeductions} onChange={handleInputChange} isCurrency />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. STATIC FOOTER */}
                    <div className="flex-none p-6 bg-white/80 backdrop-blur-md border-t border-gray-100/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                        <button
                            onClick={handleGenerate}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98] rounded-xl font-bold tracking-wide text-white py-3.5 px-6 transition-all transform focus:outline-none focus:ring-4 focus:ring-orange-300 flex items-center justify-center gap-2"
                        >
                            🎯 Generate Slip Gaji
                        </button>
                    </div>
                </div>
            ) : (
                // PREVIEW VIEW
                <div className="max-w-4xl mx-auto p-4 md:p-8 animate-slide-in-down">
                    <div className="mb-6 flex justify-between items-center print:hidden">
                        <button
                            onClick={() => setShowSlip(false)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Kembali ke Edit
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={handlePrint}
                                className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl transition-transform transform hover:scale-105 duration-300 shadow-lg flex items-center gap-2"
                            >
                                🖨️ Cetak / Simpan PDF
                            </button>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
                        <div
                            ref={printRef}
                            className="bg-white rounded-xl shadow-2xl overflow-hidden relative font-serif text-gray-800 print:static print:w-full print:max-w-none print:h-auto print:bg-white print:shadow-none print:rounded-none print:m-0 print:overflow-visible w-[210mm] min-h-[297mm] mx-auto"
                        >
                            <SlipMotifTopLeft />
                            <SlipMotifTopRight />
                            <SlipMotifBottomLeft />
                            <SlipMotifBottomRight />

                            {/* Header Area */}
                            <div className="relative z-20 print:static print:p-8 p-8">
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
                            <div className="px-16 pt-4 pb-32 md:px-32 md:pt-10 md:pb-44 print:static print:px-16 print:pt-4 print:pb-16 relative z-10 flex flex-col justify-between h-full">

                                {/* Employee Info Grid */}
                                <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-8 text-sm border-t-2 border-orange-600 pt-6">
                                    <SlipRow label="Nama" value={formData.employeeName} disableMono={true} />
                                    <SlipRow label="NIK / ID" value={formData.nik} disableMono={true} />
                                    <SlipRow label="Jabatan" value={formData.position} disableMono={true} />
                                    <SlipRow label="Status" value={formData.status} disableMono={true} />
                                    <SlipRow label="Departemen" value={formData.department} disableMono={true} />
                                    <SlipRow label="Grade / Gol" value="-" disableMono={true} />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
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
