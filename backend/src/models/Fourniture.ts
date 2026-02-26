import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface FournitureAttributes {
  id: string;
  chocId: string;
  designation: string;
  reference: string;
  famille: 'carrosserie' | 'mecanique' | 'electrique' | 'pneumatique' | 'vitrage' | 'autre';
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FournitureCreationAttributes extends Optional<FournitureAttributes, 'id' | 'reference' | 'famille' | 'prixTotal' | 'createdAt' | 'updatedAt'> {}

class Fourniture extends Model<FournitureAttributes, FournitureCreationAttributes> implements FournitureAttributes {
  public id!: string;
  public chocId!: string;
  public designation!: string;
  public reference!: string;
  public famille!: 'carrosserie' | 'mecanique' | 'electrique' | 'pneumatique' | 'vitrage' | 'autre';
  public quantite!: number;
  public prixUnitaire!: number;
  public prixTotal!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Fourniture.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    chocId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chocs',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Référence au choc',
    },
    designation: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Désignation de la pièce/fourniture',
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
      comment: 'Référence fabricant de la pièce',
    },
    famille: {
      type: DataTypes.ENUM('carrosserie', 'mecanique', 'electrique', 'pneumatique', 'vitrage', 'autre'),
      allowNull: false,
      defaultValue: 'autre',
      comment: 'Famille de la pièce',
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Quantité',
      validate: {
        min: 1,
      },
    },
    prixUnitaire: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Prix unitaire',
      validate: {
        min: 0,
      },
    },
    prixTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Prix total (quantite × prix unitaire)',
    },
  },
  {
    sequelize,
    tableName: 'fournitures',
    underscored: true,
    timestamps: true,
    hooks: {
      beforeSave: (fourniture: Fourniture) => {
        // Calcul automatique du prix total
        fourniture.prixTotal = fourniture.quantite * fourniture.prixUnitaire;
      },
    },
  }
);

export default Fourniture;
