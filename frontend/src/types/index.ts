// Types pour l'application Expertise Auto

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'expert' | 'assistant';
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
}

export interface Vehicule {
  marque: string;
  type: string;
  genre: 'VP' | 'VU' | 'Camion' | 'Moto';
  immatriculation: string;
  numeroChasis: string;
  kilometrage: number;
  dateMiseCirculation: string;
  couleur: string;
  sourceEnergie: string;
  puissanceFiscale: number;
  valeurNeuve: number;
}

export interface Assure {
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
}

export interface Fourniture {
  designation: string;
  reference: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
}

export interface Choc {
  nomChoc: string;
  description: string;
  modeleVehiculeSvg?: string;
  tempsReparation: number;
  tauxHoraire: number;
  montantPeinture: number;
  ordre: number;
  fournitures: Fourniture[];
}

export interface Rapport {
  id?: string;
  typeRapport: 'estimatif_reparation' | 'valeur_venale' | 'tierce_expertise';
  numeroOrdreService: string;
  bureauId: string;
  numeroSinistre: string;
  dateSinistre: string;
  dateVisite: string;
  statut?: 'brouillon' | 'en_cours' | 'termine' | 'archive';
  montantTotal?: number;
  vehicule: Vehicule;
  assure: Assure;
  chocs: Choc[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Statistiques {
  totalRapports: number;
  rapportsMois: number;
  revenusMois: number;
  tauxRealisation: number;
}
