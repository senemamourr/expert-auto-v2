import axios from 'axios';
import type { User, Bureau, Rapport, Statistiques } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Auth
export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  logout() {
    localStorage.removeItem('token');
  }
};

// Bureaux
export const bureauxService = {
  async getAll(): Promise<Bureau[]> {
    const { data } = await api.get('/bureaux');
    return data.bureaux || data;
  },
  async getById(id: string): Promise<Bureau> {
    const { data } = await api.get('/bureaux/' + id);
    return data.bureau || data;
  },
  async create(bureau: Omit<Bureau, 'id'>): Promise<Bureau> {
    const { data } = await api.post('/bureaux', bureau);
    return data.bureau || data;
  },
  async update(id: string, bureau: Partial<Bureau>): Promise<Bureau> {
    const { data } = await api.put('/bureaux/' + id, bureau);
    return data.bureau || data;
  },
  async delete(id: string): Promise<void> {
    await api.delete('/bureaux/' + id);
  }
};

// Rapports
export const rapportsService = {
  async getAll(): Promise<Rapport[]> {
    const { data } = await api.get('/rapports');
    return data.rapports || data;
  },
  async getById(id: string): Promise<Rapport> {
    const { data } = await api.get('/rapports/' + id);
    return data.rapport || data;
  },
  async create(rapport: Rapport): Promise<Rapport> {
    const { data } = await api.post('/rapports', rapport);
    return data.rapport || data;
  },
  async update(id: string, rapport: Partial<Rapport>): Promise<Rapport> {
    const { data } = await api.put('/rapports/' + id, rapport);
    return data.rapport || data;
  },
  async delete(id: string): Promise<void> {
    await api.delete('/rapports/' + id);
  },
  async getBySinistre(numeroSinistre: string): Promise<Rapport[]> {
    const { data } = await api.get('/rapports?sinistre=' + numeroSinistre);
    return data.rapports || data;
  }
};

// Statistiques
export const statsService = {
  async get(): Promise<Statistiques> {
    const { data } = await api.get('/stats/revenus');
    return data;
  }
};
