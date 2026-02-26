import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RapportAttributes {
  id: string;
  typeRapport: 'estimatif_reparation' | 'valeur_venale' | 'tierce_expertise';
  numeroOrdreService: string;
  bureauId: string;
  numeroSinistre: string;
  dateSinistre: Date;
  dateVisite: Date;
  statut: 'brouillon' | 'en_cours' | 'termine' | 'archive';
  montantTotal: number;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RapportCreationAttributes extends Optional<RapportAttributes, 'id' | 'montantTotal' | 'statut' | 'createdAt' | 'updatedAt'> {}

class Rapport extends Model<RapportAttributes, RapportCreationAttributes> implements RapportAttributes {
  public id!: string;
  public typeRapport!: 'estimatif_reparation' | 'valeur_venale' | 'tierce_expertise';
  public numeroOrdreService!: string;
  public bureauId!: string;
  public numeroSinistre!: string;
  public dateSinistre!: Date;
  public dateVisite!: Date;
  public statut!: 'brouillon' | 'en_cours' | 'termine' | 'archive';
  public montantTotal!: number;
  public userId!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Rapport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    typeRapport: {
      type: DataTypes.ENUM('estimatif_reparation', 'valeur_venale', 'tierce_expertise'),
      allowNull: false,
      comment: 'Type de rapport: Estimatif réparation, Valeur vénale, ou Tierce expertise',
    },
    numeroOrdreService: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Numéro d\'ordre de service',
    },
    bureauId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bureaux',
        key: 'id',
      },
      comment: 'Référence au bureau (compagnie d\'assurance)',
    },
    numeroSinistre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Numéro du sinistre',
    },
    dateSinistre: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Date du sinistre',
      validate: {
        isDate: true,
        isBefore: function(value: string) {
          if (new Date(value) > this.dateVisite) {
            throw new Error('La date du sinistre doit être antérieure à la date de visite');
          }
        },
      },
    },
    dateVisite: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date de la visite d\'expertise',
    },
    statut: {
      type: DataTypes.ENUM('brouillon', 'en_cours', 'termine', 'archive'),
      allowNull: false,
      defaultValue: 'brouillon',
      comment: 'Statut du rapport',
    },
    montantTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Montant total du rapport (calculé)',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'Expert ayant créé le rapport',
    },
  },
  {
    sequelize,
    tableName: 'rapports',
    underscored: true,
    timestamps: true,
  }
);

export default Rapport;
