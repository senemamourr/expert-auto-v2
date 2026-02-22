import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Bureau extends Model {
  declare id: string;
  declare code: string;
  declare nomAgence: string;
  declare responsableSinistres: string;
  declare telephone: string;
  declare email: string;
  declare adresse: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

Bureau.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nomAgence: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'nom_agence'
  },
  responsableSinistres: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'responsable_sinistres'
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  adresse: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'bureaux',
  timestamps: true,
  underscored: true
});
