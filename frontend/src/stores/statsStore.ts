// Store Zustand pour les statistiques

import { create } from 'zustand';
import statsService from '../services/api/stats.service';
import {
  KPIs,
  RevenusResponse,
  RecapHonorairesResponse,
  StatsBureauxResponse,
  StatsTypesResponse,
  EvolutionResponse,
  StatsVehiculesResponse,
  RevenusParams,
  RecapHonorairesParams,
  EvolutionParams,
} from '../types/stats.types';

interface StatsState {
  kpis: KPIs | null;
  revenus: RevenusResponse | null;
  recapHonoraires: RecapHonorairesResponse | null;
  statsBureaux: StatsBureauxResponse | null;
  statsTypes: StatsTypesResponse | null;
  evolution: EvolutionResponse | null;
  statsVehicules: StatsVehiculesResponse | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchKPIs: () => Promise<void>;
  fetchRevenus: (params?: RevenusParams) => Promise<void>;
  fetchRecapHonoraires: (params?: RecapHonorairesParams) => Promise<void>;
  fetchStatsBureaux: () => Promise<void>;
  fetchStatsTypes: () => Promise<void>;
  fetchEvolution: (params?: EvolutionParams) => Promise<void>;
  fetchStatsVehicules: () => Promise<void>;
  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  kpis: null,
  revenus: null,
  recapHonoraires: null,
  statsBureaux: null,
  statsTypes: null,
  evolution: null,
  statsVehicules: null,
  isLoading: false,
  error: null,

  fetchKPIs: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await statsService.getKPIs();
      set({ kpis: response.kpis, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement des KPIs',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchRevenus: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await statsService.getRevenus(params);
      set({ revenus: response, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement des revenus',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchRecapHonoraires: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await statsService.getRecapHonoraires(params);
      set({ recapHonoraires: response, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement du récapitulatif',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchStatsBureaux: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await statsService.getStatsBureaux();
      set({ statsBureaux: response, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement des stats bureaux',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchStatsTypes: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await statsService.getStatsTypes();
      set({ statsTypes: response, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement des stats types',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchEvolution: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await statsService.getEvolution(params);
      set({ evolution: response, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement de l\'évolution',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchStatsVehicules: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await statsService.getStatsVehicules();
      set({ statsVehicules: response, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erreur lors du chargement des stats véhicules',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
