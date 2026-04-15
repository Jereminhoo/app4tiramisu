const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
  try {
    // On extrait les 3 grosses infos du corps de la requête (le JSON de Postman)
    const { id_utilisateur, prixTotal, lignes } = req.body;

    // Petite sécurité : si le client n'envoie pas tout, on bloque et on renvoie une erreur
    if (!id_utilisateur || !prixTotal || !lignes || lignes.length === 0) {
      return res.status(400).json({ message: "Données de commande incomplètes." });
    }

    // On lance la fonction du service qu'on vient de voir juste au-dessus
    const nouvelleCommande = await orderService.createOrder(id_utilisateur, prixTotal, lignes);

    // Si ça passe, on répond avec un code 201 (Créé) et on affiche la commande
    res.status(201).json({
      message: "Commande validée avec succès !",
      commande: nouvelleCommande
    });

  } catch (error) {
    // S'il y a un crash, on l'affiche dans ton terminal Node.js
    console.error("Erreur création commande :", error);
    // Et on renvoie une erreur 500 (Problème serveur) au client
    res.status(500).json({ message: "Erreur lors de la validation de la commande." });
  }
};

module.exports = {
  createOrder
};