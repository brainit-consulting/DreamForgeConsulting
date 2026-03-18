-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "cardSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "cardSent" BOOLEAN NOT NULL DEFAULT false;
