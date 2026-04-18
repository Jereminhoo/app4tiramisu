// services/orderService.js
const prisma = require('../prisma/client');
const telegramService = require('./telegramService');

// Crée une commande
const createOrder = async (id_utilisateur, prixTotal, lignes) => {
  return await prisma.$transaction(async (tx) => {
    const nouvelleCommande = await tx.commande.create({
      data: {
        id_utilisateur,
        prixTotal,
        lignes: {
          create: lignes.map((ligne) => ({
            id_tiramisu: ligne.id_tiramisu,
            id_taille: ligne.id_taille,
            id_gout: ligne.id_gout,
            quantite: ligne.quantite,
            supplements: {
              connect: ligne.supplements.map((id_supp) => ({ id_supplement: id_supp }))
            }
          }))
        }
      },
      include: {
        lignes: {
          include: {
            supplements: true,
            tiramisu: true,
            taille: true,
            gout: true,
          }
        }
      }
    });
    return nouvelleCommande;
  });
};

// Récupère toutes les commandes d'un utilisateur avec le détail
const getHistorique = async (id_utilisateur) => {
  return await prisma.commande.findMany({
    where: { id_utilisateur },
    orderBy: { dateCreation: 'desc' },
    include: {
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

// Annule une commande si elle a moins de 30 minutes
const annulerCommande = async (id_commande, id_utilisateur) => {
  const commande = await prisma.commande.findUnique({
    where: { id_commande: parseInt(id_commande) }
  });

  if (!commande) throw new Error('Commande introuvable.');
  if (commande.id_utilisateur !== id_utilisateur) throw new Error('Action non autorisée.');
  if (commande.statut === 'ANNULEE') throw new Error('Cette commande est déjà annulée.');

  const diffMinutes = (new Date() - new Date(commande.dateCreation)) / 1000 / 60;
  if (diffMinutes > 30) throw new Error('Le délai de 30 minutes pour annuler est dépassé.');

  const commandeAnnulee = await prisma.commande.update({
    where: { id_commande: parseInt(id_commande) },
    data: { statut: 'ANNULEE' }
  });

  // Notification Telegram d'annulation
  await telegramService.envoyerAnnulation(commande.id_commande);

  return commandeAnnulee;
};

// Récupère le statut d'une commande
const getStatut = async (id_commande, id_utilisateur) => {
  const commande = await prisma.commande.findUnique({
    where: { id_commande: parseInt(id_commande) },
    select: {
      id_commande: true,
      statut: true,
      dateCreation: true,
      id_utilisateur: true,
    }
  });

  if (!commande) throw new Error('Commande introuvable.');
  // Sécurité : on vérifie que la commande appartient à l'utilisateur
  if (commande.id_utilisateur !== id_utilisateur) throw new Error('Action non autorisée.');

  return commande;
};

module.exports = { createOrder, getHistorique, annulerCommande, getStatut };