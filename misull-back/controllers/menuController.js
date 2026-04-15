const menuService = require('../services/menuService');

const getFullMenu = async (req, res) => {
  try {
    // On lance les 3 appels en même temps
    const [tiramisus, tailles, supplements] = await Promise.all([
      menuService.getTiramisus(),
      menuService.getTailles(),
      menuService.getSupplements()
    ]);

    // On renvoie un seul objet qui contient tout
    res.json({
      tiramisus,
      tailles,
      supplements
    });
  } catch (error) {
    console.error("Erreur menu complet :", error);
    res.status(500).json({ message: "Erreur lors de la récupération du menu" });
  }
};

module.exports = {
  getFullMenu
};