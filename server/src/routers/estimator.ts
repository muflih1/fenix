import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { dbStorage } from '../db/storage.js';

export const estimatorRouter = router({
  calculateBOM: publicProcedure
    .input(z.object({
      signType: z.enum([
        "3D_ACRYLIC_CHANNEL_LETTERS",
        "NEON_FLEX",
        "LED_LIGHTBOX",
        "P10_OUTDOOR_MATRIX",
        "PYLON_SIGN",
        "VINYL_GRAPHICS"
      ]),
      width: z.number().positive(),
      height: z.number().positive(),
      unit: z.enum(["ft", "inch", "mm"]).default("ft"),
      letterCount: z.number().default(5),
      strokeWidthInches: z.number().default(4),
      markupPercent: z.number().default(40),
      laborHours: z.number().default(8),
      laborHourlyRate: z.number().default(45)
    }))
    .query(async ({ input }) => {
      // Convert to feet for standard calculations
      let widthFt = input.width;
      let heightFt = input.height;
      if (input.unit === 'inch') {
        widthFt = input.width / 12;
        heightFt = input.height / 12;
      } else if (input.unit === 'mm') {
        widthFt = input.width / 304.8;
        heightFt = input.height / 304.8;
      }

      const totalSqFt = Math.max(1, widthFt * heightFt);
      const inventory = await dbStorage.getInventory();

      let estLEDModules = 0;
      let estNeonMeters = 0;
      let estPSUCount = 1;
      let estAcrylicSheets = 1;
      let estAluProfileMeters = 0;

      if (input.signType === '3D_ACRYLIC_CHANNEL_LETTERS') {
        // Average 40 modules per letter (approx 1.5W each)
        estLEDModules = Math.ceil(input.letterCount * 35);
        estAluProfileMeters = Math.ceil((widthFt * 2 + heightFt * 2) * 1.5);
        estAcrylicSheets = Math.ceil(totalSqFt / 28); // 4x8 ft sheet = 32 sqft, factor in waste
      } else if (input.signType === 'NEON_FLEX') {
        // ~3 meters per letter or based on perimeter
        estNeonMeters = Math.ceil(input.letterCount * 2.8 + (widthFt + heightFt));
        estAcrylicSheets = Math.ceil(totalSqFt / 28);
      } else if (input.signType === 'LED_LIGHTBOX') {
        // Matrix layout ~ 15 modules per sqft
        estLEDModules = Math.ceil(totalSqFt * 16);
        estAluProfileMeters = Math.ceil((widthFt + heightFt) * 2 * 0.3048); // convert feet to meters
        estAcrylicSheets = Math.ceil((totalSqFt * 2) / 28); // front & back
      } else {
        estLEDModules = Math.ceil(totalSqFt * 12);
        estAluProfileMeters = Math.ceil(widthFt * 2);
        estAcrylicSheets = Math.ceil(totalSqFt / 28);
      }

      // Match inventory items
      const ledItem = inventory.find(i => i.category === 'LED_MODULES' && (input.signType === 'NEON_FLEX' ? i.sku.includes('NEON') : i.sku.includes('LED-MOD')));
      const psuItem = inventory.find(i => i.category === 'POWER_SUPPLIES' && i.sku.includes('400W'));
      const acrylicItem = inventory.find(i => i.category === 'ACRYLIC_SHEETS');
      const aluItem = inventory.find(i => i.category === 'ALUMINUM_PROFILES');

      const recommendedBOM = [];
      let totalMaterialCost = 0;

      if (input.signType === 'NEON_FLEX' && estNeonMeters > 0) {
        const item = ledItem || inventory[1];
        if (item) {
          const cost = estNeonMeters * item.unitCostPrice;
          recommendedBOM.push({
            inventoryItemId: item.id,
            name: item.name,
            category: item.category,
            quantity: estNeonMeters,
            unit: item.unit,
            unitCost: item.unitCostPrice,
            totalCost: cost
          });
          totalMaterialCost += cost;
        }
      } else if (estLEDModules > 0) {
        const item = ledItem || inventory[0];
        if (item) {
          const cost = estLEDModules * item.unitCostPrice;
          recommendedBOM.push({
            inventoryItemId: item.id,
            name: item.name,
            category: item.category,
            quantity: estLEDModules,
            unit: item.unit,
            unitCost: item.unitCostPrice,
            totalCost: cost
          });
          totalMaterialCost += cost;
        }
      }

      // Calculate PSU Wattage requirement
      const totalWattage = (estLEDModules * 1.5) + (estNeonMeters * 10);
      estPSUCount = Math.max(1, Math.ceil((totalWattage * 1.25) / 350));

      if (psuItem) {
        const cost = estPSUCount * psuItem.unitCostPrice;
        recommendedBOM.push({
          inventoryItemId: psuItem.id,
          name: psuItem.name,
          category: psuItem.category,
          quantity: estPSUCount,
          unit: psuItem.unit,
          unitCost: psuItem.unitCostPrice,
          totalCost: cost
        });
        totalMaterialCost += cost;
      }

      if (acrylicItem && estAcrylicSheets > 0) {
        const cost = estAcrylicSheets * acrylicItem.unitCostPrice;
        recommendedBOM.push({
          inventoryItemId: acrylicItem.id,
          name: acrylicItem.name,
          category: acrylicItem.category,
          quantity: estAcrylicSheets,
          unit: acrylicItem.unit,
          unitCost: acrylicItem.unitCostPrice,
          totalCost: cost
        });
        totalMaterialCost += cost;
      }

      if (aluItem && estAluProfileMeters > 0) {
        const cost = estAluProfileMeters * aluItem.unitCostPrice;
        recommendedBOM.push({
          inventoryItemId: aluItem.id,
          name: aluItem.name,
          category: aluItem.category,
          quantity: estAluProfileMeters,
          unit: aluItem.unit,
          unitCost: aluItem.unitCostPrice,
          totalCost: cost
        });
        totalMaterialCost += cost;
      }

      const laborCost = input.laborHours * input.laborHourlyRate;
      const overheadCost = totalMaterialCost * 0.15; // 15% shop overhead
      const totalSubtotalCost = totalMaterialCost + laborCost + overheadCost;
      const totalQuoteAmount = totalSubtotalCost * (1 + input.markupPercent / 100);

      return {
        inputs: {
          signType: input.signType,
          widthFt,
          heightFt,
          totalSqFt,
          letterCount: input.letterCount
        },
        technicalSpecs: {
          calculatedLEDModules: estLEDModules,
          calculatedNeonMeters: estNeonMeters,
          estimatedTotalPowerWatts: Math.ceil(totalWattage),
          recommendedPSUCount: estPSUCount,
          acrylicSheetsNeeded: estAcrylicSheets,
          aluminumProfileMetersNeeded: estAluProfileMeters
        },
        financials: {
          estimatedMaterialCost: Math.round(totalMaterialCost * 100) / 100,
          laborCost: Math.round(laborCost * 100) / 100,
          overheadCost: Math.round(overheadCost * 100) / 100,
          markupPercent: input.markupPercent,
          totalQuoteAmount: Math.round(totalQuoteAmount * 100) / 100,
          recommendedDeposit: Math.round((totalQuoteAmount / 2) * 100) / 100
        },
        recommendedBOM
      };
    })
});
