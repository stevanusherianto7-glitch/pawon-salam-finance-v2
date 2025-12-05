
import { create } from 'zustand';
import { LeaveRequest, LeaveType, LeaveStatus } from '../types';
import { leaveApi } from '../services/api';

interface LeaveState {
  requests: LeaveRequest[]; // Personal history
  allRequests: LeaveRequest[]; // For Managers/HR
  isLoading: boolean;
  fetchRequests: (employeeId: string) => Promise<void>;
  fetchAllRequests: () => Promise<void>;
  submitRequest: (data: Omit<LeaveRequest, 'id' | 'status'>) => Promise<boolean>;
  updateRequestStatus: (id: string, status: LeaveStatus) => Promise<boolean>;
}

export const useLeaveStore = create<LeaveState>((set, get) => ({
  requests: [],
  allRequests: [],
  isLoading: false,

  fetchRequests: async (employeeId) => {
    set({ isLoading: true });
    try {
      const res = await leaveApi.getHistory(employeeId);
      if (res.success && res.data) {
        set({ requests: res.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllRequests: async () => {
    set({ isLoading: true });
    try {
      // Mocking API call here since we haven't updated api.ts yet
      // In real app, this would be await leaveApi.getAllRequests();
      // For now, let's simulate it by using MOCK_LEAVE_REQUESTS from api.ts if we could import it, 
      // but we can't easily. So we will rely on the api.ts update which I will do next.
      // I'll assume leaveApi.getAllRequests() exists.
      const res = await leaveApi.getAllRequests();
      if (res.success && res.data) {
        set({ allRequests: res.data });
      }
    } catch (e) {
      console.error("Failed to fetch all requests", e);
    } finally {
      set({ isLoading: false });
    }
  },

  submitRequest: async (data) => {
    set({ isLoading: true });
    try {
      const res = await leaveApi.submitRequest(data);
      if (res.success && res.data) {
        set((state) => ({
          requests: [res.data!, ...state.requests],
          allRequests: [res.data!, ...state.allRequests]
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

  updateRequestStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      const res = await leaveApi.updateStatus(id, status);
      if (res.success && res.data) {
        set(state => ({
          allRequests: state.allRequests.map(req => req.id === id ? { ...req, status } : req),
          requests: state.requests.map(req => req.id === id ? { ...req, status } : req)
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
  }
}));