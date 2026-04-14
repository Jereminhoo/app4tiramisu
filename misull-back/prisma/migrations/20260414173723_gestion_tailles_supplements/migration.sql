/*
  Warnings:

  - You are about to drop the column `supplement` on the `LigneCommande` table. All the data in the column will be lost.
  - You are about to drop the column `prix` on the `Tiramisu` table. All the data in the column will be lost.
  - Added the required column `id_taille` to the `LigneCommande` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LigneCommande" DROP COLUMN "supplement",
ADD COLUMN     "id_taille" INTEGER NOT NULL,
ALTER COLUMN "quantite" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Tiramisu" DROP COLUMN "prix";

-- CreateTable
CREATE TABLE "Taille" (
    "id_taille" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Taille_pkey" PRIMARY KEY ("id_taille")
);

-- CreateTable
CREATE TABLE "Supplement" (
    "id_supplement" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL DEFAULT 0.80,

    CONSTRAINT "Supplement_pkey" PRIMARY KEY ("id_supplement")
);

-- CreateTable
CREATE TABLE "_LigneToSupplement" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LigneToSupplement_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LigneToSupplement_B_index" ON "_LigneToSupplement"("B");

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_taille_fkey" FOREIGN KEY ("id_taille") REFERENCES "Taille"("id_taille") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LigneToSupplement" ADD CONSTRAINT "_LigneToSupplement_A_fkey" FOREIGN KEY ("A") REFERENCES "LigneCommande"("id_ligne") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LigneToSupplement" ADD CONSTRAINT "_LigneToSupplement_B_fkey" FOREIGN KEY ("B") REFERENCES "Supplement"("id_supplement") ON DELETE CASCADE ON UPDATE CASCADE;
