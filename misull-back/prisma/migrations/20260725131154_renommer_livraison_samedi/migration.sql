/*
  Warnings:

  - You are about to drop the column `livraisonSamedi` on the `Commande` table. All the data in the column will be lost.

*/
-- Renomme la colonne livraisonSamedi en livraison, sans perdre les données existantes
ALTER TABLE "Commande" RENAME COLUMN "livraisonSamedi" TO "livraison";