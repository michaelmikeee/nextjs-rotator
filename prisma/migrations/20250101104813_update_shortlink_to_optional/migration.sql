-- DropForeignKey
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_shortLinkId_fkey";

-- AlterTable
ALTER TABLE "Domain" ALTER COLUMN "shortLinkId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_shortLinkId_fkey" FOREIGN KEY ("shortLinkId") REFERENCES "ShortLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
