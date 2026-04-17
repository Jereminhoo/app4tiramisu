// controllers/orderController.js
const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
  try {
    // 🔐 On prend l'id depuis le TOKEN, pas depuis le body
    // req.utilisateur a été attaché par le middleware verifierToken
    // Un utilisateur ne peut donc plus passer une commande au nom de quelqu'un d'autre
    const id_utilisateur = req.utilisateur.id;

    const { prixTotal, lignes } = req.body; // On retire id_utilisateur du body

    if (!prixTotal || !lignes || lignes.length === 0) {
      return res.status(400).json({ message: "Données de commande incomplètes." });
    }

    const nouvelleCommande = await orderService.createOrder(id_utilisateur, prixTotal, lignes);

    res.status(201).json({
      message: "Commande validée avec succès !",
      commande: nouvelleCommande
    });

  } catch (error) {
    console.error("Erreur création commande :", error);
    res.status(500).json({ message: "Erreur lors de la validation de la commande." });
  }
};

module.exports = {
  createOrder
};