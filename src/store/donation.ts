import { create } from 'zustand';
import { Donation } from '../config/types';
import {
  getDonationsByDonor,
  getAvailableDonations,
  createDonation as createDonationService,
  updateDonation as updateDonationService,
  deleteDonation as deleteDonationService,
} from '../services/donation';

interface DonationState {
  donations: Donation[];
  myDonations: Donation[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMyDonations: (donorId: string) => Promise<void>;
  fetchAvailableDonations: () => Promise<void>;
  createDonation: (donationData: Omit<Donation, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateDonation: (id: string, updates: Partial<Donation>) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDonationStore = create<DonationState>((set, get) => ({
  donations: [],
  myDonations: [],
  isLoading: false,
  error: null,

  fetchMyDonations: async (donorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const donations = await getDonationsByDonor(donorId);
      set({ myDonations: donations, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching my donations:', error);
    }
  },

  fetchAvailableDonations: async () => {
    set({ isLoading: true, error: null });
    try {
      const donations = await getAvailableDonations();
      set({ donations, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching available donations:', error);
    }
  },

  createDonation: async (donationData) => {
    set({ isLoading: true, error: null });
    try {
      const id = await createDonationService(donationData);
      set({ isLoading: false });
      return id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error creating donation:', error);
      throw error;
    }
  },

  updateDonation: async (id: string, updates: Partial<Donation>) => {
    set({ isLoading: true, error: null });
    try {
      await updateDonationService(id, updates);
      
      // Update local state
      const myDonations = get().myDonations.map(d => 
        d.id === id ? { ...d, ...updates } : d
      );
      const donations = get().donations.map(d => 
        d.id === id ? { ...d, ...updates } : d
      );
      
      set({ myDonations, donations, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating donation:', error);
      throw error;
    }
  },

  deleteDonation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDonationService(id);
      
      // Remove from local state
      const myDonations = get().myDonations.filter(d => d.id !== id);
      const donations = get().donations.filter(d => d.id !== id);
      
      set({ myDonations, donations, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error deleting donation:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
