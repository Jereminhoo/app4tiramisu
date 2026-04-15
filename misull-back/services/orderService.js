const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Toujours la même connexion à la base de données
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const createOrder = async (id_utilisateur, prixTotal, lignes) => {
  // prisma.commande.create va insérer une nouvelle ligne dans la table Commande
  return await prisma.commande.create({
    data: {
      id_utilisateur: id_utilisateur, // On lie la commande au bon client
      prixTotal: prixTotal,           // On enregistre le prix final

      // Prisma est assez intelligent pour créer les lignes de commande en même temps
      lignes: {
        // On fait une boucle (map) sur le panier envoyé par le client
        create: lignes.map((ligne) => ({
          id_tiramisu: ligne.id_tiramisu, // On enregistre le dessert
          id_taille: ligne.id_taille,     // On enregistre la taille
          quantite: ligne.quantite,       // On enregistre la quantité
          
          // Et pour chaque ligne, on lie les suppléments choisis
          supplements: {
            // "connect" dit à Prisma : "ces suppléments existent déjà, fais juste le lien"
            connect: ligne.supplements.map((id_supp) => ({ id_supplement: id_supp }))
          }
        }))
      }
    },
    // On demande à Prisma de nous renvoyer la commande complète avec ses lignes et suppléments
    // pour vérifier que tout a bien été enregistré
    include: {
      lignes: {
        include: {
          supplements: true 
        }
      }
    }
  });
};

module.exports = {
  createOrder
};