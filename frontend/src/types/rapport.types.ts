// Types pour le module Rapports
// Basé sur les modèles Sequelize du backend

export type StatutRapport = 'brouillon' | 'en_cours' | 'termine' | 'archive';
export type TypeRapport = 'estimatif_reparation' | 'valeur_venale' | 'tierce_expertise';

export interface Rapport {
  id: string;
  typeRapport: TypeRapport;
  numeroOrdreService: string;
  bureauId: string;
  numeroSinistre: string;
  dateSinistre: string;
  dateVisite: string;
  statut: StatutRapport;
  montantTotal: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  bureau?: Bureau;
  user?: User;
  vehicule?: Vehicule;
  assure?: Assure;
  chocs?: Choc[];
  honoraire?: Honoraire;
}

export interface Bureau {
  id: string;
  code: string;
  nomAgence: string;
  responsableSinistres: string;
  telephone: string;
  email: string;
  adresse: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role?: string;
}

export interface Vehicule {
  id: string;
  rapportId: string;
  marque: string;
  type: string;
  genre: 'VP' | 'VU' | 'camion' | 'moto';
  immatriculation: string;
  numeroChassis?: string;
  kilometrage: number;
  dateMiseCirculation: string;
  couleur?: string;
  sourceEnergie?: string;
  puissanceFiscale?: number;
  valeurNeuve?: number;
  chargeUtile?: number;
  tauxHoraire: number;
  tauxVetuste: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assure {
  id: string;
  rapportId: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Choc {
  id: string;
  rapportId: string;
  nomChoc: string;
  description?: string;
  modeleVehiculeSvg?: string;
  tempsReparation: number;
  montantPeinture: number;
  ordre: number;
  fournitures?: Fourniture[];
  createdAt: string;
  updatedAt: string;
}

export interface Fourniture {
  id: string;
  chocId: string;
  designation: string;
  reference?: string;
  famille: 'carrosserie' | 'mecanique' | 'electrique' | 'peinture' | 'autre';
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Honoraire {
  id: string;
  rapportId: string;
  montantBase: number;
  avecVetuste: boolean;
  fraisDeplacement: number;
  kilometres: number;
  montantTotal: number;
  createdAt: string;
  updatedAt: string;
}

// DTOs pour création/modification

export interface CreateRapportDTO {
  typeRapport: TypeRapport;
  numeroOrdreService: string;
  bureauId: string;
  numeroSinistre: string;
  dateSinistre: string;
  dateVisite: string;
  vehicule: CreateVehiculeDTO;
  assure: CreateAssureDTO;
  chocs: CreateChocDTO[];
  honoraire: CreateHonoraireDTO;
}

export interface CreateVehiculeDTO {
  marque: string;
  type: string;
  genre: 'VP' | 'VU' | 'camion' | 'moto';
  immatriculation: string;
  numeroChassis?: string;
  kilometrage: number;
  dateMiseCirculation: string;
  couleur?: string;
  sourceEnergie?: string;
  puissanceFiscale?: number;
  valeurNeuve?: number;
  chargeUtile?: number;
}

export interface CreateAssureDTO {
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
}

export interface CreateChocDTO {
  nomChoc: string;
  description?: string;
  modeleVehiculeSvg?: string;
  tempsReparation: number;
  montantPeinture: number;
  fournitures: CreateFournitureDTO[];
}

export interface CreateFournitureDTO {
  designation: string;
  reference?: string;
  famille: 'carrosserie' | 'mecanique' | 'electrique' | 'peinture' | 'autre';
  quantite: number;
  prixUnitaire: number;
}

export interface CreateHonoraireDTO {
  montantBase: number;
  avecVetuste: boolean;
  kilometres: number;
}

export interface UpdateRapportDTO {
  typeRapport?: TypeRapport;
  numeroOrdreService?: string;
  dateVisite?: string;
  statut?: StatutRapport;
  vehicule?: Partial<CreateVehiculeDTO>;
  assure?: Partial<CreateAssureDTO>;
}

// Réponses API

export interface ListeRapportsResponse {
  rapports: Rapport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RapportResponse {
  rapport: Rapport;
  message?: string;
}

// Filtres

export interface RapportsFilters {
  page?: number;
  limit?: number;
  statut?: StatutRapport;
  typeRapport?: TypeRapport;
  bureauId?: string;
  numeroSinistre?: string;
}
