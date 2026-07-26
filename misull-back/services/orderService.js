// services/orderService.js
const prisma = require('../prisma/client');
const telegramService = require('./telegramService');

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

  await telegramService.envoyerAnnulation(commande.id_commande);

  return commandeAnnulee;
};

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
  if (commande.id_utilisateur !== id_utilisateur) throw new Error('Action non autorisée.');

  return commande;
};

// Génère un code de retrait unique de 6 caractères
// Ex: "A3F9K2" — facile à lire et à dicter à voix haute
const genererCodeRetrait = () => {
  // On utilise uniquement des lettres et chiffres faciles à lire
  // On évite 0/O et 1/I qui se ressemblent trop
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    // Math.random() donne un nombre entre 0 et 1
    // On multiplie par la longueur pour avoir un index aléatoire
    code += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return code;
};

// Crée une commande avec date de retrait et option livraison
const createOrder = async (id_utilisateur, prixTotal, lignes, dateRetrait, livraison) => {
  
    // Sécurité : on vérifie que la date demandée ne dépasse pas la fenêtre
  // de réservation autorisée (ex: max 7 jours à l'avance). Sans ça, un client
  // pourrait choisir une date bien après la période de disponibilité connue.
  if (dateRetrait) {
    const configService = require('./configService');
    const config = await configService.getConfig();
    const delaiMaxJours = parseInt(config.delaiMaxJours) || 7; // valeur de secours si absente

    const dateLimite = new Date();
    dateLimite.setDate(dateLimite.getDate() + delaiMaxJours);
    dateLimite.setHours(23, 59, 59, 999); // fin de la journée limite

    if (new Date(dateRetrait) > dateLimite) {
      const erreur = new Error(
        `Impossible de réserver plus de ${delaiMaxJours} jours à l'avance. Merci de choisir une date plus proche.`
      );
      erreur.statusCode = 400;
      throw erreur;
    }
  }
  
  return await prisma.$transaction(async (tx) => {

    // Sécurité anti-collision : si c'est une livraison , on revérifie
    // que le créneau est toujours libre au moment exact de la validation.
    // Ça empêche deux clients de réserver le même créneau s'ils valident
    // leur commande en même temps (le frontend affichait peut-être encore
    // "disponible" avant que l'autre client ait fini de commander).
    if (livraison && dateRetrait) {
      const dateChoisie = new Date(dateRetrait);
      const commandeExistante = await tx.commande.findFirst({
        where: {
          livraison: true,
          statut: { not: 'ANNULEE' },
          dateRetrait: dateChoisie, // même date ET même heure exacte
        },
      });

      if (commandeExistante) {
        // On attache un code HTTP 409 (Conflict) à l'erreur.
        // 409 = code standard pour "l'état actuel de la ressource
        // empêche l'opération demandée" — parfait pour ce cas précis.
        const erreur = new Error(
          "Ce créneau vient d'être réservé par quelqu'un d'autre. Merci d'en choisir un autre."
        );
        erreur.statusCode = 409;
        throw erreur;
      }
    }

    // On génère un code unique — on réessaie si collision (très rare)
    let codeRetrait;
    let codeUnique = false;
    while (!codeUnique) {
      codeRetrait = genererCodeRetrait();
      // On vérifie que le code n'existe pas déjà en BDD
      const existant = await tx.commande.findUnique({ where: { codeRetrait } });
      if (!existant) codeUnique = true;
    }

    const nouvelleCommande = await tx.commande.create({
      data: {
        id_utilisateur,
        prixTotal,
        dateRetrait: dateRetrait ? new Date(dateRetrait) : null,
        livraison: livraison || false,
        codeRetrait, // Code unique généré automatiquement
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

// Génère la liste des créneaux de livraison pour une date donnée
// et indique lesquels sont déjà pris par une commande existante.
// Retourne un tableau du style :
// [{ heureDebut: "18:00", heureFin: "18:20", disponible: true }, ...]
const getCreneauxDisponibles = async (dateString) => {
  // On récupère la config actuelle (plage horaire + durée des créneaux)
  const configService = require('./configService');
  const config = await configService.getConfig();

  const heureDebut = parseInt(config.livraisonHeureDebut);
  const heureFin = parseInt(config.livraisonHeureFin);
  const dureeCreneau = parseInt(config.livraisonDureeCreneau);

  // Bornes de la journée choisie, pour aller chercher les commandes de CE jour-là
  // Ex: si dateString = "2026-08-02", on veut tout ce qui est entre
  // 2026-08-02 00:00:00 et 2026-08-02 23:59:59
  const debutJournee = new Date(dateString);
  debutJournee.setHours(0, 0, 0, 0);
  const finJournee = new Date(dateString);
  finJournee.setHours(23, 59, 59, 999);

  // On récupère toutes les commandes de livraison déjà validées ce jour-là
  // (on exclut les commandes annulées, elles libèrent leur créneau)
  const commandesExistantes = await prisma.commande.findMany({
    where: {
      livraison: true,
      statut: { not: 'ANNULEE' },
      dateRetrait: {
        gte: debutJournee,
        lte: finJournee,
      },
    },
    select: { dateRetrait: true },
  });

  // On transforme les dates des commandes existantes en simples horaires "HH:MM"
  // pour pouvoir comparer facilement avec les créneaux générés
  const heuresPrises = commandesExistantes.map((commande) => {
    const d = new Date(commande.dateRetrait);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  // Génération des créneaux entre heureDebut et heureFin, par pas de dureeCreneau minutes
  const creneaux = [];
  let minutesCourantes = heureDebut * 60; // on travaille en minutes depuis minuit
  const minutesFin = heureFin * 60;

  while (minutesCourantes < minutesFin) {
    const debutH = Math.floor(minutesCourantes / 60);
    const debutM = minutesCourantes % 60;
    const finCreneauMinutes = minutesCourantes + dureeCreneau;
    const finH = Math.floor(finCreneauMinutes / 60);
    const finM = finCreneauMinutes % 60;

    const heureDebutStr = `${String(debutH).padStart(2, '0')}:${String(debutM).padStart(2, '0')}`;
    const heureFinStr = `${String(finH).padStart(2, '0')}:${String(finM).padStart(2, '0')}`;

    creneaux.push({
      heureDebut: heureDebutStr,
      heureFin: heureFinStr,
      // Un créneau est disponible seulement si aucune commande n'a déjà cette heure de début
      disponible: !heuresPrises.includes(heureDebutStr),
    });

    minutesCourantes += dureeCreneau;
  }

  return creneaux;
};
module.exports = { createOrder, getHistorique, annulerCommande, getStatut, genererCodeRetrait, getCreneauxDisponibles };