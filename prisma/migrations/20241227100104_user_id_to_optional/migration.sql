-- DropForeignKey
ALTER TABLE "ShortLink" DROP CONSTRAINT "ShortLink_userId_fkey";

-- AlterTable
ALTER TABLE "ShortLink" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ShortLink" ADD CONSTRAINT "ShortLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
