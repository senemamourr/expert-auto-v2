import { Bureau } from './models/Bureau';
import { connectDatabase } from './config/database';

const bureauxData = [
  {
    code: 'AXA001',
    nomAgence: 'AXA Assurances Dakar',
    responsableSinistres: 'Amadou Diallo',
    telephone: '+221 33 123 45 67',
    email: 'sinistres@axa-senegal.sn',
    adresse: 'Avenue Léopold Sédar Senghor, Dakar, Sénégal'
  },
  {
    code: 'ALLIANZ01',
    nomAgence: 'Allianz Sénégal',
    responsableSinistres: 'Fatou Ndiaye',
    telephone: '+221 33 234 56 78',
    email: 'sinistres@allianz.sn',
    adresse: 'Place de l\'Indépendance, Dakar'
  },
  {
    code: 'AMSA01',
    nomAgence: 'AMSA Assurances',
    responsableSinistres: 'Moussa Sarr',
    telephone: '+221 33 345 67 89',
    email: 'sinistres@amsa.sn',
    adresse: 'Boulevard de la République, Dakar'
  },
  {
    code: 'SUNU01',
    nomAgence: 'SUNU Assurances',
    responsableSinistres: 'Aïssatou Fall',
    telephone: '+221 33 456 78 90',
    email: 'sinistres@sunu.sn',
    adresse: 'Rue Carnot, Dakar'
  },
  {
    code: 'ASKIA01',
    nomAgence: 'Askia Assurances',
    responsableSinistres: 'Cheikh Sy',
    telephone: '+221 33 567 89 01',
    email: 'sinistres@askia.sn',
    adresse: 'Avenue Georges Pompidou, Dakar'
  }
];

async function seedBureaux() {
  try {
    await connectDatabase();
    
    console.log('🌱 Création des bureaux de test...');
    
    for (const bureauData of bureauxData) {
      const existing = await Bureau.findOne({ where: { code: bureauData.code } });
      
      if (!existing) {
        await Bureau.create(bureauData);
        console.log('✅ Bureau créé:', bureauData.code, '-', bureauData.nomAgence);
      } else {
        console.log('ℹ️  Bureau existe déjà:', bureauData.code);
      }
    }
    
    console.log('🎉 Seed bureaux terminé !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur seed bureaux:', error);
    process.exit(1);
  }
}

seedBureaux();
