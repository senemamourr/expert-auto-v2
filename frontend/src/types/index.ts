// Types pour l'application Expertise Auto
// Fichier fusionné : ancien + nouveaux types

// ============================================
// TYPES DE BASE (anciens - compatibilité)
// ============================================

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'expert' | 'assistant';
}

export interface Statistiques {
  totalRapports: number;
  rapportsMois: number;
  revenusMois: number;
  tauxRealisation: number;
}

// ============================================
// NOUVEAUX TYPES COMPLETS (depuis rapport.types.ts)
// ============================================

// Export tous les types détaillés des rapports
export * from './rapport.types';

// Export tous les types des barèmes
export * from './bareme.types';

// Export tous les types des statistiques détaillées
export * from './stats.types';

// Note: Les types Rapport, Vehicule, Bureau, etc. sont maintenant
// exportés depuis rapport.types.ts (versions plus complètes avec IDs, dates, etc.)
