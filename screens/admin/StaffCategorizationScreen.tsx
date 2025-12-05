import React, { useState } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { Employee, EmploymentCategory, UserRole, EmployeeArea } from '../../types';
import { Users, ArrowRight, Save, AlertTriangle, CheckCircle, MoreVertical, Ban, RefreshCw, X } from 'lucide-react';

interface Props {
    onBack?: () => void;
}

const StaffCategorizationScreen: React.FC<Props> = ({ onBack }) => {
    const { employees, updateEmployee } = useEmployeeStore();
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [newCategory, setNewCategory] = useState<EmploymentCategory | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterDept, setFilterDept] = useState<string>('ALL');
    const [showInactive, setShowInactive] = useState(false);

    // Filter logic
    const staffList = employees.filter(e => {
        // EXCLUDE OWNER & SUPER ADMIN
        if (e.role === UserRole.BUSINESS_OWNER || e.role === UserRole.SUPER_ADMIN) {
            return false;
        }

        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.id.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesCategory = true;
        switch (filterDept) {
            case 'ALL':
                matchesCategory = true;
                break;
            case 'FOH':
                matchesCategory = e.area === EmployeeArea.FOH;
                break;
            case 'BOH':
                matchesCategory = e.area === EmployeeArea.BOH;
                break;
            case 'MANAGEMENT':
                matchesCategory = [
                    UserRole.RESTAURANT_MANAGER,
                    UserRole.HR_MANAGER,
                    UserRole.FINANCE_MANAGER,
                    UserRole.MARKETING_MANAGER,
                    UserRole.ADMIN
                ].includes(e.role);
                break;
            default:
                matchesCategory = true;
        }

        const matchesActive = showInactive ? true : e.isActive !== false; // Default true if undefined

        return matchesSearch && matchesCategory && matchesActive;
    });

    const getCategoryColor = (cat: EmploymentCategory) => {
        switch (cat) {
            case EmploymentCategory.PERMANENT: return 'bg-blue-100 text-blue-800 border-blue-200';
            case EmploymentCategory.PROBATION: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case EmploymentCategory.DAILY_WORKER: return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    const getCategoryLabel = (cat: EmploymentCategory) => {
        switch (cat) {
            case EmploymentCategory.PERMANENT: return 'Karyawan Tetap';
            case EmploymentCategory.PROBATION: return 'Masa Percobaan';
            case EmploymentCategory.DAILY_WORKER: return 'Harian (Daily Worker)';
            default: return cat;
        }
    };

    const handlePromote = async () => {
        if (!selectedEmployee || !newCategory) return;

        setIsProcessing(true);

        const generateNewId = (category: EmploymentCategory, area: EmployeeArea, oldId: string) => {
            const parts = oldId.split('-');
            if (parts.length >= 3) {
                const seqPart = parts[parts.length - 1]; // Last part is sequence

                let prefix = 'EMP';
                if (category === EmploymentCategory.PROBATION) prefix = 'PRO';
                if (category === EmploymentCategory.DAILY_WORKER) prefix = 'DW';

                let deptCode = 'MGT';
                if (selectedEmployee.area === EmployeeArea.FOH) deptCode = 'FOH';
                if (selectedEmployee.area === EmployeeArea.BOH) deptCode = 'BOH';

                // Maintain year if present
                const year = new Date().getFullYear().toString().slice(-2);

                // Simple reconstruction based on new logic
                return `${prefix}-${deptCode}-${year}${seqPart.slice(-3)}`;
            }
            return oldId;
        };

        const newId = generateNewId(newCategory, selectedEmployee.area, selectedEmployee.id);

        const success = await updateEmployee(selectedEmployee.id, {
            category: newCategory,
            id: newId
        });

        if (success) {
            setSuccessMessage(`Berhasil mengubah status ${selectedEmployee.name} menjadi ${getCategoryLabel(newCategory)}. ID Baru: ${newId}`);
            setTimeout(() => {
                setSuccessMessage(null);
                setSelectedEmployee(null);
                setNewCategory(null);
            }, 3000);
        }

        setIsProcessing(false);
    };

    const handleToggleStatus = async (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        const currentStatus = employee.isActive !== false;
        const newStatus = !currentStatus;

        // Prevent disabling Owner/Super Admin easily
        if (!newStatus && (employee.role === UserRole.BUSINESS_OWNER || employee.role === UserRole.SUPER_ADMIN)) {
            if (!window.confirm("PERHATIAN: Anda akan menonaktifkan akun Owner/Admin Sistem. Anda yakin?")) {
                return;
            }
        }

        setIsProcessing(true);
        const success = await updateEmployee(employee.id, {
            isActive: newStatus,
            // Clear reason/date if activating, set generic if deactivating
            deactivationDate: newStatus ? undefined : new Date().toISOString().split('T')[0],
            deactivationReason: newStatus ? undefined : 'Manually Deactivated by HR'
        });

        if (success) {
            setSuccessMessage(`Akses pengguna ${employee.name} berhasil ${newStatus ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}.`);
            setTimeout(() => setSuccessMessage(null), 2000);
        }
        setIsProcessing(false);
    };

    return (
        <div className="p-6 pb-24 space-y-6 min-h-screen bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                            <ArrowRight size={20} className="text-gray-600 rotate-180" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Database User</h1>
                        <p className="text-gray-500">Kelola akses, status aktif, dan data pengguna</p>
                    </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari Nama / ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white w-full md:w-64"
                        />
                        <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                        <option value="ALL">Semua User</option>
                        <option value="FOH">Front of House</option>
                        <option value="BOH">Back of House</option>
                        <option value="MANAGEMENT">Management</option>
                    </select>

                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Tampilkan Non-Aktif
                    </label>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 sticky top-6 z-20 shadow-md">
                    <CheckCircle className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employee List */}
                <div className="lg:col-span-2 space-y-4">
                    {staffList.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Tidak ada user ditemukan</p>
                        </div>
                    ) : (
                        staffList.map((employee) => {
                            const isUserActive = employee.isActive !== false;
                            return (
                                <div
                                    key={employee.id}
                                    onClick={() => {
                                        setSelectedEmployee(employee);
                                        setNewCategory(employee.category);
                                    }}
                                    className={`bg-white p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${selectedEmployee?.id === employee.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 shadow-sm'} ${!isUserActive ? 'opacity-75 bg-gray-50' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden relative">
                                                <img src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.name}`} alt={employee.name} className={`w-full h-full object-cover ${!isUserActive ? 'grayscale' : ''}`} />
                                                {!isUserActive && (
                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                        <Ban className="text-white w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    {employee.name}
                                                    {!isUserActive && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wide">Non-Aktif</span>}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{employee.id}</span>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[150px]">{employee.department}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* TOGGLE SWITCH CAPSULE */}
                                        <div className="flex flex-col items-end gap-2">
                                            <div
                                                onClick={(e) => handleToggleStatus(e, employee)}
                                                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ease-in-out cursor-pointer flex items-center px-1 ${isUserActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                                title={isUserActive ? "Klik untuk Nonaktifkan" : "Klik untuk Aktifkan"}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${isUserActive ? 'translate-x-7' : 'translate-x-0'}`} />
                                                <span className={`absolute text-[9px] font-bold text-white ${isUserActive ? 'left-2' : 'right-2'}`}>
                                                    {isUserActive ? 'ON' : 'OFF'}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getCategoryColor(employee.category)}`}>
                                                {getCategoryLabel(employee.category)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Action Panel */}
                <div className="lg:col-span-1">
                    {selectedEmployee ? (
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Status User</h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Status & Kategori</label>
                                    <div className="font-medium text-gray-900 mt-1">{getCategoryLabel(selectedEmployee.category)}</div>
                                    <div className="text-xs text-gray-400 mt-1">ID: {selectedEmployee.id}</div>
                                    <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-bold ${selectedEmployee.isActive !== false ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {selectedEmployee.isActive !== false ? '✅ User Aktif' : '⛔ User Non-Aktif'}
                                    </div>
                                </div>

                                {/* ONLY SHOW CATEGORY CHANGE IF ACTIVE */}
                                {selectedEmployee.isActive !== false ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Promosi / Mutasi Kategori</label>
                                        <div className="space-y-2">
                                            {[EmploymentCategory.DAILY_WORKER, EmploymentCategory.PROBATION, EmploymentCategory.PERMANENT].map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setNewCategory(cat)}
                                                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${newCategory === cat ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                                                >
                                                    <span className="text-sm font-medium">{getCategoryLabel(cat)}</span>
                                                    {newCategory === cat && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                                </button>
                                            ))}
                                        </div>

                                        {newCategory && newCategory !== selectedEmployee.category && (
                                            <>
                                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                                                    <div className="text-xs text-yellow-700">
                                                        <span className="font-bold">Perhatian:</span> ID Baru akan digenerate otomatis.
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handlePromote}
                                                    disabled={isProcessing}
                                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
                                                >
                                                    {isProcessing ? 'Menyimpan...' : (
                                                        <>
                                                            <Save className="w-4 h-4" />
                                                            Simpan Status Baru
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                                        <Ban className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-red-800">Akun Dibekukan</p>
                                        <p className="text-xs text-red-600 mt-1">User ini tidak dapat diakses atau diedit sampai diaktifkan kembali menggunakan toggle di daftar.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Pilih user dari daftar untuk melihat detail.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffCategorizationScreen;
