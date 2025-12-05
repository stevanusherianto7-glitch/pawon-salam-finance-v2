import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, EmploymentCategory, UserRole, EmployeeArea } from '../types';
import { employeeApi } from '../services/api';

interface EmployeeState {
  employees: Employee[];
  isLoading: boolean;
  fetchEmployees: () => Promise<void>;
  addEmployee: (data: Omit<Employee, 'id' | 'avatarUrl'>) => Promise<boolean>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<boolean>;
  seedEmployees: () => void;
}

const getIDPrefix = (role: UserRole, category: EmploymentCategory): string => {
  if (role === UserRole.BUSINESS_OWNER) return 'OWN';
  if (role === UserRole.SUPER_ADMIN) return 'SYS';
  if ([UserRole.RESTAURANT_MANAGER, UserRole.HR_MANAGER, UserRole.FINANCE_MANAGER, UserRole.MARKETING_MANAGER].includes(role)) return 'MGR';

  // For Staff
  switch (category) {
    case EmploymentCategory.PERMANENT: return 'EMP';
    case EmploymentCategory.PROBATION: return 'PRO';
    case EmploymentCategory.DAILY_WORKER: return 'DW';
    default: return 'EMP';
  }
};

const getDeptCode = (role: UserRole, area: EmployeeArea): string => {
  if (role === UserRole.BUSINESS_OWNER) return '2025'; // Special case for Owner
  if (role === UserRole.SUPER_ADMIN) return 'ADMIN';

  // Managers
  if (role === UserRole.HR_MANAGER) return 'HRD';
  if (role === UserRole.FINANCE_MANAGER) return 'FIN';
  if (role === UserRole.MARKETING_MANAGER) return 'MKT';
  if (role === UserRole.RESTAURANT_MANAGER) return 'OPS';

  // Staff
  if (area === EmployeeArea.FOH) return 'FOH';
  if (area === EmployeeArea.BOH) return 'BOH';

  return 'GEN'; // Fallback
};

export const generateSmartId = (role: UserRole, category: EmploymentCategory, area: EmployeeArea, sequence: number): string => {
  const prefix = getIDPrefix(role, category);
  const deptCode = getDeptCode(role, area);
  const seq = sequence.toString().padStart(3, '0');

  // Tier 1: Owner
  if (role === UserRole.BUSINESS_OWNER) {
    return `${prefix}-${deptCode}-${seq}`;
  }

  // Tier 2: Super Admin
  if (role === UserRole.SUPER_ADMIN) {
    const year = new Date().getFullYear().toString().slice(-2);
    return `${prefix}-${deptCode}-${year}-${seq}`;
  }

  // Tier 3 & 4: Managers & Staff
  const year = new Date().getFullYear().toString().slice(-2);
  return `${prefix}-${deptCode}-${year}${seq}`;
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
          // Generate Smart ID
          const currentCount = get().employees.length + 1;
          const newId = generateSmartId(data.role, data.category, data.area, currentCount);

          const newEmployee = {
            ...data,
            id: newId,
            isActive: true, // Default to active
            avatarUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random`
          };

          const res = await employeeApi.addEmployee(newEmployee);
          if (res.success && res.data) {
            set((state) => ({
              employees: [...state.employees, res.data!]
            }));
            return true;
          }
          return false;
        } catch (e) {
          console.error(e);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateEmployee: async (id, data) => {
        set({ isLoading: true });
        try {
          const res = await employeeApi.updateEmployee(id, data);
          if (res.success && res.data) {
            set((state) => ({
              employees: state.employees.map(e => e.id === id ? res.data! : e)
            }));
            return true;
          }
          return false;
        } catch (e) {
          console.error(e);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      seedEmployees: () => {
        const dummyEmployees: Employee[] = [
          {
            id: 'OWN-2025-001',
            name: 'Dr. Veronica',
            email: 'owner@pawonsalam.com',
            role: UserRole.BUSINESS_OWNER,
            department: 'Executive',
            area: EmployeeArea.MANAGEMENT,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-01-01',
            avatarUrl: 'https://ui-avatars.com/api/?name=Dr+Veronica&background=0D8ABC&color=fff',
            isActive: true
          },
          {
            id: 'SYS-ADMIN-25-001',
            name: 'IT Support System',
            email: 'admin@pawonsalam.com',
            role: UserRole.SUPER_ADMIN,
            department: 'IT Support',
            area: EmployeeArea.MANAGEMENT,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-01-01',
            avatarUrl: 'https://ui-avatars.com/api/?name=IT+Support&background=333&color=fff',
            isActive: true
          },
          {
            id: 'MGR-HRD-25001',
            name: 'Stepanus Herianto',
            email: 'hr@pawonsalam.com',
            role: UserRole.HR_MANAGER,
            department: 'Human Resources',
            area: EmployeeArea.MANAGEMENT,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-02-15',
            avatarUrl: 'https://ui-avatars.com/api/?name=Stepanus+Herianto&background=D7263D&color=fff',
            isActive: true
          },
          {
            id: 'MGR-OPS-25001',
            name: 'PB Herwandi',
            email: 'resto@pawonsalam.com',
            role: UserRole.RESTAURANT_MANAGER,
            department: 'Operations',
            area: EmployeeArea.MANAGEMENT,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-03-10',
            avatarUrl: 'https://ui-avatars.com/api/?name=PB+Herwandi&background=F46036&color=fff',
            isActive: true
          },
          {
            id: 'MGR-FIN-25001',
            name: 'Boston Endi Sitompul',
            email: 'finance@pawonsalam.com',
            role: UserRole.FINANCE_MANAGER,
            department: 'Finance',
            area: EmployeeArea.MANAGEMENT,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-03-15',
            avatarUrl: 'https://ui-avatars.com/api/?name=Boston+Endi&background=2E294E&color=fff',
            isActive: true
          },
          {
            id: 'MGR-MKT-25001',
            name: 'Marketing Lead',
            email: 'marketing@pawonsalam.com',
            role: UserRole.MARKETING_MANAGER,
            department: 'Marketing',
            area: EmployeeArea.MANAGEMENT,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-04-01',
            avatarUrl: 'https://ui-avatars.com/api/?name=Marketing+Lead&background=1B998B&color=fff',
            isActive: true
          },
          {
            id: 'EMP-BOH-25001',
            name: 'Joko Susilo',
            email: 'chef@pawonsalam.com',
            role: UserRole.EMPLOYEE,
            department: 'Kitchen',
            area: EmployeeArea.BOH,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-04-01',
            avatarUrl: 'https://ui-avatars.com/api/?name=Joko+Susilo&background=2E294E&color=fff',
            isActive: true
          },
          {
            id: 'DW-FOH-25001',
            name: 'Rina Kartika',
            email: 'rina@pawonsalam.com',
            role: UserRole.EMPLOYEE,
            department: 'Service',
            area: EmployeeArea.FOH,
            category: EmploymentCategory.DAILY_WORKER,
            joinedDate: '2023-05-20',
            avatarUrl: 'https://ui-avatars.com/api/?name=Rina+Kartika&background=1B998B&color=fff',
            isActive: true
          }
        ];
        set({ employees: dummyEmployees });
      }
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({
        employees: state.employees
      })
    }
  )
);