import React, { useState } from 'react';
import {
    ArrowRight, Users, Filter, Search, Ban, CheckCircle,
    AlertTriangle, Save, ChevronDown
} from 'lucide-react';
import { useEmployeeStore } from '../../store/employeeStore';
import { Employee, EmploymentCategory, UserRole, EmployeeArea } from '../../types';
import { UserRowV2 } from './UserRowV2';

// --- HEADER V2 ---
// --- HEADER V2 (Redesigned) ---
const UserManagementHeaderV2 = ({
    onBack,
    userCount,
    searchQuery,
    setSearchQuery,
    filterDept,
    setFilterDept,
    showInactive,
    setShowInactive
}: any) => {

    // Helper to get display label for the dropdown
    const getFilterLabel = () => {
        switch (filterDept) {
            case 'FOH': return 'Front of House';
            case 'BOH': return 'Back of House';
            case 'MANAGEMENT': return 'Management';
            default: return 'All Divisions';
        }
    };

    return (
        <header className="sticky top-0 z-30 px-4 py-4 bg-white/80 backdrop-blur-2xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
            <div className="max-w-7xl mx-auto w-full">

                {/* Top Row: Title */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
                                    <ArrowRight size={20} className="rotate-180" />
                                </button>
                            )}
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">User Management</h1>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1 pl-1 md:pl-0">
                            {userCount} Registered Users • Master Data
                        </p>
                    </div>
                </div>

                {/* Control Deck (Search + Filters) */}
                <div className="flex flex-col gap-4">

                    {/* 1. Search Bar (Full Width & Floating) */}
                    <div className="relative group w-full">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search employee by name or ID..."
                            className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm focus-within:shadow-md focus-within:border-indigo-300 ring-1 ring-slate-200/50 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl transition-all text-sm font-medium placeholder:text-slate-400"
                        />
                    </div>

                    {/* 2. Filter Twins (50% - 50% Grid on Mobile) */}
                    <div className="grid grid-cols-2 gap-3 w-full">

                        {/* Division Dropdown (Trick: Native select hidden over custom UI) */}
                        <div className="relative">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-all active:scale-[0.98] h-full cursor-pointer">
                                <span className="text-xs font-semibold text-slate-600 truncate">{getFilterLabel()}</span>
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                            </div>
                            <select
                                value={filterDept}
                                onChange={(e) => setFilterDept(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            >
                                <option value="ALL">All Divisions</option>
                                <option value="FOH">Front of House</option>
                                <option value="BOH">Back of House</option>
                                <option value="MANAGEMENT">Management</option>
                            </select>
                        </div>

                        {/* Inactive Toggle (Button Style Pill) */}
                        <button
                            onClick={() => setShowInactive(!showInactive)}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl shadow-sm transition-all active:scale-[0.98] h-full ${showInactive
                                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full shrink-0 ${showInactive ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
                            <span className="text-xs font-semibold truncate">
                                {showInactive ? 'Hide Inactive' : 'Show Inactive'}
                            </span>
                        </button>

                    </div>
                </div>
            </div>
        </header>
    );
};

// --- USER LIST V2 WRAPPER ---
const UserListV2 = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {children}
    </div>
);

// --- MAIN SCREEN ---
const StaffCategorizationScreen = ({ onBack }: { onBack?: () => void }) => {
    const { employees, updateEmployee } = useEmployeeStore();
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [newCategory, setNewCategory] = useState<EmploymentCategory | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterDept, setFilterDept] = useState<string>('ALL');
    const [showInactive, setShowInactive] = useState(true);

    // Filter Logic
    const staffList = employees.filter(e => {
        if (e.role === UserRole.BUSINESS_OWNER || e.role === UserRole.SUPER_ADMIN) return false;

        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.id.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesCategory = true;
        switch (filterDept) {
            case 'ALL': matchesCategory = true; break;
            case 'FOH': matchesCategory = e.area === EmployeeArea.FOH; break;
            case 'BOH': matchesCategory = e.area === EmployeeArea.BOH; break;
            case 'MANAGEMENT': matchesCategory = [UserRole.RESTAURANT_MANAGER, UserRole.HR_MANAGER, UserRole.FINANCE_MANAGER, UserRole.MARKETING_MANAGER, UserRole.ADMIN].includes(e.role); break;
            default: matchesCategory = true;
        }

        const matchesActive = showInactive ? true : e.isActive !== false;
        return matchesSearch && matchesCategory && matchesActive;
    });

    const handleToggleStatus = async (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        const currentStatus = employee.isActive !== false;
        const newStatus = !currentStatus;

        setIsProcessing(true);
        const success = await updateEmployee(employee.id, {
            isActive: newStatus,
            deactivationDate: newStatus ? undefined : new Date().toISOString().split('T')[0],
            deactivationReason: newStatus ? undefined : 'Manually Deactivated by HR'
        });
        setIsProcessing(false);
    };

    const handlePromote = async () => {
        if (!selectedEmployee || !newCategory) return;
        setIsProcessing(true);

        const generateNewId = (category: EmploymentCategory, area: EmployeeArea, oldId: string) => {
            const parts = oldId.split('-');
            if (parts.length >= 3) {
                const seqPart = parts[parts.length - 1];
                let prefix = 'EMP';
                if (category === EmploymentCategory.PROBATION) prefix = 'PRO';
                if (category === EmploymentCategory.DAILY_WORKER) prefix = 'DW';
                let deptCode = 'MGT';
                if (selectedEmployee.area === EmployeeArea.FOH) deptCode = 'FOH';
                if (selectedEmployee.area === EmployeeArea.BOH) deptCode = 'BOH';
                const year = new Date().getFullYear().toString().slice(-2);
                return `${prefix}-${deptCode}-${year}${seqPart.slice(-3)}`;
            }
            return oldId;
        };

        const newId = generateNewId(newCategory, selectedEmployee.area, selectedEmployee.id);
        const success = await updateEmployee(selectedEmployee.id, { category: newCategory, id: newId });

        if (success) {
            setSuccessMessage(`ID UPDATED: ${newId}`);
            setTimeout(() => {
                setSuccessMessage(null);
                setSelectedEmployee(null);
                setNewCategory(null);
            }, 3000);
        }
        setIsProcessing(false);
    };

    const getCategoryLabel = (cat: EmploymentCategory) => {
        switch (cat) {
            case EmploymentCategory.PERMANENT: return 'Permanen';
            case EmploymentCategory.PROBATION: return 'Probation';
            case EmploymentCategory.DAILY_WORKER: return 'Daily Worker';
            default: return cat;
        }
    };

    return (
        <main className="w-full max-w-full min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900 pb-20">
            <UserManagementHeaderV2
                onBack={onBack}
                userCount={staffList.length}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterDept={filterDept}
                setFilterDept={setFilterDept}
                showInactive={showInactive}
                setShowInactive={setShowInactive}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-start">

                    {/* LEFT: LIST VIEW (Desktop: col-span-4 / Mobile: Full) */}
                    <section className={`md:col-span-12 lg:col-span-4 w-full ${selectedEmployee ? 'hidden md:block' : 'block'}`}>
                        <UserListV2>
                            {staffList.length === 0 ? (
                                <div className="text-center py-20 px-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">No Users Found</p>
                                </div>
                            ) : (
                                <div>
                                    {staffList.map((employee) => (
                                        <UserRowV2
                                            key={employee.id}
                                            employee={employee}
                                            isSelected={selectedEmployee?.id === employee.id}
                                            onSelect={() => {
                                                setSelectedEmployee(employee);
                                                setNewCategory(employee.category);
                                            }}
                                            onToggleStatus={handleToggleStatus}
                                        />
                                    ))}
                                </div>
                            )}
                        </UserListV2>
                    </section>

                    {/* RIGHT: DETAIL VIEW (Desktop: col-span-8 / Mobile: Full when selected) */}
                    <section className={`md:col-span-12 lg:col-span-8 w-full ${!selectedEmployee ? 'hidden md:block' : 'block'}`}>
                        {selectedEmployee ? (
                            <div className="sticky top-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {/* Mobile Header for Detail */}
                                <div className="md:hidden flex items-center gap-2 mb-4 bg-white/50 backdrop-blur p-3 rounded-lg border border-slate-200">
                                    <button
                                        onClick={() => setSelectedEmployee(null)}
                                        className="p-1 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300"
                                    >
                                        <ArrowRight size={16} className="rotate-180" />
                                    </button>
                                    <span className="font-bold text-sm text-slate-700 uppercase tracking-wide">Back to List</span>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/40">
                                    <div className="h-24 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                                        <div className="absolute -bottom-8 left-8">
                                            <div className="w-16 h-16 rounded-xl border-[4px] border-white shadow-lg overflow-hidden bg-white">
                                                <img
                                                    src={selectedEmployee.avatarUrl || `https://ui-avatars.com/api/?name=${selectedEmployee.name}`}
                                                    className={`w-full h-full object-cover ${selectedEmployee.isActive === false && 'grayscale'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10 px-8 pb-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900">{selectedEmployee.name}</h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase track-wide">{selectedEmployee.id}</span>
                                                    <span className="text-slate-400 text-xs font-medium">{selectedEmployee.department}</span>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${selectedEmployee.isActive !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {selectedEmployee.isActive !== false ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category Management</h3>
                                                <div className="space-y-2">
                                                    {[EmploymentCategory.DAILY_WORKER, EmploymentCategory.PROBATION, EmploymentCategory.PERMANENT].map((cat) => (
                                                        <button
                                                            key={cat}
                                                            disabled={selectedEmployee.category === cat || selectedEmployee.isActive === false}
                                                            onClick={() => setNewCategory(cat)}
                                                            className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-medium transition-all
                                                                ${newCategory === cat
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                                                }
                                                                ${selectedEmployee.category === cat ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}
                                                            `}
                                                        >
                                                            <span>{getCategoryLabel(cat)}</span>
                                                            {newCategory === cat && <CheckCircle size={14} className="text-blue-500" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {successMessage && (
                                                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {successMessage}
                                                </div>
                                            )}

                                            {selectedEmployee.isActive === false ? (
                                                <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-center">
                                                    <Ban className="w-6 h-6 text-red-400 mx-auto mb-2" />
                                                    <p className="text-red-800 font-bold text-xs uppercase">Account Frozen</p>
                                                </div>
                                            ) : (
                                                newCategory && newCategory !== selectedEmployee.category && (
                                                    <div className="space-y-3 pt-2">
                                                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-3 text-xs text-yellow-800">
                                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                                            <p>
                                                                System will generate a <strong>NEW ID</strong>. Ensure physical contract is updated.
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={handlePromote}
                                                            disabled={isProcessing}
                                                            className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            {isProcessing ? <span className="animate-pulse">PROCESSING...</span> : <><Save size={14} /> SAVE CHANGES</>}
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Empty State / Placeholder for Desktop
                            null

                        )}
                    </section>
                </div>
            </div>
        </main>
    );
};

export default StaffCategorizationScreen;
