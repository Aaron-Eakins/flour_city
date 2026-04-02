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

export function calculateQuote(
  baseWeightGrams: number, 
  basePrintTimeHours: number,
  config: any,
  options: { 
    material: string, 
    quality: string, 
    infill: number, 
    quantity: number, 
    materialCostPerKg?: number,
    qualityMultiplier?: number
  }
): QuoteResult {
  
  // Adjust base weight and time based on options (Simulated logic since CLI is basic)
  
  // Infill: Assume sliced at 15%. If higher, increase weight and time.
  let weightRatio = options.infill / 15.0; 
  if (weightRatio < 1) weightRatio = 1; // don't go below baseline if they pick 10%
  // Time increases by 50% of the weight ratio increase
  let timeRatio = 1 + ((weightRatio - 1) * 0.5);

  // Quality: Dynamic multiplier from DB. Default to 1.0 if not provided.
  const qualityMultiplier = options.qualityMultiplier || 1.0;
  timeRatio *= qualityMultiplier;

  const adjustedWeightPerPart = baseWeightGrams * weightRatio;
  const adjustedTimePerPart = basePrintTimeHours * timeRatio;

  const totalWeight = adjustedWeightPerPart * options.quantity;
  const totalTime = adjustedTimePerPart * options.quantity;

  // 1. Material
  const materialCostPerKg = options.materialCostPerKg || 25.0;

  const materialCost = (totalWeight / 1000) * materialCostPerKg;


  // 2. Electricity
  const electricityCost = totalTime * (config.printerKwhUsage || 0.15) * (config.electricityCostPerKwh || 0.20);

  // 3. Machine Depreciation
  const hourlyDepreciation = (config.machineCost || 699) / (config.machineLifeHours || 5000);
  const machineDepreciation = totalTime * hourlyDepreciation;

  // 4. Labor (Fixed per order + slight increase for multiple parts)
  const labor = (config.fixedLaborFee || 2.0) + (options.quantity > 1 ? (options.quantity - 1) * 0.5 : 0);

  // Base production cost
  const baseCost = materialCost + electricityCost + machineDepreciation + labor;

  // 5. Buffer / Waste
  const buffer = baseCost * (config.failureBufferPercent || 0.1);
  const costWithBuffer = baseCost + buffer;

  // 6. Final Margin
  const margin = costWithBuffer * (config.profitMarginPercent || 0.5);

  let totalCost = costWithBuffer + margin;

  // Enforce minimum price
  if (totalCost < (config.minimumPrice || 5.0)) {
    totalCost = config.minimumPrice || 5.0;
  }

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
      printTimeHours: Number(totalTime.toFixed(2)),
      weightGrams: Number(totalWeight.toFixed(2)),
    }
  };
}
