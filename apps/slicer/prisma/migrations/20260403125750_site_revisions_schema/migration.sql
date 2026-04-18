-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('PICKUP', 'SHIPPING');

-- CreateEnum
CREATE TYPE "TurnaroundTier" AS ENUM ('STANDARD', 'EXPRESS');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
ADD COLUMN     "pricePerGram" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'SHIPPING',
ADD COLUMN     "turnaroundTier" "TurnaroundTier" NOT NULL DEFAULT 'STANDARD';
