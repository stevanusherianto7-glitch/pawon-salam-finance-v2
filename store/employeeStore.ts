import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, EmploymentCategory, UserRole, EmployeeArea } from '../types';
import { employeeApi } from '../services/api';

interface EmployeeState {
  employees: Employee[];
  isLoading: boolean;
  fetchEmployees: () => Promise<void>;
  addEmployee: (data: Omit<Employee, 'id' | 'avatarUrl'> & { id?: string }) => Promise<boolean>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<boolean>;
  seedEmployees: () => void;
}

const getIDPrefix = (role: UserRole): string => {
  if (role === UserRole.BUSINESS_OWNER) return 'OWN';
  if (role === UserRole.SUPER_ADMIN) return 'SYS';

  // Managers
  if ([UserRole.RESTAURANT_MANAGER, UserRole.HR_MANAGER, UserRole.FINANCE_MANAGER, UserRole.MARKETING_MANAGER].includes(role)) {
    return 'MGR';
  }

  // All Staff (Permanent, Probation, Daily Worker) now use STF
  return 'STF';
};

const getDeptCode = (role: UserRole, area: EmployeeArea): string => {
  if (role === UserRole.BUSINESS_OWNER) return '2025';
  if (role === UserRole.SUPER_ADMIN) return 'ADMIN';

  // Managers
  if (role === UserRole.HR_MANAGER) return 'HRD';
  if (role === UserRole.FINANCE_MANAGER) return 'FIN';
  if (role === UserRole.MARKETING_MANAGER) return 'MKT';
  if (role === UserRole.RESTAURANT_MANAGER) return 'OPR'; // Changed from OPS to OPR per instruction

  // Staff
  if (area === EmployeeArea.FOH) return 'SRV'; // Service
  if (area === EmployeeArea.BOH) return 'KIT'; // Kitchen

  return 'GEN'; // Fallback
};

export const generateSmartId = (role: UserRole, area: EmployeeArea, sequence: number, joinDate?: string): string => {
  const prefix = getIDPrefix(role);
  const deptCode = getDeptCode(role, area);

  // 1. MANAGER SCHEME: MGR-[DEPT]-[SEQ] (e.g. MGR-HRD-001)
  if (prefix === 'MGR') {
    const seq = sequence.toString().padStart(3, '0');
    return `${prefix}-${deptCode}-${seq}`;
  }

  // 2. STAFF SCHEME: STF-[DEPT]-[MMDDYY][SEQ] (e.g. STF-KIT-12012401)
  if (prefix === 'STF') {
    // Format Date MMDDYY from joinDate (or today if missing)
    const dateObj = joinDate ? new Date(joinDate) : new Date();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const yy = String(dateObj.getFullYear()).slice(-2);
    const dateCode = `${mm}${dd}${yy}`;

    const seq = sequence.toString().padStart(2, '0'); // 2 digit sequence for staff
    return `${prefix}-${deptCode}-${dateCode}${seq}`;
  }

  // Fallback / Others (Owner, Admin)
  const seq = sequence.toString().padStart(3, '0');
  return `${prefix}-${deptCode}-${seq}`;
};

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],
      isLoading: false,

      fetchEmployees: async () => {
        set({ isLoading: true });
        try {
          const res = await employeeApi.getAll();
          if (res.success && res.data) {
            set({ employees: res.data });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      addEmployee: async (data) => {
        set({ isLoading: true });
        try {
          // Generate Smart ID if not provided
          let newId = data.id;
          if (!newId) {
            // Find next sequence. 
            // NOTE: This is basic. Real app should query DB for max sequence for this pattern.
            // Here, we just count existing + 1. 
            // For managers, this might clash if we have deleted managers, but for MVP/Mock it's acceptable or we can refine logic.
            const currentCount = get().employees.length + 1;
            newId = generateSmartId(data.role, data.area, currentCount, data.joinedDate);
          }

          const newEmployee = {
            ...data,
            id: newId,
            isActive: true, // Default to active
            avatarUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random`
          };

          // Simulating API call
          const res = await employeeApi.add(newEmployee);

          if (res.success) {
            set((state) => ({
              employees: [...state.employees, newEmployee]
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error("Failed to add employee:", error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateEmployee: async (id, data) => {
        set({ isLoading: true });
        try {
          const res = await employeeApi.update(id, data);
          if (res.success) {
            set((state) => ({
              employees: state.employees.map((emp) =>
                emp.id === id ? { ...emp, ...data } : emp
              )
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error("Failed to update employee:", error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      seedEmployees: () => {
        // Logic to re-seed from mockData if needed
      }
    }),
    {
      name: 'pawon-salam-employee-storage',
    }
  )
);