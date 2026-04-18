// controllers/orderController.js
const orderService = require('../services/orderService');
const telegramService = require('../services/telegramService'); // Ajout

const createOrder = async (req, res) => {
  try {
    const id_utilisateur = req.utilisateur.id;
    const { prixTotal, lignes } = req.body;

    if (!prixTotal || !lignes || lignes.length === 0) {
      return res.status(400).json({ message: "Données de commande incomplètes." });
    }

    const nouvelleCommande = await orderService.createOrder(id_utilisateur, prixTotal, lignes);

    // On envoie la notification Telegram APRÈS avoir sauvegardé la commande
    // On passe le pseudo depuis le token pour l'afficher dans le message
    await telegramService.envoyerNotification(nouvelleCommande, req.utilisateur.pseudo);

    res.status(201).json({ message: "Commande validée !", commande: nouvelleCommande });

  } catch (error) {
    console.error("Erreur création commande :", error);
    res.status(500).json({ message: "Erreur lors de la validation de la commande." });
  }
};

// Récupère l'historique des commandes du client connecté
const getHistorique = async (req, res) => {
  try {
    const id_utilisateur = req.utilisateur.id;
    const commandes = await orderService.getHistorique(id_utilisateur);
    res.json({ commandes });
  } catch (error) {
    console.error("Erreur historique :", error);
    res.status(500).json({ message: "Erreur lors de la récupération de l'historique." });
  }
};

// Annule une commande dans le délai de 30 minutes
const annulerCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const id_utilisateur = req.utilisateur.id;
    const commande = await orderService.annulerCommande(id, id_utilisateur);
    res.json({ message: 'Commande annulée avec succès.', commande });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupère le statut d'une commande
const getStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await orderService.getStatut(id, req.utilisateur.id);
    res.json({ commande });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createOrder, getHistorique, annulerCommande, getStatut };