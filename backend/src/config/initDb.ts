import { User, hashPassword } from '../models/User';

export async function initializeDatabase() {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      // Créer l'admin par défaut
      const hash = await hashPassword('admin123');
      await User.create({
        email: 'admin@expertise-auto.com',
        password_hash: hash,
        nom: 'Admin',
        prenom: 'Système',
        role: 'admin'
      });
      console.log('✅ Admin créé automatiquement: admin@expertise-auto.com / admin123');
    } else {
      console.log('ℹ️  Admin existe déjà');
    }
  } catch (error) {
    console.error('⚠️  Erreur initialisation DB:', error);
  }
}
