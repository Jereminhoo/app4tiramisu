/*
  Warnings:

  - Added the required column `id_gout` to the `LigneCommande` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LigneCommande" ADD COLUMN     "id_gout" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Gout" (
    "id_gout" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Gout_pkey" PRIMARY KEY ("id_gout")
);

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_gout_fkey" FOREIGN KEY ("id_gout") REFERENCES "Gout"("id_gout") ON DELETE RESTRICT ON UPDATE CASCADE;
