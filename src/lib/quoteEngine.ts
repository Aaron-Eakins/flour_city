export interface QuoteResult {
  totalCost: number;
  breakdown: {
    materialCost: number;
    electricityCost: number;
    machineDepreciation: number;
    labor: number;
    buffer: number;
    margin: number;
    nozzleSwapFee: number;
    amsPurgeCost: number;
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
    qualityMultiplier?: number,
    nozzleSwapFee?: number,
    colorCount?: number,
    layerCount?: number,
    // New AMS fields
    isMultiColor?: boolean,
    selectedSlots?: number[],
    colorTransitions?: number,
    amsMaterials?: any[]
  }

): QuoteResult {
  
  // 0. Base ratios
  let weightRatio = options.infill / 15.0; 
  if (weightRatio < 1) weightRatio = 1; 
  let timeRatio = 1 + ((weightRatio - 1) * 0.5);

  const qualityMultiplier = options.qualityMultiplier || 1.0;
  timeRatio *= qualityMultiplier;

  // 1. AMS / Multi-color Heuristics
  const colorCount = options.colorCount || 1;
  const layerCount = options.layerCount || 200; // Heuristic for multi-color if not provided
  let amsPurgeCost = 0;
  let amsAdditionalTimeHours = 0;
  const amsSwapFee = config.amsSwapFee || 0;

  const isMultiColor = options.isMultiColor || (options.colorCount! > 1);
  const colorTransitionsInput = options.colorTransitions;
  const amsMaterials = options.amsMaterials || [];

  if (isMultiColor) {
    const transitions = colorTransitionsInput ?? (colorCount - 1) * layerCount;
    
    // Purge Material Cost
    const purgeVolCm3 = transitions * (config.purgeVolumePerTransitionCm3 || 1.5);
    const purgeWeightGrams = purgeVolCm3 * 1.25; // Heuristic density
    
    // If we have actual AMS materials, we could average their cost, 
    // but for now we'll stick to the primary material base cost for purge or use amsMaterials if available.
    const baseMaterialCostPerKg = options.materialCostPerKg || 25.0;
    let effectiveAmsCostPerKg = baseMaterialCostPerKg;
    
    if (amsMaterials.length > 0) {
      const sum = amsMaterials.reduce((acc, m) => acc + (m.costPerKg || 25.0), 0);
      effectiveAmsCostPerKg = sum / amsMaterials.length;
    }

    amsPurgeCost = (purgeWeightGrams / 1000) * effectiveAmsCostPerKg * (config.purgeWasteCostMultiplier || 1.0);
    
    // Swap Time (60s per transition default)
    amsAdditionalTimeHours = (transitions * (config.amsSwapTimeSeconds || 60)) / 3600;
    
    // Additional Swap Fees (if any)
    amsPurgeCost += (transitions * amsSwapFee);
  }


  const adjustedWeightPerPart = baseWeightGrams * weightRatio;
  const adjustedTimePerPart = (basePrintTimeHours * timeRatio) + (amsAdditionalTimeHours / options.quantity);

  const totalWeight = adjustedWeightPerPart * options.quantity;
  const totalTime = adjustedTimePerPart * options.quantity;

  // 2. Material
  const materialCostPerKg = options.materialCostPerKg || 25.0;
  const materialCost = ((totalWeight / 1000) * materialCostPerKg) + amsPurgeCost;

  // 3. Electricity
  const electricityCost = totalTime * (config.printerKwhUsage || 0.15) * (config.electricityCostPerKwh || 0.20);

  // 4. Machine Depreciation
  const hourlyDepreciation = (config.machineCost || 699) / (config.machineLifeHours || 5000);
  const machineDepreciation = totalTime * hourlyDepreciation;

  // 5. Labor 
  const labor = (config.fixedLaborFee || 2.0) + (options.quantity > 1 ? (options.quantity - 1) * 0.5 : 0);

  // 6. Nozzle Swap Fee
  const nozzleSwapFee = options.nozzleSwapFee || 0;

  // Base production cost
  const baseCost = materialCost + electricityCost + machineDepreciation + labor + nozzleSwapFee;

  // 7. Buffer / Waste
  let bufferPercent = config.failureBufferPercent || 0.1;
  if (colorCount > 1) {
    bufferPercent += (config.multiColorFailureBufferExtra || 0.05);
  }
  const buffer = baseCost * bufferPercent;
  const costWithBuffer = baseCost + buffer;

  // 8. Final Margin
  const margin = costWithBuffer * (config.profitMarginPercent || 0.5);

  let totalCost = costWithBuffer + margin;

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
      nozzleSwapFee: Number(nozzleSwapFee.toFixed(2)),
      amsPurgeCost: Number(amsPurgeCost.toFixed(2)),
    },
    metrics: {
      printTimeHours: Number(totalTime.toFixed(2)),
      weightGrams: Number(totalWeight.toFixed(2)),
    }
  };
}

