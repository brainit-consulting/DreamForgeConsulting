-- DropForeignKey
ALTER TABLE "outreach_emails" DROP CONSTRAINT "outreach_emails_leadId_fkey";

-- AlterTable
ALTER TABLE "outreach_emails" ALTER COLUMN "leadId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "outreach_emails" ADD CONSTRAINT "outreach_emails_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
