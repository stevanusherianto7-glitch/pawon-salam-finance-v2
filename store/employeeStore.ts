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

const generateSmartId = (category: EmploymentCategory, area: EmployeeArea, sequence: number): string => {
  let prefix = 'EMP';
  if (category === EmploymentCategory.PROBATION) prefix = 'PRO';
  if (category === EmploymentCategory.DAILY_WORKER) prefix = 'DW';

  let deptCode = 'MGT';
  if (area === EmployeeArea.FOH) deptCode = 'FOH';
  if (area === EmployeeArea.BOH) deptCode = 'BOH';

  const year = new Date().getFullYear().toString().slice(-2);
  const seq = sequence.toString().padStart(3, '0');

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
          const newId = generateSmartId(data.category, data.area, currentCount);

          const newEmployee = { ...data, id: newId, avatarUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random` };

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
            id: 'EMP-MGT-25001',
            name: 'Budi Santoso',
            email: 'owner@pawonsalam.com',
            role: UserRole.BUSINESS_OWNER,
            department: 'Management',
            area: EmployeeArea.MANAGEMENT,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-01-01',
            avatarUrl: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=0D8ABC&color=fff'
          },
          {
            id: 'EMP-MGT-25002',
            name: 'Siti Aminah',
            email: 'hr@pawonsalam.com',
            role: UserRole.HR_MANAGER,
            department: 'Human Resources',
            area: EmployeeArea.MANAGEMENT,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-02-15',
            avatarUrl: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=D7263D&color=fff'
          },
          {
            id: 'EMP-MGT-25003',
            name: 'Wawan Setiawan',
            email: 'resto@pawonsalam.com',
            role: UserRole.RESTAURANT_MANAGER,
            department: 'Operations',
            area: EmployeeArea.MANAGEMENT,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-03-10',
            avatarUrl: 'https://ui-avatars.com/api/?name=Wawan+Setiawan&background=F46036&color=fff'
          },
          {
            id: 'EMP-BOH-25004',
            name: 'Joko Susilo',
            email: 'chef@pawonsalam.com',
            role: UserRole.EMPLOYEE,
            department: 'Kitchen',
            area: EmployeeArea.BOH,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-04-01',
            avatarUrl: 'https://ui-avatars.com/api/?name=Joko+Susilo&background=2E294E&color=fff'
          },
          {
            id: 'EMP-FOH-25005',
            name: 'Rina Kartika',
            email: 'rina@pawonsalam.com',
            role: UserRole.EMPLOYEE,
            department: 'Service',
            area: EmployeeArea.FOH,
            category: EmploymentCategory.PERMANENT,
            joinedDate: '2023-05-20',
            avatarUrl: 'https://ui-avatars.com/api/?name=Rina+Kartika&background=1B998B&color=fff'
          },
          {
            id: 'PRO-FOH-25006',
            name: 'Dewi Lestari',
            email: 'dewi@pawonsalam.com',
            role: UserRole.EMPLOYEE,
            department: 'Service',
            area: EmployeeArea.FOH,
            category: EmploymentCategory.PROBATION,
            joinedDate: '2025-01-10',
            avatarUrl: 'https://ui-avatars.com/api/?name=Dewi+Lestari&background=E71D36&color=fff'
          },
          {
            id: 'DW-BOH-25007',
            name: 'Agus Pratama',
            email: 'agus@pawonsalam.com',
            role: UserRole.EMPLOYEE,
            department: 'Kitchen',
            area: EmployeeArea.BOH,
            category: EmploymentCategory.DAILY_WORKER,
            joinedDate: '2025-02-01',
            avatarUrl: 'https://ui-avatars.com/api/?name=Agus+Pratama&background=FF9F1C&color=fff'
          },
          {
            id: 'DW-FOH-25008',
            name: 'Bambang Pamungkas',
            email: 'bambang@pawonsalam.com',
            role: UserRole.EMPLOYEE,
            department: 'Service',
            area: EmployeeArea.FOH,
            category: EmploymentCategory.DAILY_WORKER,
            joinedDate: '2025-02-05',
            avatarUrl: 'https://ui-avatars.com/api/?name=Bambang+Pamungkas&background=2EC4B6&color=fff'
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