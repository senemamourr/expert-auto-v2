// Service API pour les rapports

import apiClient from './api.client';
import {
  Rapport,
  ListeRapportsResponse,
  RapportResponse,
  CreateRapportDTO,
  UpdateRapportDTO,
  RapportsFilters,
} from '../types/rapport.types';

class RapportsService {
  /**
   * Récupérer la liste des rapports avec filtres et pagination
   */
  async getAll(filters?: RapportsFilters): Promise<ListeRapportsResponse> {
    const response = await apiClient.get<ListeRapportsResponse>('/rapports', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Récupérer un rapport par ID
   */
  async getById(id: string): Promise<Rapport> {
    const response = await apiClient.get<RapportResponse>(`/rapports/${id}`);
    return response.data.rapport;
  }

  /**
   * Rechercher les rapports par numéro de sinistre
   */
  async getBySinistre(numeroSinistre: string): Promise<Rapport[]> {
    const response = await apiClient.get<{ rapports: Rapport[]; count: number }>(
      `/rapports/sinistre/${numeroSinistre}`
    );
    return response.data.rapports;
  }

  /**
   * Créer un nouveau rapport
   */
  async create(data: CreateRapportDTO): Promise<Rapport> {
    const response = await apiClient.post<RapportResponse>('/rapports', data);
    return response.data.rapport;
  }

  /**
   * Mettre à jour un rapport
   */
  async update(id: string, data: UpdateRapportDTO): Promise<Rapport> {
    const response = await apiClient.put<RapportResponse>(`/rapports/${id}`, data);
    return response.data.rapport;
  }

  /**
   * Supprimer un rapport
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/rapports/${id}`);
  }

  /**
   * Recalculer le montant total d'un rapport
   */
  async recalculate(id: string): Promise<Rapport> {
    const response = await apiClient.post<RapportResponse>(`/rapports/${id}/calculate`);
    return response.data.rapport;
  }

  /**
   * Changer le statut d'un rapport
   */
  async updateStatut(
    id: string,
    statut: 'brouillon' | 'en_cours' | 'termine' | 'archive'
  ): Promise<Rapport> {
    return this.update(id, { statut });
  }
}

export default new RapportsService();
