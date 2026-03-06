// Service API pour l'authentification

import apiClient from './api.client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: string;
  };
}

export interface LogoutResponse {
  message: string;
}

class AuthService {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Sauvegarder le token et les infos user
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<LogoutResponse>('/auth/logout');
    } catch (error) {
      // Continuer même si l'appel échoue
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le storage local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Récupérer le token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Récupérer les infos de l'utilisateur connecté
   */
  getCurrentUser(): LoginResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

export default new AuthService();
