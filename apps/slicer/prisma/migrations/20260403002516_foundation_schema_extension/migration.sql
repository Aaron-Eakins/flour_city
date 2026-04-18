-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "material" TEXT NOT NULL DEFAULT 'PLA',
    "quality" TEXT NOT NULL DEFAULT 'Standard',
    "infill" INTEGER NOT NULL DEFAULT 15,
    "color" TEXT NOT NULL DEFAULT 'Black',
    "nozzleDiameter" TEXT NOT NULL DEFAULT '0.4mm',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "customerNotes" TEXT,
    "materialCost" DOUBLE PRECISION NOT NULL,
    "electricityCost" DOUBLE PRECISION NOT NULL,
    "laborCost" DOUBLE PRECISION NOT NULL,
    "nozzleSwapFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "depreciation" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "printTimeHours" DOUBLE PRECISION NOT NULL,
    "weightGrams" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUOTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "customerEmail" TEXT,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" SERIAL NOT NULL,
    "printerKwhUsage" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "electricityCostPerKwh" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "machineLifeHours" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "machineCost" DOUBLE PRECISION NOT NULL DEFAULT 699,
    "fixedLaborFee" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "failureBufferPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "profitMarginPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "minimumPrice" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "notifyOnQuote" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "purgeVolumePerTransitionCm3" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "purgeWasteCostMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "primeTowerVolumePercent" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "multiColorFailureBufferExtra" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "quoteExpiryHours" INTEGER NOT NULL DEFAULT 72,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costPerKg" DOUBLE PRECISION NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "brand" TEXT,
    "modelNumber" TEXT,
    "colorName" TEXT,
    "colorHex" TEXT,
    "sku" TEXT,
    "manufacturerId" TEXT,
    "materialType" TEXT NOT NULL DEFAULT 'PLA',
    "amsSlot" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NozzleDiameter" (
    "id" TEXT NOT NULL,
    "diameter" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "swapFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NozzleDiameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quality" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfillOption" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfillOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_token_key" ON "AdminSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Material_name_key" ON "Material"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Quality_name_key" ON "Quality"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InfillOption_value_key" ON "InfillOption"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Color_name_key" ON "Color"("name");
