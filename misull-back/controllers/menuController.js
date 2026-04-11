const menuData = require('../data/menu');

exports.getMenu = (req, res) => {
  // On renvoie simplement les données du menu en format JSON
  res.status(200).json(menuData);
};