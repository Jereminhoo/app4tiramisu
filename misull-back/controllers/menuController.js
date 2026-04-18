// controllers/menuController.js
const menuService = require('../services/menuService');

const getFullMenu = async (req, res) => {
  try {
    // On lance les 4 appels en même temps avec Promise.all
    const [tiramisus, tailles, supplements, gouts] = await Promise.all([
      menuService.getTiramisus(),
      menuService.getTailles(),
      menuService.getSupplements(),
      menuService.getGouts() // 👈 Ajout
    ]);

    res.json({ tiramisus, tailles, supplements, gouts });

  } catch (error) {
    console.error("Erreur menu complet :", error);
    res.status(500).json({ message: "Erreur lors de la récupération du menu" });
  }
};

module.exports = { getFullMenu };