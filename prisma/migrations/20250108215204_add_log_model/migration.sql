/*
  Warnings:

  - You are about to drop the column `logs` on the `ShortLink` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShortLink" DROP COLUMN "logs";

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "log" TEXT NOT NULL,
    "shortLinkId" INTEGER,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_shortLinkId_fkey" FOREIGN KEY ("shortLinkId") REFERENCES "ShortLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
