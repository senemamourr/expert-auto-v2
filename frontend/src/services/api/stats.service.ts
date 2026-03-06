// Service API pour les statistiques

import apiClient from './api.client';
import {
  KPIsResponse,
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

class StatsService {
  /**
   * Récupérer les KPIs pour le dashboard
   */
  async getKPIs(): Promise<KPIsResponse> {
    const response = await apiClient.get<KPIsResponse>('/stats/kpis');
    return response.data;
  }

  /**
   * Récupérer les revenus mensuels
   */
  async getRevenus(params?: RevenusParams): Promise<RevenusResponse> {
    const response = await apiClient.get<RevenusResponse>('/stats/revenus', {
      params: {
        annee: params?.annee || new Date().getFullYear(),
      },
    });
    return response.data;
  }

  /**
   * Récupérer le récapitulatif des honoraires
   */
  async getRecapHonoraires(params?: RecapHonorairesParams): Promise<RecapHonorairesResponse> {
    const response = await apiClient.get<RecapHonorairesResponse>('/stats/honoraires', {
      params,
    });
    return response.data;
  }

  /**
   * Récupérer les statistiques par bureau
   */
  async getStatsBureaux(): Promise<StatsBureauxResponse> {
    const response = await apiClient.get<StatsBureauxResponse>('/stats/bureaux');
    return response.data;
  }

  /**
   * Récupérer les statistiques par type de rapport
   */
  async getStatsTypes(): Promise<StatsTypesResponse> {
    const response = await apiClient.get<StatsTypesResponse>('/stats/types');
    return response.data;
  }

  /**
   * Récupérer l'évolution des rapports dans le temps
   */
  async getEvolution(params?: EvolutionParams): Promise<EvolutionResponse> {
    const response = await apiClient.get<EvolutionResponse>('/stats/evolution', {
      params: {
        periode: params?.periode || 'mois',
        nombre: params?.nombre || 12,
      },
    });
    return response.data;
  }

  /**
   * Récupérer les statistiques des véhicules (top marques et genres)
   */
  async getStatsVehicules(): Promise<StatsVehiculesResponse> {
    const response = await apiClient.get<StatsVehiculesResponse>('/stats/vehicules');
    return response.data;
  }
}

export default new StatsService();
