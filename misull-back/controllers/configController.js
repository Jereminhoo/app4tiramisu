// controllers/configController.js
// Expose les routes pour lire et modifier la configuration.

const configService = require('../services/configService');

// GET /api/config — récupère toutes les configs
// Route publique : le frontend en a besoin pour valider les horaires
const getConfig = async (req, res) => {
  try {
    const config = await configService.getConfig();
    res.json({ config });
  } catch (error) {
    console.error('Erreur getConfig :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la config.' });
  }
};

// PUT /api/config — met à jour une ou plusieurs configs
// Route admin uniquement
const updateConfig = async (req, res) => {
  try {
    // On reçoit un objet avec les clés à mettre à jour
    // Ex: { heureOuverture: "13", heureFermeture: "20" }
    const configs = req.body;

    // On met à jour chaque clé en parallèle
    await Promise.all(
      Object.entries(configs).map(([cle, valeur]) =>
        configService.updateConfig(cle, valeur)
      )
    );

    // On renvoie la config complète mise à jour
    const configMiseAJour = await configService.getConfig();
    res.json({ message: 'Configuration mise à jour !', config: configMiseAJour });
  } catch (error) {
    console.error('Erreur updateConfig :', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la config.' });
  }
};

module.exports = { getConfig, updateConfig };