// controllers/adminController.js
const adminService = require('../services/adminService');

// Récupère toutes les commandes
const getToutesCommandes = async (req, res) => {
  try {
    const commandes = await adminService.getToutesCommandes();
    res.json({ commandes });
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération commandes." });
  }
};

// Change le statut d'une commande
const changerStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const commande = await adminService.changerStatutCommande(id, statut);
    res.json({ message: 'Statut mis à jour.', commande });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupère tous les utilisateurs
const getTousUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await adminService.getTousUtilisateurs();
    res.json({ utilisateurs });
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération utilisateurs." });
  }
};

// Banni ou débanni un utilisateur
const toggleBannissement = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur = await adminService.toggleBannissement(id);
    res.json({
      message: utilisateur.estBanni ? 'Utilisateur banni.' : 'Utilisateur débanni.',
      utilisateur
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Ajoute un tiramisu au catalogue
const ajouterTiramisu = async (req, res) => {
  try {
    const { nom, description, listeIngredients } = req.body;
    if (!nom || !listeIngredients) {
      return res.status(400).json({ message: 'Nom et ingrédients obligatoires.' });
    }
    const tiramisu = await adminService.ajouterTiramisu(nom, description, listeIngredients);
    res.status(201).json({ message: 'Tiramisu ajouté !', tiramisu });
  } catch (error) {
    res.status(500).json({ message: "Erreur ajout tiramisu." });
  }
};

// Modifie un tiramisu
const modifierTiramisu = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, listeIngredients } = req.body;
    const tiramisu = await adminService.modifierTiramisu(id, nom, description, listeIngredients);
    res.json({ message: 'Tiramisu modifié !', tiramisu });
  } catch (error) {
    res.status(500).json({ message: "Erreur modification tiramisu." });
  }
};

// Supprime un tiramisu
const supprimerTiramisu = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.supprimerTiramisu(id);
    res.json({ message: 'Tiramisu supprimé.' });
  } catch (error) {
    res.status(500).json({ message: "Erreur suppression tiramisu." });
  }
};

module.exports = {
  getToutesCommandes,
  changerStatut,
  getTousUtilisateurs,
  toggleBannissement,
  ajouterTiramisu,
  modifierTiramisu,
  supprimerTiramisu,
};