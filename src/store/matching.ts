import { create } from 'zustand';
import { DonationMatch } from '../config/types';
import {
  getMatchesByDonor,
  getMatchesByNgo,
  confirmMatchByDonor,
  confirmMatchByNgo,
  updateMatch as updateMatchService,
} from '../services/matching';

interface MatchingState {
  matches: DonationMatch[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMatchesByDonor: (donorId: string) => Promise<void>;
  fetchMatchesByNgo: (ngoId: string) => Promise<void>;
  confirmAsDonor: (matchId: string) => Promise<void>;
  confirmAsNgo: (matchId: string) => Promise<void>;
  updateMatch: (id: string, updates: Partial<DonationMatch>) => Promise<void>;
  clearError: () => void;
}

export const useMatchingStore = create<MatchingState>((set, get) => ({
  matches: [],
  isLoading: false,
  error: null,

  fetchMatchesByDonor: async (donorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const matches = await getMatchesByDonor(donorId);
      set({ matches, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching donor matches:', error);
    }
  },

  fetchMatchesByNgo: async (ngoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const matches = await getMatchesByNgo(ngoId);
      set({ matches, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching NGO matches:', error);
    }
  },

  confirmAsDonor: async (matchId: string) => {
    set({ isLoading: true, error: null });
    try {
      await confirmMatchByDonor(matchId);

      // Update local state
      const matches = get().matches.map(m =>
        m.id === matchId
          ? { ...m, donorConfirmed: true, status: (m.ngoConfirmed ? 'both_confirmed' : 'donor_confirmed') as any }
          : m
      );

      set({ matches, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error confirming match as donor:', error);
      throw error;
    }
  },

  confirmAsNgo: async (matchId: string) => {
    set({ isLoading: true, error: null });
    try {
      await confirmMatchByNgo(matchId);

      // Update local state
      const matches = get().matches.map(m =>
        m.id === matchId
          ? { ...m, ngoConfirmed: true, status: (m.donorConfirmed ? 'both_confirmed' : 'ngo_confirmed') as any }
          : m
      );

      set({ matches, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error confirming match as NGO:', error);
      throw error;
    }
  },

  updateMatch: async (id: string, updates: Partial<DonationMatch>) => {
    set({ isLoading: true, error: null });
    try {
      await updateMatchService(id, updates);

      // Update local state
      const matches = get().matches.map(m =>
        m.id === id ? { ...m, ...updates } : m
      );

      set({ matches, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating match:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
