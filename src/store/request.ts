import { create } from 'zustand';
import { MedicineRequest } from '../config/types';
import {
  getRequestsByNgo,
  getOpenRequests,
  createRequest as createRequestService,
  updateRequest as updateRequestService,
  deleteRequest as deleteRequestService,
} from '../services/request';

interface RequestState {
  requests: MedicineRequest[];
  myRequests: MedicineRequest[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMyRequests: (ngoId: string) => Promise<void>;
  fetchOpenRequests: () => Promise<void>;
  createRequest: (requestData: any) => Promise<string>;
  updateRequest: (id: string, updates: Partial<MedicineRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  myRequests: [],
  isLoading: false,
  error: null,

  fetchMyRequests: async (ngoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const requests = await getRequestsByNgo(ngoId);
      set({ myRequests: requests, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching my requests:', error);
    }
  },

  fetchOpenRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const requests = await getOpenRequests();
      set({ requests, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching open requests:', error);
    }
  },

  createRequest: async (requestData) => {
    set({ isLoading: true, error: null });
    try {
      const id = await createRequestService(requestData);
      set({ isLoading: false });
      return id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error creating request:', error);
      throw error;
    }
  },

  updateRequest: async (id: string, updates: Partial<MedicineRequest>) => {
    set({ isLoading: true, error: null });
    try {
      await updateRequestService(id, updates);
      
      // Update local state
      const myRequests = get().myRequests.map(r => 
        r.id === id ? { ...r, ...updates } : r
      );
      const requests = get().requests.map(r => 
        r.id === id ? { ...r, ...updates } : r
      );
      
      set({ myRequests, requests, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating request:', error);
      throw error;
    }
  },

  deleteRequest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteRequestService(id);
      
      // Remove from local state
      const myRequests = get().myRequests.filter(r => r.id !== id);
      const requests = get().requests.filter(r => r.id !== id);
      
      set({ myRequests, requests, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error deleting request:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
