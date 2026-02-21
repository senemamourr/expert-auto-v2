import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';

export class User extends Model {
  declare id: string;
  declare email: string;
  declare password_hash: string;
  declare nom: string;
  declare prenom: string;
  declare role: 'admin' | 'expert' | 'assistant';
}

User.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  nom: { type: DataTypes.STRING, allowNull: false },
  prenom: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'expert', 'assistant'), defaultValue: 'expert' }
}, { sequelize, tableName: 'users', timestamps: true, underscored: true });

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
