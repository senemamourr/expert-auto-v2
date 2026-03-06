// Types pour le module Statistiques

import { StatutRapport } from './rapport.types';

export interface KPIs {
  totalRapports: number;
  montantTotal: number;
  honorairesTotal: number;
  rapportsMois: number;
  rapportsSemaine: number;
  statuts: {
    brouillon: number;
    en_cours: number;
    termine: number;
    archive: number;
  };
}

export interface KPIsResponse {
  kpis: KPIs;
}

export interface RevenuMensuel {
  mois: number;
  nom: string;
  total: number;
  nombreRapports: number;
}

export interface RevenusResponse {
  annee: number;
  revenus: RevenuMensuel[];
  totalAnnuel: number;
}

export interface RecapHonorairesDetail {
  rapportId: string;
  numeroSinistre: string;
  bureau: string;
  montantBase: number;
  fraisDeplacement: number;
  kilometres: number;
  total: number;
  date: string;
}

export interface RecapHonorairesResponse {
  type: 'quinzaine' | 'mensuel' | 'annuel';
  periode: string;
  dateDebut: string;
  dateFin: string;
  resume: {
    nombreRapports: number;
    totalHonoraires: number;
    totalFraisDeplacement: number;
    totalGeneral: number;
  };
  details: RecapHonorairesDetail[];
}

export interface StatBureau {
  bureau: {
    id: string;
    code: string;
    nom: string;
  };
  nombreRapports: number;
  montantTotal: number;
}

export interface StatsBureauxResponse {
  bureaux: StatBureau[];
  total: number;
}

export interface StatType {
  type: string;
  nombre: number;
  montantTotal: number;
}

export interface StatsTypesResponse {
  types: StatType[];
}

export interface EvolutionPoint {
  date: string;
  nombre: number;
}

export interface EvolutionResponse {
  periode: 'jour' | 'semaine' | 'mois';
  evolution: EvolutionPoint[];
}

export interface TopMarque {
  marque: string;
  nombre: number;
}

export interface TopGenre {
  genre: string;
  nombre: number;
}

export interface StatsVehiculesResponse {
  topMarques: TopMarque[];
  topGenres: TopGenre[];
}

// Paramètres de requête

export interface RevenusParams {
  annee?: number;
}

export interface RecapHonorairesParams {
  type?: 'quinzaine' | 'mensuel' | 'annuel';
  periode?: string; // Format: 2026-03 pour mensuel, 2026 pour annuel
}

export interface EvolutionParams {
  periode?: 'jour' | 'semaine' | 'mois';
  nombre?: number; // Nombre de périodes à retourner
}
