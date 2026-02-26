import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface HonoraireAttributes {
  id: string;
  rapportId: string;
  montantBase: number;
  avecVetuste: boolean;
  fraisDeplacement: number;
  kilometres: number;
  montantTotal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface HonoraireCreationAttributes extends Optional<HonoraireAttributes, 'id' | 'avecVetuste' | 'fraisDeplacement' | 'kilometres' | 'montantTotal' | 'createdAt' | 'updatedAt'> {}

class Honoraire extends Model<HonoraireAttributes, HonoraireCreationAttributes> implements HonoraireAttributes {
  public id!: string;
  public rapportId!: string;
  public montantBase!: number;
  public avecVetuste!: boolean;
  public fraisDeplacement!: number;
  public kilometres!: number;
  public montantTotal!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Honoraire.init(
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
    montantBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Montant de base pour le calcul',
      validate: {
        min: 0,
      },
    },
    avecVetuste: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Base de calcul avec ou sans vétusté',
    },
    fraisDeplacement: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Frais de déplacement calculés selon km',
      validate: {
        min: 0,
      },
    },
    kilometres: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Nombre de kilomètres parcourus',
      validate: {
        min: 0,
      },
    },
    montantTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Montant total des honoraires',
    },
  },
  {
    sequelize,
    tableName: 'honoraires',
    underscored: true,
    timestamps: true,
  }
);

export default Honoraire;
