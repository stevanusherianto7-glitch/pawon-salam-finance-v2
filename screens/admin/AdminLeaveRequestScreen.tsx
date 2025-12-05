import React, { useState, useEffect } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { useLeaveStore } from '../../store/leaveStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, Calendar, FileText, ChevronDown, Send, User, Search, FilePlus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { LeaveType, UserRole, LeaveStatus, LeaveRequest } from '../../types';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';

interface Props {
  onBack: () => void;
}

export const AdminLeaveRequestScreen: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuthStore();
  const { employees, fetchEmployees, isLoading: isLoadingEmps } = useEmployeeStore();
  const { submitRequest, allRequests, fetchAllRequests, updateRequestStatus, isLoading: isSubmitting } = useLeaveStore();

  const [activeTab, setActiveTab] = useState<'input' | 'approval'>('input');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    type: LeaveType.SICK,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchAllRequests();
  }, []);

  // Filter employees
  const filteredEmployees = employees.filter(e =>
    e.role !== UserRole.BUSINESS_OWNER &&
    e.role !== UserRole.SUPER_ADMIN &&
    (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter Requests for Approval
  const pendingRequests = allRequests.filter(req => {
    if (user?.role === UserRole.RESTAURANT_MANAGER) return req.status === LeaveStatus.PENDING_MANAGER;
    if (user?.role === UserRole.HR_MANAGER) return req.status === LeaveStatus.PENDING_HR;
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      alert('Mohon pilih karyawan terlebih dahulu.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      return;
    }

    const success = await submitRequest({
      employeeId: selectedEmployeeId,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason
    });

    if (success) {
      alert('Pengajuan izin karyawan berhasil dibuat!');
      setFormData({ ...formData, reason: '' });
      setSelectedEmployeeId('');
    } else {
      alert('Gagal mengirim pengajuan.');
    }
  };

  const handleApprove = async (req: LeaveRequest) => {
    let nextStatus = LeaveStatus.APPROVED;
    if (user?.role === UserRole.RESTAURANT_MANAGER) nextStatus = LeaveStatus.PENDING_HR;

    if (window.confirm(`Setujui izin ini? Status akan berubah menjadi ${nextStatus}`)) {
      await updateRequestStatus(req.id, nextStatus);
    }
  };

  const handleReject = async (req: LeaveRequest) => {
    if (window.confirm("Tolak izin ini?")) {
      await updateRequestStatus(req.id, LeaveStatus.REJECTED);
    }
  };

  const getTypeLabel = (type: LeaveType) => {
    switch (type) {
      case LeaveType.SICK: return 'Sakit';
      case LeaveType.ANNUAL: return 'Cuti Tahunan';
      case LeaveType.OTHER: return 'Lainnya';
      default: return type;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-base leading-tight">Manajemen Cuti</h2>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Input & Persetujuan Izin</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl mt-3">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'input' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Input Izin
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'approval' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Persetujuan {pendingRequests.length > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{pendingRequests.length}</span>}
          </button>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">

        {activeTab === 'input' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Employee Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1">
                  <User size={10} /> Pilih Karyawan
                </label>

                {/* Simple Search inside Select simulation */}
                <div className="relative">
                  {selectedEmployeeId ? (
                    <div
                      onClick={() => setSelectedEmployeeId('')}
                      className="flex items-center justify-between w-full p-2.5 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                          {employees.find(e => e.id === selectedEmployeeId)?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{employees.find(e => e.id === selectedEmployeeId)?.name}</p>
                          <p className="text-[9px] text-gray-500">{employees.find(e => e.id === selectedEmployeeId)?.department}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold">Ubah</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Cari nama..."
                          className="w-full pl-9 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:border-orange-500 outline-none"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-inner">
                        {isLoadingEmps ? (
                          <p className="text-center text-[10px] text-gray-400 py-3">Memuat...</p>
                        ) : filteredEmployees.length === 0 ? (
                          <p className="text-center text-[10px] text-gray-400 py-3">Tidak ditemukan</p>
                        ) : (
                          filteredEmployees.map(emp => (
                            <div
                              key={emp.id}
                              onClick={() => setSelectedEmployeeId(emp.id)}
                              className="p-2 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-2"
                            >
                              <img src={emp.avatarUrl} className="w-5 h-5 rounded-full bg-gray-200 object-cover" />
                              <div className="flex-1">
                                <p className="text-[10px] font-bold text-gray-700">{emp.name}</p>
                                <p className="text-[8px] text-gray-400">{emp.department}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-dashed border-gray-200" />

              {/* Leave Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Jenis Izin</label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveType })}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 pr-8 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-colors font-medium text-xs"
                  >
                    <option value={LeaveType.SICK}>🤒 Sakit</option>
                    <option value={LeaveType.ANNUAL}>🌴 Cuti Tahunan</option>
                    <option value={LeaveType.OTHER}>⚡ Lainnya</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Dari</label>
                  <div className="relative">
                    <GlassDatePicker
                      selectedDate={formData.startDate ? new Date(formData.startDate) : null}
                      onChange={(date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setFormData({ ...formData, startDate: `${year}-${month}-${day}` });
                      }}
                      placeholder="Pilih Tanggal"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Sampai</label>
                  <div className="relative">
                    <GlassDatePicker
                      selectedDate={formData.endDate ? new Date(formData.endDate) : null}
                      onChange={(date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        setFormData({ ...formData, endDate: `${year}-${month}-${day}` });
                      }}
                      placeholder="Pilih Tanggal"
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Alasan</label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Keterangan sakit / keperluan..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-colors text-xs resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedEmployeeId}
                className="w-full py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 mt-3 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                style={{ background: colors.gradientMain }}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FilePlus size={16} /> Ajukan Izin
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          // APPROVAL TAB
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <CheckCircle size={48} className="mx-auto text-green-100 mb-3" />
                <p className="text-gray-400 text-xs font-medium">Tidak ada pengajuan yang perlu disetujui.</p>
              </div>
            ) : (
              pendingRequests.map(req => {
                const emp = employees.find(e => e.id === req.employeeId);
                return (
                  <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-sm">
                          {emp?.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{emp?.name}</h4>
                          <p className="text-[10px] text-gray-500">{emp?.department}</p>
                        </div>
                      </div>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Jenis:</span>
                        <span className="font-medium text-gray-800">{getTypeLabel(req.type)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Tanggal:</span>
                        <span className="font-medium text-gray-800">{req.startDate} - {req.endDate}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Alasan:</span>
                        <span className="font-medium text-gray-800 text-right w-1/2 truncate">{req.reason}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(req)}
                        className="flex-1 py-2 rounded-lg border border-red-100 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} /> Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(req)}
                        className="flex-1 py-2 rounded-lg bg-green-500 text-white font-bold text-xs hover:bg-green-600 shadow-md transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={14} /> Setujui
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};
