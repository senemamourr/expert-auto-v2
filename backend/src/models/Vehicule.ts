import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface VehiculeAttributes {
  id: string;
  rapportId: string;
  marque: string;
  type: string;
  genre: 'VP' | 'VU' | 'camion' | 'moto' | 'autre';
  immatriculation: string;
  numeroChassis: string;
  kilometrage: number;
  dateMiseCirculation: Date;
  couleur: string;
  sourceEnergie: 'essence' | 'diesel' | 'electrique' | 'hybride' | 'gpl';
  puissanceFiscale: number;
  valeurNeuve: number;
  chargeUtile?: number;
  tauxHoraire: number;
  tauxVetuste: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VehiculeCreationAttributes extends Optional<VehiculeAttributes, 'id' | 'tauxHoraire' | 'tauxVetuste' | 'chargeUtile' | 'createdAt' | 'updatedAt'> {}

class Vehicule extends Model<VehiculeAttributes, VehiculeCreationAttributes> implements VehiculeAttributes {
  public id!: string;
  public rapportId!: string;
  public marque!: string;
  public type!: string;
  public genre!: 'VP' | 'VU' | 'camion' | 'moto' | 'autre';
  public immatriculation!: string;
  public numeroChassis!: string;
  public kilometrage!: number;
  public dateMiseCirculation!: Date;
  public couleur!: string;
  public sourceEnergie!: 'essence' | 'diesel' | 'electrique' | 'hybride' | 'gpl';
  public puissanceFiscale!: number;
  public valeurNeuve!: number;
  public chargeUtile?: number;
  public tauxHoraire!: number;
  public tauxVetuste!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vehicule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rapportId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'rapports',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Référence au rapport',
    },
    marque: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Marque du véhicule (ex: Peugeot, Renault)',
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Type/modèle du véhicule (ex: 308, Clio)',
    },
    genre: {
      type: DataTypes.ENUM('VP', 'VU', 'camion', 'moto', 'autre'),
      allowNull: false,
      comment: 'Genre: VP (Véhicule Particulier), VU (Véhicule Utilitaire), camion, moto',
    },
    immatriculation: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Numéro d\'immatriculation',
    },
    numeroChassis: {
      type: DataTypes.STRING(17),
      allowNull: false,
      comment: 'Numéro de chassis (VIN - 17 caractères)',
      validate: {
        len: [17, 17],
      },
    },
    kilometrage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Kilométrage du véhicule',
      validate: {
        min: 0,
      },
    },
    dateMiseCirculation: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Date de 1ère mise en circulation',
    },
    couleur: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Couleur du véhicule',
    },
    sourceEnergie: {
      type: DataTypes.ENUM('essence', 'diesel', 'electrique', 'hybride', 'gpl'),
      allowNull: false,
      comment: 'Source d\'énergie',
    },
    puissanceFiscale: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Puissance fiscale (CV)',
      validate: {
        min: 1,
      },
    },
    valeurNeuve: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Valeur à neuf du véhicule',
      validate: {
        min: 0,
      },
    },
    chargeUtile: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Charge utile (pour VU et camions) en kg',
    },
    tauxHoraire: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Taux horaire main d\'oeuvre (calculé selon genre)',
    },
    tauxVetuste: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Taux de vétusté en % (calculé selon âge)',
    },
  },
  {
    sequelize,
    tableName: 'vehicules',
    underscored: true,
    timestamps: true,
  }
);

export default Vehicule;
