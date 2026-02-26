import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ChocAttributes {
  id: string;
  rapportId: string;
  nomChoc: string;
  description: string;
  modeleVehiculeSvg?: string;
  tempsReparation: number;
  montantPeinture: number;
  ordre: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ChocCreationAttributes extends Optional<ChocAttributes, 'id' | 'description' | 'modeleVehiculeSvg' | 'montantPeinture' | 'ordre' | 'createdAt' | 'updatedAt'> {}

class Choc extends Model<ChocAttributes, ChocCreationAttributes> implements ChocAttributes {
  public id!: string;
  public rapportId!: string;
  public nomChoc!: string;
  public description!: string;
  public modeleVehiculeSvg?: string;
  public tempsReparation!: number;
  public montantPeinture!: number;
  public ordre!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Choc.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rapportId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rapports',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Référence au rapport',
    },
    nomChoc: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nom du choc: 1er degré, 2ème degré, 3ème degré, TOL, MEC, BDG, DIAG',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      comment: 'Description détaillée du choc',
    },
    modeleVehiculeSvg: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dessin du choc sur le modèle de véhicule (SVG ou coordonnées)',
    },
    tempsReparation: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Temps de réparation estimé en heures',
      validate: {
        min: 0,
      },
    },
    montantPeinture: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Montant de la peinture pour ce choc',
      validate: {
        min: 0,
      },
    },
    ordre: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Ordre d\'affichage (pour chocs multiples)',
    },
  },
  {
    sequelize,
    tableName: 'chocs',
    underscored: true,
    timestamps: true,
  }
);

export default Choc;
