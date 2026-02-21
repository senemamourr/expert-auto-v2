import { Sequelize } from 'sequelize';
const DATABASE_URL = process.env.DATABASE_URL || '';
export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false }
});
export async function connectDatabase() {
  await sequelize.authenticate();
  console.log('✅ Database connected');
  await sequelize.sync();
}
