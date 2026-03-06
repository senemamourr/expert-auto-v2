// Client API Axios configuré avec intercepteurs

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'https://expert-auto-v2-production.up.railway.app';

// Créer l'instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête : ajouter le token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Erreur avec réponse du serveur
      switch (error.response.status) {
        case 401:
          // Non authentifié - rediriger vers login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        
        case 403:
          // Non autorisé
          console.error('Accès refusé');
          break;
        
        case 404:
          console.error('Ressource non trouvée');
          break;
        
        case 500:
          console.error('Erreur serveur');
          break;
        
        default:
          console.error('Erreur API:', error.response.data);
      }
    } else if (error.request) {
      // Erreur réseau
      console.error('Erreur réseau - pas de réponse du serveur');
    } else {
      // Autre erreur
      console.error('Erreur:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Types pour les erreurs API
export interface ApiError {
  error: string;
  details?: string;
  message?: string;
}

// Helper pour extraire le message d'erreur
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.error || apiError?.message || 'Une erreur est survenue';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Une erreur inconnue est survenue';
};
