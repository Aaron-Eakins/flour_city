/*
  Warnings:

  - You are about to drop the column `nozzleDiameter` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the `Color` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "nozzleDiameter",
ADD COLUMN     "nozzleDiameterId" TEXT;

-- DropTable
DROP TABLE "Color";

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_nozzleDiameterId_fkey" FOREIGN KEY ("nozzleDiameterId") REFERENCES "NozzleDiameter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
