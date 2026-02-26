import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AssureAttributes {
  id: string;
  rapportId: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AssureCreationAttributes extends Optional<AssureAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Assure extends Model<AssureAttributes, AssureCreationAttributes> implements AssureAttributes {
  public id!: string;
  public rapportId!: string;
  public nom!: string;
  public prenom!: string;
  public telephone!: string;
  public adresse!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Assure.init(
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
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nom de l\'assuré',
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Prénom de l\'assuré',
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Numéro de téléphone',
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Adresse complète',
    },
  },
  {
    sequelize,
    tableName: 'assures',
    underscored: true,
    timestamps: true,
  }
);

export default Assure;
