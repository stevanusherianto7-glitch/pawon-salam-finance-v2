import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { Plus, Search, User, Mail, Phone, Briefcase, X, Save, Shield, Edit2, Eye, KeyRound, Calendar, ArrowLeft, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { Employee, UserRole, EmployeeArea, EmploymentCategory } from '../../types';
import { adminApi, employeeApi } from '../../services/api'; // Added employeeApi
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';

interface Props {
  onBack?: () => void;
}

export const AdminEmployeeListScreen: React.FC<Props> = ({ onBack }) => {
  const { user, startImpersonation } = useAuthStore();
  const { employees, fetchEmployees, addEmployee, updateEmployee, isLoading } = useEmployeeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    joinDate: new Date().toISOString().split('T')[0], // New Field
    pin: '',
    department: '',
    role: UserRole.EMPLOYEE,
    area: EmployeeArea.FOH,
    category: EmploymentCategory.PROBATION // New Field
  });

  // Smart ID State
  const [idPreview, setIdPreview] = useState('');
  const [isCalculatingId, setIsCalculatingId] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // SMART ID GENERATION EFFECT
  useEffect(() => {
    if (!isModalOpen || editingId) return; // Don't generate for edit mode

    const fetchSmartId = async () => {
      setIsCalculatingId(true);
      // Simulate "Thinking" time for UX
      const res = await employeeApi.getNextSequence(formData.role, formData.area, formData.joinDate, formData.category);
      if (res.success && res.data) {
        setIdPreview(res.data);
      }
      setIsCalculatingId(false);
    };

    const timer = setTimeout(fetchSmartId, 600); // 600ms Debounce
    return () => clearTimeout(timer);
  }, [formData.role, formData.area, formData.category, formData.joinDate, isModalOpen, editingId]);

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form when opening for Add
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '', email: '', phone: '', birthDate: '',
      joinDate: new Date().toISOString().split('T')[0],
      pin: '123456', department: '', role: UserRole.EMPLOYEE, area: EmployeeArea.FOH,
      category: EmploymentCategory.PROBATION
    });
    setIdPreview('Calculating...');
    setIsModalOpen(true);
  };

  // Populate form when opening for Edit
  const handleOpenEdit = (emp: Employee) => {
    if (user?.role !== UserRole.SUPER_ADMIN) {
      alert("Akses Ditolak: Hanya Super Admin yang dapat mengedit data user.");
      return;
    }
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      birthDate: emp.birthDate || '',
      joinDate: emp.joinedDate || '',
      pin: '',
      department: emp.department,
      role: emp.role,
      area: emp.area,
      category: emp.category
    });
    setIdPreview(emp.id); // Fixed ID for edit
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const isConfirmed = window.confirm(
      editingId
        ? "Apakah anda yakin ingin menyimpan perubahan data karyawan ini?"
        : `Konfirmasi ID: ${idPreview}\nTambahkan karyawan baru?`
    );

    if (!isConfirmed) return;

    let success = false;
    // Map form data to Employee type
    const payload = {
      ...formData,
      joinedDate: formData.joinDate, // Map to correct key
      isActive: true // Default active
    };
    // Remove temporary form fields not in Employee type
    delete (payload as any).joinDate;
    if (editingId && !payload.pin) {
      delete (payload as any).pin;
    }

    if (editingId) {
      success = await updateEmployee(editingId, payload);
    } else {
      // Use the previewed ID
      const newEmployeeData = { ...payload, id: idPreview };
      success = await addEmployee(newEmployeeData);
    }

    if (success) {
      alert(editingId ? 'Data karyawan berhasil diperbarui!' : 'Karyawan berhasil ditambahkan!');
      setIsModalOpen(false);
      setEditingId(null);
    } else {
      alert('Gagal menyimpan data. Cek kembali inputan.');
    }
  };

  const handleViewAs = async (targetUser: Employee) => {
    if (user?.role !== UserRole.SUPER_ADMIN) return;
    const confirm = window.confirm(`View app as ${targetUser.name}? You will see exactly what they see.`);
    if (confirm) {
      await adminApi.logImpersonationStart(user.id, targetUser.id);
      startImpersonation(targetUser);
    }
  };

  return (
    <div className="bg-gray-50 pb-24 min-h-screen">
      {/* Header Wrapper - FIXED LAYOUT */}
      <div className="relative">
        {/* Background Header */}
        <div
          className="pt-8 pb-12 px-4 rounded-b-[2rem] relative overflow-hidden shadow-md z-10"
          style={{ background: colors.gradientMain }}
        >
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
          <div className="relative z-10 flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Data Pengguna</h2>
              <p className="text-white/80 text-xs">Kelola user & impersonasi akses</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 -mt-6 relative z-20">
          <div className="bg-white rounded-xl flex items-center px-3 py-2.5 border border-gray-200 shadow-lg">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Cari nama atau divisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-xs text-gray-700 min-w-0"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 px-4 space-y-2">
        {/* Add Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white active:scale-95 transition-transform shadow-sm hover:shadow-md"
            style={{ background: colors.primary }}
          >
            <Plus size={12} /> Tambah User
          </button>
        </div>

        {/* List */}
        {isLoading && employees.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Memuat data...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Search size={20} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Tidak ada data ditemukan</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div key={emp.id} className="bg-white p-2.5 rounded-xl border border-gray-100 flex items-center gap-3 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
              <div className="relative flex-shrink-0">
                <img src={emp.avatarUrl} alt={emp.name} className="w-9 h-9 rounded-full bg-gray-200 object-cover border border-gray-100" />
                {emp.role === UserRole.ADMIN && (
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                    <Shield size={8} className="text-white fill-current" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-14">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 truncate text-xs leading-tight">{emp.name}</h3>
                </div>
                <p className="text-[9px] text-gray-500 truncate mt-0.5">{emp.department}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <a href={`tel:${emp.phone}`} className="flex items-center text-[9px] text-gray-400 hover:text-orange-500">
                    <Phone size={8} className="mr-1" /> {emp.phone || '-'}
                  </a>
                </div>
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                {user?.role === UserRole.SUPER_ADMIN && emp.id !== user.id && (
                  <button
                    onClick={() => handleViewAs(emp)}
                    className="p-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100"
                    title={`View as ${emp.name}`}
                  >
                    <Eye size={12} />
                  </button>
                )}
                {user?.role === UserRole.SUPER_ADMIN && (
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-1 rounded-full bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors border border-gray-100"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ADD/EDIT USER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-gray-200 shadow-2xl">
            <div className="px-4 py-2.5 border-b flex justify-between items-center" style={{ backgroundColor: colors.primarySoft }}>
              <h3 className="font-bold text-sm" style={{ color: colors.textMain }}>
                {editingId ? 'Edit Data User' : 'Tambah User Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-black/5">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">

              {/* SMART ID SECTION */}
              {!editingId && (
                <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${isCalculatingId ? 'border-blue-300 bg-blue-50/50' : 'border-green-200 bg-green-50/50'}`}>
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                    System ID (Auto-Generated)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        readOnly
                        value={idPreview}
                        className={`w-full bg-white border font-mono font-bold text-lg tracking-wider px-3 py-2 rounded-lg outline-none transition-all ${isCalculatingId ? 'text-gray-400 animate-pulse border-blue-200' : 'text-gray-800 border-green-300 shadow-sm'}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCalculatingId ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  {isCalculatingId && (
                    <p className="text-[10px] text-blue-600 mt-1.5 font-medium animate-pulse">Calculating deterministic sequence from database...</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Role System</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full text-xs p-2 rounded-lg border bg-gray-50 focus:bg-white outline-none"
                  >
                    <option value={UserRole.EMPLOYEE}>Staff</option>
                    <option value={UserRole.RESTAURANT_MANAGER}>Restaurant Manager</option>
                    <option value={UserRole.HR_MANAGER}>HR Manager</option>
                    <option value={UserRole.FINANCE_MANAGER}>Finance Manager</option>
                    <option value={UserRole.MARKETING_MANAGER}>Marketing Manager</option>
                    <option value={UserRole.BUSINESS_OWNER}>Business Owner</option>
                    <option value={UserRole.SUPER_ADMIN}>IT Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Area Kerja</label>
                  <select
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value as EmployeeArea })}
                    className="w-full text-xs p-2 rounded-lg border bg-gray-50 focus:bg-white outline-none"
                  >
                    <option value={EmployeeArea.FOH}>Front of House</option>
                    <option value={EmployeeArea.BOH}>Back of House</option>
                    <option value={EmployeeArea.MANAGEMENT}>Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Status Kontrak</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as EmploymentCategory })}
                    className="w-full text-xs p-2 rounded-lg border bg-gray-50 focus:bg-white outline-none"
                  >
                    <option value={EmploymentCategory.PROBATION}>Probation (Percobaan)</option>
                    <option value={EmploymentCategory.DAILY_WORKER}>Daily Worker</option>
                    <option value={EmploymentCategory.PERMANENT}>Permanent (Tetap)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Tanggal Masuk</label>
                  <GlassDatePicker
                    selectedDate={formData.joinDate ? new Date(formData.joinDate) : undefined}
                    onChange={(date) => setFormData({ ...formData, joinDate: date.toISOString().split('T')[0] })}
                    placeholder="Join Date"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase">Nama Lengkap</label>
                <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-gray-50 focus-within:bg-white focus-within:border-orange-500 transition-colors">
                  <User size={14} className="text-gray-400 mr-2" />
                  <input required type="text" className="flex-1 bg-transparent outline-none text-xs" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase">Departemen (Label)</label>
                <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-gray-50 focus-within:bg-white focus-within:border-orange-500 transition-colors">
                  <Briefcase size={14} className="text-gray-400 mr-2" />
                  <input required type="text" placeholder="e.g. Waiter, Barista, Cook" className="flex-1 bg-transparent outline-none text-xs" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase">Email (Login Super Admin)</label>
                <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-gray-50 focus-within:bg-white focus-within:border-orange-500 transition-colors">
                  <Mail size={14} className="text-gray-400 mr-2" />
                  <input required type="email" className="flex-1 bg-transparent outline-none text-xs" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">No. HP (Login Staff)</label>
                  <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-gray-50 focus-within:bg-white focus-within:border-orange-500 transition-colors">
                    <Phone size={14} className="text-gray-400 mr-2" />
                    <input required type="tel" className="flex-1 bg-transparent outline-none text-xs" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Tanggal Lahir</label>
                  <GlassDatePicker
                    selectedDate={formData.birthDate ? new Date(formData.birthDate) : undefined}
                    onChange={(date) => {
                      const dateStr = date.toISOString().split('T')[0];
                      setFormData({ ...formData, birthDate: dateStr });
                    }}
                    placeholder="Birth Date"
                  />
                </div>
              </div>

              {/* SECURITY SECTION */}
              <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-orange-600 uppercase flex items-center gap-1">
                    <KeyRound size={10} /> PIN Keamanan (Login)
                  </label>
                  <div className="flex items-center border rounded-lg px-2.5 py-1.5 bg-white focus-within:border-orange-500 transition-colors">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder={editingId ? "Biarkan kosong jika tidak diubah" : "Buat PIN baru (Default: 123456)"}
                      className="flex-1 bg-transparent outline-none text-xs tracking-widest font-bold text-gray-700"
                      value={formData.pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, pin: val });
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm mt-4"
                style={{ background: colors.primary }}
              >
                {editingId ? 'Simpan Perubahan' : 'Buat User Baru'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
