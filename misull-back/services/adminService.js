// services/adminService.js
// Toutes les opérations réservées à l'administrateur

const prisma = require('../prisma/client');

// Récupère TOUTES les commandes avec les détails
const getToutesCommandes = async () => {
  return await prisma.commande.findMany({
    orderBy: { dateCreation: 'desc' },
    include: {
      // On inclut le pseudo de l'utilisateur pour savoir qui a commandé
      utilisateur: {
        select: { pseudo: true, id_utilisateur: true }
      },
      lignes: {
        include: {
          tiramisu: true,
          taille: true,
          gout: true, 
          supplements: true
        }
      }
    }
  });
};

const changerStatutCommande = async (id_commande, statut) => {
  const statutsAutorises = ['EN_ATTENTE', 'EN_PREPARATION', 'PRETE', 'LIVREE', 'ANNULEE'];
  if (!statutsAutorises.includes(statut)) {
    throw new Error('Statut invalide.');
  }

  // On utilise une transaction car on fait potentiellement 2 opérations
  return await prisma.$transaction(async (tx) => {

    // On met à jour le statut de la commande
    const commande = await tx.commande.update({
      where: { id_commande: parseInt(id_commande) },
      data: { statut },
      // On inclut les lignes pour calculer le nombre de tiramisus
      include: {
        lignes: true
      }
    });

    // Si le statut passe à LIVREE → on ajoute les points de fidélité
    if (statut === 'LIVREE') {
      // On calcule le nombre total de tiramisus livrés
      const totalTiramisus = commande.lignes.reduce(
        (total, ligne) => total + ligne.quantite, 0
      );

      // On ajoute les points à l'utilisateur
      await tx.utilisateur.update({
        where: { id_utilisateur: commande.id_utilisateur },
        data: {
          // increment ajoute directement la valeur sans avoir à récupérer l'ancienne
          pointsFidelite: { increment: totalTiramisus }
        }
      });
    }

    return commande;
  });
};

// Récupère tous les utilisateurs (sans leurs mots de passe !)
const getTousUtilisateurs = async () => {
  return await prisma.utilisateur.findMany({
    select: {
      id_utilisateur: true,
      pseudo: true,
      role: true,
      pointsFidelite: true,
      estBanni: true,
    },
    orderBy: { id_utilisateur: 'asc' }
  });
};

// Banni ou débanni un utilisateur
const toggleBannissement = async (id_utilisateur) => {
  // On récupère l'état actuel
  const user = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: parseInt(id_utilisateur) }
  });

  if (!user) throw new Error('Utilisateur introuvable.');

  // On ne peut pas bannir un admin !
  if (user.role === 'ADMIN') throw new Error('Impossible de bannir un administrateur.');

  // On inverse l'état : banni → débanni, débanni → banni
  return await prisma.utilisateur.update({
    where: { id_utilisateur: parseInt(id_utilisateur) },
    data: { estBanni: !user.estBanni }
  });
};

// ── CRUD CATALOGUE ──

// Ajoute un nouveau tiramisu
const ajouterTiramisu = async (nom, description, listeIngredients) => {
  return await prisma.tiramisu.create({
    data: { nom, description, listeIngredients }
  });
};

// Modifie un tiramisu existant
const modifierTiramisu = async (id_tiramisu, nom, description, listeIngredients) => {
  return await prisma.tiramisu.update({
    where: { id_tiramisu: parseInt(id_tiramisu) },
    data: { nom, description, listeIngredients }
  });
};

// Supprime un tiramisu
const supprimerTiramisu = async (id_tiramisu) => {
  return await prisma.tiramisu.delete({
    where: { id_tiramisu: parseInt(id_tiramisu) }
  });
};

module.exports = {
  getToutesCommandes,
  changerStatutCommande,
  getTousUtilisateurs,
  toggleBannissement,
  ajouterTiramisu,
  modifierTiramisu,
  supprimerTiramisu,
};