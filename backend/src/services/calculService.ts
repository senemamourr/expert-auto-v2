import Bareme from '../models/Bareme';

/**
 * Service de calculs automatiques pour les rapports d'expertise
 * Utilise les barèmes configurés en base de données
 */

/**
 * Calcule le taux horaire selon le genre du véhicule
 */
export async function calculateTauxHoraire(genreVehicule: string): Promise<number> {
  try {
    const bareme = await Bareme.findOne({
      where: {
        type: 'taux_horaire',
        genreVehicule: genreVehicule,
        actif: true,
      },
    });

    if (!bareme) {
      console.warn(`Aucun barème taux horaire trouvé pour genre: ${genreVehicule}. Utilisation du taux par défaut.`);
      return 15000; // Taux par défaut
    }

    return parseFloat(bareme.valeur.toString());
  } catch (error) {
    console.error('Erreur calcul taux horaire:', error);
    return 15000; // Taux par défaut en cas d'erreur
  }
}

/**
 * Calcule le taux de vétusté selon l'âge du véhicule
 */
export async function calculateVetuste(dateMiseCirculation: Date): Promise<number> {
  try {
    const now = new Date();
    const ageEnAnnees = (now.getTime() - dateMiseCirculation.getTime()) / (1000 * 60 * 60 * 24 * 365);

    const bareme = await Bareme.findOne({
      where: {
        type: 'vetuste',
        actif: true,
      },
      order: [['ageVehiculeMin', 'ASC']],
    });

    // Trouver le barème approprié
    const baremes = await Bareme.findAll({
      where: {
        type: 'vetuste',
        actif: true,
      },
      order: [['ageVehiculeMin', 'ASC']],
    });

    for (const b of baremes) {
      const min = b.ageVehiculeMin || 0;
      const max = b.ageVehiculeMax || 999;
      
      if (ageEnAnnees >= min && ageEnAnnees < max) {
        return parseFloat(b.valeur.toString());
      }
    }

    // Si aucun barème trouvé, utiliser la dernière tranche
    const dernierBareme = baremes[baremes.length - 1];
    return dernierBareme ? parseFloat(dernierBareme.valeur.toString()) : 50;
  } catch (error) {
    console.error('Erreur calcul vétusté:', error);
    return 30; // Taux par défaut en cas d'erreur
  }
}

/**
 * Calcule les frais de déplacement selon les kilomètres parcourus
 */
export async function calculateFraisDeplacement(kilometres: number): Promise<number> {
  try {
    const baremes = await Bareme.findAll({
      where: {
        type: 'deplacement',
        actif: true,
      },
      order: [['kmMin', 'ASC']],
    });

    for (const bareme of baremes) {
      const min = bareme.kmMin || 0;
      const max = bareme.kmMax || 999999;

      if (kilometres >= min && kilometres < max) {
        const valeur = parseFloat(bareme.valeur.toString());
        
        // Si c'est un montant forfaitaire (FCFA)
        if (bareme.unite === 'FCFA') {
          return valeur;
        }
        
        // Si c'est un tarif au kilomètre (FCFA/km)
        if (bareme.unite === 'FCFA/km') {
          return valeur * kilometres;
        }
      }
    }

    // Aucun barème trouvé, utiliser un tarif par défaut
    return 500 * kilometres;
  } catch (error) {
    console.error('Erreur calcul frais déplacement:', error);
    return 500 * kilometres; // Tarif par défaut
  }
}

/**
 * Calcule les honoraires selon le montant du rapport
 */
export async function calculateHonoraires(montantBase: number): Promise<number> {
  try {
    const baremes = await Bareme.findAll({
      where: {
        type: 'honoraire',
        actif: true,
      },
      order: [['montantMin', 'ASC']],
    });

    for (const bareme of baremes) {
      const min = parseFloat((bareme.montantMin || 0).toString());
      const max = parseFloat((bareme.montantMax || 999999999).toString());

      if (montantBase >= min && montantBase < max) {
        return parseFloat(bareme.valeur.toString());
      }
    }

    // Aucun barème trouvé, utiliser un montant par défaut
    return 25000;
  } catch (error) {
    console.error('Erreur calcul honoraires:', error);
    return 25000; // Montant par défaut
  }
}

/**
 * Calcule le montant de la main d'œuvre
 */
export function calculateMainOeuvre(tempsReparation: number, tauxHoraire: number): number {
  return tempsReparation * tauxHoraire;
}

/**
 * Calcule le montant total d'un rapport
 */
export function calculateMontantTotal(
  montantMainOeuvre: number,
  montantFournitures: number,
  montantPeinture: number,
  tauxVetuste: number
): { sousTotal: number; montantVetuste: number; totalNet: number } {
  const sousTotal = montantMainOeuvre + montantFournitures + montantPeinture;
  const montantVetuste = (sousTotal * tauxVetuste) / 100;
  const totalNet = sousTotal - montantVetuste;

  return {
    sousTotal,
    montantVetuste,
    totalNet,
  };
}
