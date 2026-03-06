// Store Zustand pour les rapports

import { create } from 'zustand';
import rapportsService from '../services/api/rapports.service';
import type {
  Rapport,
  CreateRapportDTO,
  UpdateRapportDTO,
  RapportsFilters,
  StatutRapport,
} from '@/types';

interface RapportsState {
  rapports: Rapport[];
  currentRapport: Rapport | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: RapportsFilters;
  
  // Actions
  fetchRapports: (filters?: RapportsFilters) => Promise<void>;
  fetchRapportById: (id: string) => Promise<void>;
  searchBySinistre: (numeroSinistre: string) => Promise<Rapport[]>;
  createRapport: (data: CreateRapportDTO) => Promise<Rapport>;
  updateRapport: (id: string, data: UpdateRapportDTO) => Promise<Rapport>;
  deleteRapport: (id: string) => Promise<void>;
  updateStatut: (id: string, statut: StatutRapport) => Promise<void>;
  setFilters: (filters: RapportsFilters) => void;
  clearCurrentRapport: () => void;
  clearError: () => void;
}

export const useRapportsStore = create<RapportsState>((set, get) => ({
  rapports: [],
  currentRapport: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,
  filters: {},

  fetchRapports: async (filters) => {
    set({ isLoading: true, error: null });
    
    try {
      const mergedFilters = { ...get().filters, ...filters };
      const response = await rapportsService.getAll(mergedFilters);
      
      set({
        rapports: response.rapports,
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.totalPages,
        filters: mergedFilters,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement des rapports',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchRapportById: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const rapport = await rapportsService.getById(id);
      
      set({
        currentRapport: rapport,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement du rapport',
        isLoading: false,
      });
      throw error;
    }
  },

  searchBySinistre: async (numeroSinistre) => {
    set({ isLoading: true, error: null });
    
    try {
      const rapports = await rapportsService.getBySinistre(numeroSinistre);
      set({ isLoading: false });
      return rapports;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors de la recherche',
        isLoading: false,
      });
      throw error;
    }
  },

  createRapport: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const rapport = await rapportsService.create(data);
      
      // Ajouter le nouveau rapport à la liste
      set((state) => ({
        rapports: [rapport, ...state.rapports],
        total: state.total + 1,
        isLoading: false,
      }));
      
      return rapport;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors de la création du rapport',
        isLoading: false,
      });
      throw error;
    }
  },

  updateRapport: async (id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const rapport = await rapportsService.update(id, data);
      
      // Mettre à jour dans la liste
      set((state) => ({
        rapports: state.rapports.map((r) => (r.id === id ? rapport : r)),
        currentRapport: state.currentRapport?.id === id ? rapport : state.currentRapport,
        isLoading: false,
      }));
      
      return rapport;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors de la mise à jour',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteRapport: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await rapportsService.delete(id);
      
      // Retirer de la liste
      set((state) => ({
        rapports: state.rapports.filter((r) => r.id !== id),
        total: state.total - 1,
        currentRapport: state.currentRapport?.id === id ? null : state.currentRapport,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors de la suppression',
        isLoading: false,
      });
      throw error;
    }
  },

  updateStatut: async (id, statut) => {
    try {
      await get().updateRapport(id, { statut });
    } catch (error) {
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  clearCurrentRapport: () => {
    set({ currentRapport: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
