// Types pour le module Barèmes

export type TypeBareme = 'taux_horaire' | 'vetuste' | 'deplacement' | 'honoraire';

export interface Bareme {
  id: string;
  type: TypeBareme;
  genreVehicule?: 'VP' | 'VU' | 'camion' | 'moto';
  ageVehiculeMin?: number;
  ageVehiculeMax?: number;
  kmMin?: number;
  kmMax?: number;
  montantMin?: number;
  montantMax?: number;
  valeur: number;
  unite: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BaremesResponse {
  baremes: {
    taux_horaire: Bareme[];
    vetuste: Bareme[];
    deplacement: Bareme[];
    honoraire: Bareme[];
  };
  total: number;
}

export interface CreateBaremeDTO {
  type: TypeBareme;
  genreVehicule?: 'VP' | 'VU' | 'camion' | 'moto';
  ageVehiculeMin?: number;
  ageVehiculeMax?: number;
  kmMin?: number;
  kmMax?: number;
  montantMin?: number;
  montantMax?: number;
  valeur: number;
  unite: string;
  actif?: boolean;
}

export interface UpdateBaremeDTO {
  genreVehicule?: 'VP' | 'VU' | 'camion' | 'moto';
  ageVehiculeMin?: number;
  ageVehiculeMax?: number;
  kmMin?: number;
  kmMax?: number;
  montantMin?: number;
  montantMax?: number;
  valeur?: number;
  unite?: string;
  actif?: boolean;
}

export interface BaremeFilters {
  type?: TypeBareme;
  actif?: boolean;
}
