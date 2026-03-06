// Store Zustand pour les barèmes

import { create } from 'zustand';
import baremesService from '../services/api/baremes.service';
import type { Bareme, BaremesResponse, CreateBaremeDTO, UpdateBaremeDTO } from '@/types';

interface BaremesState {
  baremes: BaremesResponse | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBaremes: () => Promise<void>;
  createBareme: (data: CreateBaremeDTO) => Promise<Bareme>;
  updateBareme: (id: string, data: UpdateBaremeDTO) => Promise<Bareme>;
  deleteBareme: (id: string) => Promise<void>;
  toggleBareme: (id: string) => Promise<Bareme>;
  clearError: () => void;
}

export const useBaremesStore = create<BaremesState>((set) => ({
  baremes: null,
  isLoading: false,
  error: null,

  fetchBaremes: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const baremes = await baremesService.getAll();
      set({ baremes, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement des barèmes',
        isLoading: false,
      });
      throw error;
    }
  },

  createBareme: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const bareme = await baremesService.create(data);
      
      // Recharger les barèmes
      const baremes = await baremesService.getAll();
      set({ baremes, isLoading: false });
      
      return bareme;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors de la création du barème',
        isLoading: false,
      });
      throw error;
    }
  },

  updateBareme: async (id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const bareme = await baremesService.update(id, data);
      
      // Recharger les barèmes
      const baremes = await baremesService.getAll();
      set({ baremes, isLoading: false });
      
      return bareme;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors de la mise à jour',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBareme: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await baremesService.delete(id);
      
      // Recharger les barèmes
      const baremes = await baremesService.getAll();
      set({ baremes, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors de la suppression',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleBareme: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const bareme = await baremesService.toggle(id);
      
      // Recharger les barèmes
      const baremes = await baremesService.getAll();
      set({ baremes, isLoading: false });
      
      return bareme;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du changement de statut',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
