import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { User, hashPassword } from './models/User';

dotenv.config();

async function seed() {
  await sequelize.sync({ force: true });
  const hash = await hashPassword('admin123');
  await User.create({
    email: 'admin@expertise-auto.com',
    password_hash: hash,
    nom: 'Admin',
    prenom: 'Système',
    role: 'admin'
  });
  console.log('✅ Admin créé: admin@expertise-auto.com / admin123');
  process.exit(0);
}

seed();
