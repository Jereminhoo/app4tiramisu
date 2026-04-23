/*
  Warnings:

  - A unique constraint covering the columns `[codeRetrait]` on the table `Commande` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "codeRetrait" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Commande_codeRetrait_key" ON "Commande"("codeRetrait");
