// Script d'initialisation de la base de données
// Exécuter avec: node src/scripts/setup-database.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Début de l\'initialisation de la base de données...\n');

    // ============================================
    // TABLE 1 : UTILISATEURS
    // ============================================
    console.log('📝 Création table utilisateurs...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nom VARCHAR(255) NOT NULL,
        prenom VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'expert' CHECK (role IN ('admin', 'expert', 'comptable')),
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email)`);
    
    // Utilisateur admin (mot de passe hashé: Admin@2024)
    await client.query(`
      INSERT INTO utilisateurs (email, password_hash, nom, prenom, role)
      VALUES (
        'admin@expertise-auto.com',
        '$2b$10$xQHqXVZ5Z5Z5Z5Z5Z5Z5ZuK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
        'Admin',
        'Système',
        'admin'
      )
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('✅ Table utilisateurs créée\n');

    // ============================================
    // TABLE 2 : BUREAUX
    // ============================================
    console.log('📝 Création table bureaux...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS bureaux (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        nom_agence VARCHAR(255) NOT NULL,
        responsable_sinistres VARCHAR(255) NOT NULL,
        telephone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        adresse TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bureaux_code ON bureaux(code)`);
    
    // Bureaux de test
    await client.query(`
      INSERT INTO bureaux (code, nom_agence, responsable_sinistres, telephone, email, adresse)
      VALUES 
        ('DKR001', 'AXA Dakar Centre', 'Fatou NDIAYE', '+221 77 123 45 67', 'dakar@axa.sn', 'Avenue Senghor, Dakar'),
        ('DKR002', 'NSIA Assurances Plateau', 'Moussa DIOP', '+221 77 234 56 78', 'plateau@nsia.sn', 'Rue de la République, Dakar'),
        ('THI001', 'Allianz Thiès', 'Ibrahima SARR', '+221 77 345 67 89', 'thies@allianz.sn', 'Avenue Lamine Guèye, Thiès')
      ON CONFLICT (code) DO NOTHING
    `);
    console.log('✅ Table bureaux créée\n');

    // ============================================
    // TABLE 3 : RAPPORTS
    // ============================================
    console.log('📝 Création table rapports...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rapports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        numero_ordre_service VARCHAR(50) NOT NULL,
        numero_sinistre VARCHAR(50) NOT NULL,
        type_rapport VARCHAR(50) NOT NULL CHECK (type_rapport IN ('estimatif_reparation', 'valeur_venale', 'tierce_expertise')),
        date_visite DATE NOT NULL,
        statut VARCHAR(20) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_cours', 'termine', 'archive')),
        bureau_id UUID REFERENCES bureaux(id) ON DELETE RESTRICT,
        vehicule_genre VARCHAR(50),
        vehicule_marque VARCHAR(100),
        vehicule_modele VARCHAR(100),
        vehicule_immatriculation VARCHAR(50),
        vehicule_chassis VARCHAR(100),
        vehicule_date_mec DATE,
        vehicule_kilometrage INTEGER,
        assure_nom VARCHAR(255),
        assure_prenom VARCHAR(255),
        assure_telephone VARCHAR(50),
        assure_adresse TEXT,
        montant_pieces DECIMAL(10,2) DEFAULT 0,
        montant_main_oeuvre DECIMAL(10,2) DEFAULT 0,
        montant_peinture DECIMAL(10,2) DEFAULT 0,
        montant_fournitures DECIMAL(10,2) DEFAULT 0,
        montant_total DECIMAL(10,2) DEFAULT 0,
        honoraires_base DECIMAL(10,2) DEFAULT 0,
        honoraires_deplacement DECIMAL(10,2) DEFAULT 0,
        honoraires_total DECIMAL(10,2) DEFAULT 0,
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rapports_bureau_id ON rapports(bureau_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rapports_statut ON rapports(statut)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rapports_numero_sinistre ON rapports(numero_sinistre)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rapports_date_visite ON rapports(date_visite)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rapports_created_at ON rapports(created_at)`);
    
    // Rapports de test
    const bureaux = await client.query('SELECT id, code FROM bureaux');
    if (bureaux.rows.length > 0) {
      const bureau1 = bureaux.rows.find(b => b.code === 'DKR001')?.id;
      const bureau2 = bureaux.rows.find(b => b.code === 'DKR002')?.id;
      const bureau3 = bureaux.rows.find(b => b.code === 'THI001')?.id;

      if (bureau1 && bureau2 && bureau3) {
        await client.query(`
          INSERT INTO rapports (
            numero_ordre_service, numero_sinistre, type_rapport, date_visite,
            bureau_id, statut, vehicule_genre, vehicule_marque, vehicule_modele,
            vehicule_immatriculation, assure_nom, assure_prenom,
            montant_pieces, montant_main_oeuvre, montant_peinture, montant_fournitures, montant_total,
            honoraires_base, honoraires_deplacement, honoraires_total, observations
          ) VALUES 
            (
              'OS-2024-001', 'SIN-2024-12345', 'estimatif_reparation', CURRENT_DATE,
              $1, 'brouillon', 'VP', 'Toyota', 'Corolla', 'DK-1234-AB',
              'DIOP', 'Moussa', 85000, 45000, 20000, 5000, 155000,
              25000, 0, 25000, 'Choc avant gauche, remplacement pare-choc et phare'
            ),
            (
              'OS-2024-002', 'SIN-2024-12346', 'valeur_venale', CURRENT_DATE - INTERVAL '2 days',
              $2, 'termine', 'VP', 'Peugeot', '208', 'DK-5678-CD',
              'NDIAYE', 'Fatou', 120000, 80000, 35000, 8000, 243000,
              30000, 5000, 35000, 'Expertise complète - Véhicule accidenté'
            ),
            (
              'OS-2024-003', 'SIN-2024-12347', 'estimatif_reparation', CURRENT_DATE - INTERVAL '5 days',
              $3, 'en_cours', 'VU', 'Renault', 'Kangoo', 'DK-9012-EF',
              'SARR', 'Ibrahima', 95000, 55000, 25000, 6000, 181000,
              27000, 3000, 30000, 'Choc latéral droit'
            )
          ON CONFLICT DO NOTHING
        `, [bureau1, bureau2, bureau3]);
      }
    }
    console.log('✅ Table rapports créée\n');

    // ============================================
    // TABLE 4 : CHOCS
    // ============================================
    console.log('📝 Création table chocs...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS chocs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rapport_id UUID REFERENCES rapports(id) ON DELETE CASCADE,
        zone VARCHAR(100) NOT NULL,
        gravite VARCHAR(20) CHECK (gravite IN ('leger', 'moyen', 'grave')),
        description TEXT,
        position_x DECIMAL(5,2),
        position_y DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chocs_rapport_id ON chocs(rapport_id)`);
    console.log('✅ Table chocs créée\n');

    // ============================================
    // TABLE 5 : FOURNITURES
    // ============================================
    console.log('📝 Création table fournitures...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fournitures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rapport_id UUID REFERENCES rapports(id) ON DELETE CASCADE,
        designation VARCHAR(255) NOT NULL,
        quantite DECIMAL(10,2) NOT NULL,
        prix_unitaire DECIMAL(10,2) NOT NULL,
        prix_total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_fournitures_rapport_id ON fournitures(rapport_id)`);
    console.log('✅ Table fournitures créée\n');

    // ============================================
    // TABLE 6 : BAREMES
    // ============================================
    console.log('📝 Création table baremes...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS baremes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type_bareme VARCHAR(50) NOT NULL CHECK (type_bareme IN ('honoraires_base', 'deplacement_km', 'main_oeuvre_heure')),
        tranche_min DECIMAL(10,2),
        tranche_max DECIMAL(10,2),
        montant DECIMAL(10,2) NOT NULL,
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_baremes_type ON baremes(type_bareme)`);
    
    await client.query(`
      INSERT INTO baremes (type_bareme, tranche_min, tranche_max, montant)
      VALUES 
        ('honoraires_base', 0, 100000, 25000),
        ('honoraires_base', 100001, 500000, 35000),
        ('honoraires_base', 500001, 1000000, 50000),
        ('honoraires_base', 1000001, 999999999, 75000),
        ('deplacement_km', 0, 999999, 500),
        ('main_oeuvre_heure', 0, 999999, 5000)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Table baremes créée\n');

    // ============================================
    // VÉRIFICATIONS
    // ============================================
    console.log('📊 Vérification des données...\n');
    
    const counts = await client.query(`
      SELECT 'utilisateurs' as table_name, COUNT(*) as count FROM utilisateurs
      UNION ALL SELECT 'bureaux', COUNT(*) FROM bureaux
      UNION ALL SELECT 'rapports', COUNT(*) FROM rapports
      UNION ALL SELECT 'chocs', COUNT(*) FROM chocs
      UNION ALL SELECT 'fournitures', COUNT(*) FROM fournitures
      UNION ALL SELECT 'baremes', COUNT(*) FROM baremes
    `);

    console.log('Comptage des enregistrements:');
    counts.rows.forEach(row => {
      console.log(`  - ${row.table_name}: ${row.count}`);
    });

    console.log('\n✅ BASE DE DONNÉES INITIALISÉE AVEC SUCCÈS ! 🎉\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécution
setupDatabase()
  .then(() => {
    console.log('✨ Script terminé avec succès !');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Échec du script:', error);
    process.exit(1);
  });
