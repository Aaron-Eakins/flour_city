export interface QuoteResult {
  totalCost: number;
  breakdown: {
    materialCost: number;
    electricityCost: number;
    machineDepreciation: number;
    labor: number;
    buffer: number;
    margin: number;
  };
  metrics: {
    printTimeHours: number;
    weightGrams: number;
  };
}

// These constants will eventually come from a database/admin UI
const PRICING_CONSTANTS = {
  materialCostPerKg: 25.0, // $25 per kg spool
  printerKwhUsage: 0.15, // 150W average for Bambu P1S
  electricityCostPerKwh: 0.20, // $0.20 per kWh
  machineLifeHours: 5000, 
  machineCost: 699, // P1S Cost
  fixedLaborFee: 2.0, // $2 for minimal post-processing (plate removal, packing)
  failureBufferPercent: 0.1, // 10% added to base cost
  profitMarginPercent: 0.5, // 50% profit margin
};

export function calculateQuote(weightGrams: number, printTimeHours: number): QuoteResult {
  // 1. Material
  const materialCost = (weightGrams / 1000) * PRICING_CONSTANTS.materialCostPerKg;

  // 2. Electricity
  const electricityCost = printTimeHours * PRICING_CONSTANTS.printerKwhUsage * PRICING_CONSTANTS.electricityCostPerKwh;

  // 3. Machine Depreciation
  const hourlyDepreciation = PRICING_CONSTANTS.machineCost / PRICING_CONSTANTS.machineLifeHours;
  const machineDepreciation = printTimeHours * hourlyDepreciation;

  // 4. Labor
  const labor = PRICING_CONSTANTS.fixedLaborFee;

  // Base production cost
  const baseCost = materialCost + electricityCost + machineDepreciation + labor;

  // 5. Buffer / Waste
  const buffer = baseCost * PRICING_CONSTANTS.failureBufferPercent;
  const costWithBuffer = baseCost + buffer;

  // 6. Final Margin
  const margin = costWithBuffer * PRICING_CONSTANTS.profitMarginPercent;

  const totalCost = costWithBuffer + margin;

  return {
    totalCost: Number(totalCost.toFixed(2)),
    breakdown: {
      materialCost: Number(materialCost.toFixed(2)),
      electricityCost: Number(electricityCost.toFixed(2)),
      machineDepreciation: Number(machineDepreciation.toFixed(2)),
      labor: Number(labor.toFixed(2)),
      buffer: Number(buffer.toFixed(2)),
      margin: Number(margin.toFixed(2)),
    },
    metrics: {
      printTimeHours: Number(printTimeHours.toFixed(2)),
      weightGrams: Number(weightGrams.toFixed(2)),
    }
  };
}

// MOCK FUNCTION for Phase 1
export function generateMockQuote(file: File): QuoteResult {
  // Use the file size to generate a somewhat deterministic fake print time and weight
  // A small 1MB file might be 40g and take 1 hour.
  const sizeMb = file.size / (1024 * 1024);
  const mockWeightGrams = Math.max(10, sizeMb * 15); // e.g., 20MB file -> 300g
  const mockTimeHours = Math.max(0.5, sizeMb * 0.4); // e.g., 20MB file -> 8 hours

  return calculateQuote(mockWeightGrams, mockTimeHours);
}
