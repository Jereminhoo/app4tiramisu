/*
  Warnings:

  - The primary key for the `Utilisateur` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Utilisateur` table. All the data in the column will be lost.
  - Added the required column `motDePasse` to the `Utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Utilisateur_email_key";

-- AlterTable
ALTER TABLE "Utilisateur" DROP CONSTRAINT "Utilisateur_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "password",
ADD COLUMN     "estBanni" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "id_utilisateur" SERIAL NOT NULL,
ADD COLUMN     "motDePasse" TEXT NOT NULL,
ADD COLUMN     "pointsFidelite" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id_utilisateur");

-- CreateTable
CREATE TABLE "Tiramisu" (
    "id_tiramisu" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "listeIngredients" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Tiramisu_pkey" PRIMARY KEY ("id_tiramisu")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id_commande" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "prixTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id_commande")
);

-- CreateTable
CREATE TABLE "LigneCommande" (
    "id_ligne" SERIAL NOT NULL,
    "id_commande" INTEGER NOT NULL,
    "id_tiramisu" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "supplement" TEXT,

    CONSTRAINT "LigneCommande_pkey" PRIMARY KEY ("id_ligne")
);

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "Commande"("id_commande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_tiramisu_fkey" FOREIGN KEY ("id_tiramisu") REFERENCES "Tiramisu"("id_tiramisu") ON DELETE RESTRICT ON UPDATE CASCADE;
