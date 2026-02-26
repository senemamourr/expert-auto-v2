import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface BaremeAttributes {
  id: string;
  type: 'taux_horaire' | 'vetuste' | 'deplacement' | 'honoraire';
  genreVehicule?: string;
  ageVehiculeMin?: number;
  ageVehiculeMax?: number;
  kmMin?: number;
  kmMax?: number;
  montantMin?: number;
  montantMax?: number;
  valeur: number;
  unite: string;
  actif: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BaremeCreationAttributes extends Optional<BaremeAttributes, 'id' | 'genreVehicule' | 'ageVehiculeMin' | 'ageVehiculeMax' | 'kmMin' | 'kmMax' | 'montantMin' | 'montantMax' | 'actif' | 'createdAt' | 'updatedAt'> {}

class Bareme extends Model<BaremeAttributes, BaremeCreationAttributes> implements BaremeAttributes {
  public id!: string;
  public type!: 'taux_horaire' | 'vetuste' | 'deplacement' | 'honoraire';
  public genreVehicule?: string;
  public ageVehiculeMin?: number;
  public ageVehiculeMax?: number;
  public kmMin?: number;
  public kmMax?: number;
  public montantMin?: number;
  public montantMax?: number;
  public valeur!: number;
  public unite!: string;
  public actif!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Bareme.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('taux_horaire', 'vetuste', 'deplacement', 'honoraire'),
      allowNull: false,
      comment: 'Type de barème',
    },
    genreVehicule: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Genre de véhicule (VP, VU, camion) pour taux horaire',
    },
    ageVehiculeMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Âge minimum du véhicule en années (pour vétusté)',
    },
    ageVehiculeMax: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Âge maximum du véhicule en années (pour vétusté)',
    },
    kmMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Kilomètres minimum (pour frais déplacement)',
    },
    kmMax: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Kilomètres maximum (pour frais déplacement)',
    },
    montantMin: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Montant minimum (pour honoraires)',
    },
    montantMax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Montant maximum (pour honoraires)',
    },
    valeur: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Valeur du barème',
    },
    unite: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Unité: FCFA, %, FCFA/km, etc',
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Barème actif ou non',
    },
  },
  {
    sequelize,
    tableName: 'baremes',
    underscored: true,
    timestamps: true,
  }
);

export default Bareme;
