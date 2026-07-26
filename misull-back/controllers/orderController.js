// controllers/orderController.js
const orderService = require('../services/orderService');
const telegramService = require('../services/telegramService');

const createOrder = async (req, res) => {
  try {
    const id_utilisateur = req.utilisateur.id;
    // On récupère aussi dateRetrait et livraison envoyés par le frontend
    const { prixTotal, lignes, dateRetrait, livraison } = req.body;

    if (!prixTotal || !lignes || lignes.length === 0) {
      return res.status(400).json({ message: "Données de commande incomplètes." });
    }

    const nouvelleCommande = await orderService.createOrder(
      id_utilisateur,
      prixTotal,
      lignes,
      dateRetrait,
      livraison
    );

    // Notification Telegram après sauvegarde
    await telegramService.envoyerNotification(nouvelleCommande, req.utilisateur.pseudo);

    res.status(201).json({ message: "Commande validée !", commande: nouvelleCommande });

  } catch (error) {
    console.error("Erreur création commande :", error);
    // Si l'erreur vient de notre vérification de créneau (collision), elle a
    // un statusCode défini (409 Conflict). Sinon, c'est une vraie panne
    // serveur inattendue → on renvoie un 500 générique.
    const statusCode = error.statusCode || 500;
    const message = error.statusCode
      ? error.message
      : "Erreur lors de la validation de la commande.";
    res.status(statusCode).json({ message });
  }
};


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

const getStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await orderService.getStatut(id, req.utilisateur.id);
    res.json({ commande });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/orders/creneaux?date=2026-08-02
// Renvoie la liste des créneaux de livraison disponibles pour une date donnée
const getCreneaux = async (req, res) => {
  try {
    const { date } = req.query;

    // On vérifie qu'une date a bien été fournie
    if (!date) {
      return res.status(400).json({ message: "La date est requise." });
    }

    const creneaux = await orderService.getCreneauxDisponibles(date);
    res.json({ creneaux });
  } catch (error) {
    console.error("Erreur récupération créneaux :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des créneaux." });
  }
};

module.exports = { createOrder, getHistorique, annulerCommande, getStatut, getCreneaux };