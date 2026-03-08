import { create } from 'zustand';
import { rapportsService } from '@/services/api/rapports.service';

interface Rapport {
  id: string;
  numeroOrdreService: string;
  numeroSinistre: string;
  typeRapport: string;
  dateVisite: string;
  statut: string;
  bureauId: string;
  bureauCode?: string;
  bureauNom?: string;
  montantTotal: number;
  honorairesTotal?: number;
  createdAt: string;
}

interface RapportsState {
  rapports: Rapport[];
  currentRapport: Rapport | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRapports: (params?: any) => Promise<void>;
  fetchRapportById: (id: string) => Promise<void>;
  createRapport: (data: any) => Promise<void>;
  updateRapport: (id: string, data: any) => Promise<void>;
  deleteRapport: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useRapportsStore = create<RapportsState>((set, get) => ({
  rapports: [],
  currentRapport: null,
  loading: false,
  error: null,

  fetchRapports: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await rapportsService.getRapports(params);
      set({ 
        rapports: data.rapports || [],
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Erreur lors du chargement des rapports',
        loading: false 
      });
    }
  },

  fetchRapportById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const data = await rapportsService.getRapportById(id);
      set({ 
        currentRapport: data.rapport,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Erreur lors du chargement du rapport',
        loading: false 
      });
    }
  },

  createRapport: async (rapportData: any) => {
    set({ loading: true, error: null });
    try {
      await rapportsService.createRapport(rapportData);
      // Recharger la liste
      await get().fetchRapports();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Erreur lors de la création du rapport',
        loading: false 
      });
      throw error;
    }
  },

  updateRapport: async (id: string, rapportData: any) => {
    set({ loading: true, error: null });
    try {
      await rapportsService.updateRapport(id, rapportData);
      // Recharger la liste
      await get().fetchRapports();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Erreur lors de la mise à jour du rapport',
        loading: false 
      });
      throw error;
    }
  },

  deleteRapport: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await rapportsService.deleteRapport(id);
      // Retirer le rapport de la liste
      set(state => ({
        rapports: state.rapports.filter(r => r.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Erreur lors de la suppression du rapport',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
