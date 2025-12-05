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

    // Deactivation Modal State
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [deactivationReason, setDeactivationReason] = useState('');
    const [employeeToDeactivate, setEmployeeToDeactivate] = useState<Employee | null>(null);

    // Filter logic
    const staffList = employees.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.id.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesCategory = true;
        switch (filterDept) {
            case 'ALL':
                matchesCategory = true;
                break;
            case 'BUSINESS_OWNER':
                matchesCategory = e.role === UserRole.BUSINESS_OWNER;
                break;
            case 'SUPER_ADMIN':
                matchesCategory = e.role === UserRole.SUPER_ADMIN;
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

    const handleDeactivateClick = (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        setEmployeeToDeactivate(employee);
        setIsDeactivateModalOpen(true);
    };

    const handleConfirmDeactivate = async () => {
        if (!employeeToDeactivate) return;

        setIsProcessing(true);
        const success = await updateEmployee(employeeToDeactivate.id, {
            isActive: false,
            deactivationDate: new Date().toISOString().split('T')[0],
            deactivationReason: deactivationReason || 'Resign'
        });

        if (success) {
            setSuccessMessage(`Akun ${employeeToDeactivate.name} berhasil dinonaktifkan.`);
            setIsDeactivateModalOpen(false);
            setEmployeeToDeactivate(null);
            setDeactivationReason('');
            setTimeout(() => setSuccessMessage(null), 3000);
        }
        setIsProcessing(false);
    };

    const handleReactivate = async (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        if (!window.confirm(`Aktifkan kembali akun ${employee.name}?`)) return;

        setIsProcessing(true);
        const success = await updateEmployee(employee.id, {
            isActive: true,
            deactivationDate: undefined,
            deactivationReason: undefined
        });

        if (success) {
            setSuccessMessage(`Akun ${employee.name} berhasil diaktifkan kembali.`);
            setTimeout(() => setSuccessMessage(null), 3000);
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
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Status Karyawan</h1>
                        <p className="text-gray-500">Kelola kategori, promosi, dan kontrak kerja</p>
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
                        <option value="ALL">Semua Kategori</option>
                        <option value="BUSINESS_OWNER">Business Owner</option>
                        <option value="SUPER_ADMIN">IT Support System</option>
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
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
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
                            <p className="text-gray-500">Tidak ada karyawan ditemukan</p>
                        </div>
                    ) : (
                        staffList.map((employee) => (
                            <div
                                key={employee.id}
                                onClick={() => {
                                    setSelectedEmployee(employee);
                                    setNewCategory(employee.category);
                                }}
                                className={`bg-white p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${selectedEmployee?.id === employee.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 shadow-sm'} ${!employee.isActive ? 'opacity-75 bg-gray-50' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden relative">
                                            <img src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.name}`} alt={employee.name} className={`w-full h-full object-cover ${!employee.isActive ? 'grayscale' : ''}`} />
                                            {!employee.isActive && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <Ban className="text-white w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                {employee.name}
                                                {!employee.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Non-Aktif</span>}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{employee.id}</span>
                                                <span>•</span>
                                                <span>{employee.department}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(employee.category)}`}>
                                            {getCategoryLabel(employee.category)}
                                        </span>

                                        {/* Action Menu Trigger - Just direct buttons for now for simplicity and speed */}
                                        <div className="flex gap-1">
                                            {employee.isActive !== false ? (
                                                <button
                                                    onClick={(e) => handleDeactivateClick(e, employee)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Nonaktifkan Akun"
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleReactivate(e, employee)}
                                                    className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Aktifkan Kembali"
                                                >
                                                    <RefreshCw size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Action Panel */}
                <div className="lg:col-span-1">
                    {selectedEmployee ? (
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Status</h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Current Status</label>
                                    <div className="font-medium text-gray-900 mt-1">{getCategoryLabel(selectedEmployee.category)}</div>
                                    <div className="text-xs text-gray-400 mt-1">ID: {selectedEmployee.id}</div>
                                    {selectedEmployee.isActive === false && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <div className="text-xs text-red-500 font-medium">Status: Non-Aktif</div>
                                            <div className="text-xs text-gray-500">Sejak: {selectedEmployee.deactivationDate}</div>
                                            <div className="text-xs text-gray-500">Alasan: {selectedEmployee.deactivationReason}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Pilih Status Baru</label>
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
                                </div>

                                {newCategory && newCategory !== selectedEmployee.category && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                                        <div className="text-xs text-yellow-700">
                                            <span className="font-bold">Perhatian:</span> Mengubah status akan membuat ID Baru secara otomatis. Pastikan data payroll disesuaikan.
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handlePromote}
                                    disabled={isProcessing || !newCategory || newCategory === selectedEmployee.category || selectedEmployee.isActive === false}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                >
                                    {isProcessing ? 'Menyimpan...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                                {selectedEmployee.isActive === false && (
                                    <p className="text-xs text-center text-red-500">
                                        Karyawan non-aktif tidak dapat diubah statusnya. Aktifkan kembali terlebih dahulu.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Pilih karyawan dari daftar untuk mengubah status.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Deactivation Modal */}
            {isDeactivateModalOpen && employeeToDeactivate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-lg font-bold">Nonaktifkan Akun?</h3>
                            </div>
                            <button onClick={() => setIsDeactivateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Anda yakin ingin menonaktifkan akun <strong>{employeeToDeactivate.name}</strong>?
                            Akun akan terkunci dan tidak muncul di sistem aktif.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Penonaktifan</label>
                            <select
                                value={deactivationReason}
                                onChange={(e) => setDeactivationReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Pilih Alasan...</option>
                                <option value="Resign">Resign (Mengundurkan Diri)</option>
                                <option value="Terminated">Terminated (Diberhentikan)</option>
                                <option value="Retired">Pensiun</option>
                                <option value="Other">Lainnya</option>
                            </select>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setIsDeactivateModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmDeactivate}
                                disabled={!deactivationReason || isProcessing}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing ? 'Memproses...' : 'Nonaktifkan Akun'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCategorizationScreen;
