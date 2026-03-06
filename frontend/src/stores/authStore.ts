// Store Zustand pour l'authentification

import { create } from 'zustand';
import authService, { LoginCredentials, LoginResponse } from '../services/api/auth.service';

interface AuthState {
  user: LoginResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getCurrentUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login(credentials);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.error || 'Erreur de connexion',
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: () => {
    const isAuth = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    
    set({
      isAuthenticated: isAuth,
      user,
      token,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
