import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à CHAQUE requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur SANS redirection automatique
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // On ne redirige PAS automatiquement, on laisse les composants gérer l'erreur
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Bureaux Service
export const bureauxService = {
  async getAll() {
    try {
      const response = await api.get('/bureaux');
      return response.data.bureaux || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Routes bureaux pas encore installées sur le backend');
        return [];
      }
      throw error;
    }
  },
  
  async getById(id: string) {
    const response = await api.get('/bureaux/' + id);
    return response.data.bureau;
  },
  
  async create(data: any) {
    const response = await api.post('/bureaux', data);
    return response.data.bureau;
  },
  
  async update(id: string, data: any) {
    const response = await api.put('/bureaux/' + id, data);
    return response.data.bureau;
  },
  
  async delete(id: string) {
    const response = await api.delete('/bureaux/' + id);
    return response.data;
  }
};

// Rapports Service
export const rapportsService = {
  async getAll() {
    try {
      const response = await api.get('/rapports');
      return response.data.rapports || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Routes rapports pas encore installées');
        return [];
      }
      throw error;
    }
  },
  
  async getById(id: string) {
    const response = await api.get('/rapports/' + id);
    return response.data.rapport;
  },
  
  async create(data: any) {
    const response = await api.post('/rapports', data);
    return response.data.rapport;
  },
  
  async update(id: string, data: any) {
    const response = await api.put('/rapports/' + id, data);
    return response.data.rapport;
  },
  
  async delete(id: string) {
    const response = await api.delete('/rapports/' + id);
    return response.data;
  }
};

// Stats Service
export const statsService = {
  async get() {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      console.log('Stats pas disponibles');
      return {
        totalRapports: 0,
        rapportsMois: 0,
        revenusMois: 0,
        totalBureaux: 0
      };
    }
  }
};
