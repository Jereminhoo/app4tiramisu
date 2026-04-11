const menu = {
  categories: [
    {
      id: "classique",
      nom: "Tiramisu Classique",
      gouts: ["Oreo", "Spéculoos", "Petit Beurre"]
    },
    {
      id: "tiracrepes",
      nom: "Tira-crêpes",
      gouts: ["Oreo", "Spéculoos", "Petit Beurre"]
    }
  ],
  tailles: [
    { nom: "Petite 450ml", prix: 3.5 },
    { nom: "Moyen 750ml", prix: 5.5 },
    { nom: "Grand 1000ml", prix: 7.0 }
  ],
  supplements: [
    { nom: "Kinder Bueno", prix: 0.80 },
    { nom: "Nutella", prix: 0.80 },
    { nom: "Spéculoos fondu", prix: 0.80 },
    { nom: "M&M's", prix: 0.80 }
  ]
};

module.exports = menu;