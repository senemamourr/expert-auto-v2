// Service API pour les barèmes

import apiClient from './api.client';
import {
  Bareme,
  BaremesResponse,
  CreateBaremeDTO,
  UpdateBaremeDTO,
  BaremeFilters,
} from '../types/bareme.types';

class BaremesService {
  /**
   * Récupérer tous les barèmes (groupés par type)
   */
  async getAll(filters?: BaremeFilters): Promise<BaremesResponse> {
    const response = await apiClient.get<BaremesResponse>('/baremes', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Récupérer un barème par ID
   */
  async getById(id: string): Promise<Bareme> {
    const response = await apiClient.get<{ bareme: Bareme }>(`/baremes/${id}`);
    return response.data.bareme;
  }

  /**
   * Créer un nouveau barème
   */
  async create(data: CreateBaremeDTO): Promise<Bareme> {
    const response = await apiClient.post<{ bareme: Bareme }>('/baremes', data);
    return response.data.bareme;
  }

  /**
   * Mettre à jour un barème
   */
  async update(id: string, data: UpdateBaremeDTO): Promise<Bareme> {
    const response = await apiClient.put<{ bareme: Bareme }>(`/baremes/${id}`, data);
    return response.data.bareme;
  }

  /**
   * Supprimer un barème
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/baremes/${id}`);
  }

  /**
   * Toggle actif/inactif d'un barème
   */
  async toggle(id: string): Promise<Bareme> {
    const response = await apiClient.patch<{ bareme: Bareme }>(`/baremes/${id}/toggle`);
    return response.data.bareme;
  }
}

export default new BaremesService();
