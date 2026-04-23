-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "dateRetrait" TIMESTAMP(3),
ADD COLUMN     "livraisonSamedi" BOOLEAN NOT NULL DEFAULT false;
