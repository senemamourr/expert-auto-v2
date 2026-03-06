// Service API pour les bureaux d'assurances

import axios from 'axios';
import type { Bureau } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://expert-auto-v2-production.up.railway.app';

// Fonction helper pour récupérer le token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const bureauxService = {
  /**
   * Récupérer tous les bureaux
   */
  async getAll(): Promise<Bureau[]> {
    const response = await axios.get(`${API_URL}/api/bureaux`, {
      headers: getAuthHeader(),
    });
    return response.data.bureaux || [];
  },

  /**
   * Récupérer un bureau par ID
   */
  async getById(id: string): Promise<Bureau> {
    const response = await axios.get(`${API_URL}/api/bureaux/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.bureau;
  },

  /**
   * Créer un nouveau bureau
   */
  async create(data: Omit<Bureau, 'id' | 'createdAt'>): Promise<Bureau> {
    const response = await axios.post(`${API_URL}/api/bureaux`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.data.bureau;
  },

  /**
   * Mettre à jour un bureau
   */
  async update(id: string, data: Partial<Bureau>): Promise<Bureau> {
    const response = await axios.put(`${API_URL}/api/bureaux/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return response.data.bureau;
  },

  /**
   * Supprimer un bureau
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/bureaux/${id}`, {
      headers: getAuthHeader(),
    });
  },
};
