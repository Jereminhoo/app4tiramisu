// prisma/seed.js
// Remplit la base de données avec les données de départ nécessaires
// au bon fonctionnement du site (catalogue, tailles, config...).
// Utilisé uniquement lors d'une installation fraîche (nouvelle BDD).

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Remplissage de la base de données...');

  // ── Tailles et prix (mis à jour avec les prix actuels en production) ──
  await prisma.taille.createMany({
    data: [
      { nom: 'Petite 450ml', prix: 4.00 },
      { nom: 'Moyen 750ml', prix: 6.50 },
      { nom: 'Grand 1000ml', prix: 8.50 }
    ]
  });

  // ── Suppléments (prix actuel : 1€ par garniture) ──
  await prisma.supplement.createMany({
    data: [
      { nom: 'Kinder Bueno', prix: 1.00 },
      { nom: 'Nutella', prix: 1.00 },
      { nom: 'Spéculoos fondu', prix: 1.00 },
      { nom: "M&M's", prix: 1.00 }
    ]
  });

  await prisma.tiramisu.createMany({
    data: [
      {
        nom: 'Tiramisu Classique',
        description: 'La recette traditionnelle maison sans alcool ni café',
        listeIngredients: 'Mascarpone, sucre, oeufs, sucre vanillé, lait, biscuits'
      },
      {
        nom: 'Tira-crêpes',
        description: "L'alliance gourmande du tiramisu et des crêpes maison",
        listeIngredients: 'Farine, oeufs, lait, sucre, Mascarpone, sucre vanillé'
      }
    ]
  });

// Boudoir est moins cher à produire, d'où le modificateurPrix négatif
  await prisma.gout.createMany({
    data: [
      { nom: 'Oreo' },
      { nom: 'Spéculoos' },
      { nom: 'Petit Beurre' },
      { nom: 'Boudoir', modificateurPrix: -1.00 }
    ]
  });
  
  // ── Configuration par défaut ──
  // Ces valeurs sont modifiables ensuite depuis l'onglet Configuration de l'admin,
  // mais il faut qu'elles existent dès le départ pour que le site fonctionne.
  await prisma.config.createMany({
    data: [
      { cle: 'heureOuverture', valeur: '15' },
      { cle: 'heureFermeture', valeur: '23' },
      { cle: 'delaiMinJours', valeur: '1' },
      { cle: 'delaiMaxJours', valeur: '7' },
      { cle: 'livraisonActive', valeur: 'true' },
      { cle: 'livraisonHeureDebut', valeur: '18' },
      { cle: 'livraisonHeureFin', valeur: '22' },
      { cle: 'livraisonDureeCreneau', valeur: '20' },
    ]
  });

  console.log('Base de données remplie !');
}

main()
  .catch((e) => {
    console.error('Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });