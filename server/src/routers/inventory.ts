import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { InventoryController } from '../controllers/inventory.controller.js';

export const inventoryRouter = router({
  list: publicProcedure
    .input(z.object({
      category: z.enum([
        "LED_MODULES",
        "POWER_SUPPLIES",
        "ACRYLIC_SHEETS",
        "ALUMINUM_PROFILES",
        "VINYL_FLEX",
        "CONTROLLERS",
        "FASTENERS"
      ]).optional(),
      lowStockOnly: z.boolean().optional(),
      search: z.string().optional()
    }).optional())
    .query(async ({ input }) => {
      return await InventoryController.listInventory({
        category: input?.category as any,
        lowStockOnly: input?.lowStockOnly,
        search: input?.search
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await InventoryController.getItemById(input.id);
    }),

  create: publicProcedure
    .input(z.object({
      sku: z.string(),
      name: z.string(),
      category: z.enum([
        "LED_MODULES",
        "POWER_SUPPLIES",
        "ACRYLIC_SHEETS",
        "ALUMINUM_PROFILES",
        "VINYL_FLEX",
        "CONTROLLERS",
        "FASTENERS"
      ]),
      stockQuantity: z.number().min(0),
      minReorderLevel: z.number().min(0),
      unit: z.string(),
      unitCostPrice: z.number().min(0),
      sellingPrice: z.number().optional(),
      supplier: z.string(),
      binLocation: z.string()
    }))
    .mutation(async ({ input }) => {
      return await InventoryController.createItem(input);
    }),

  updateStock: publicProcedure
    .input(z.object({
      id: z.string(),
      stockQuantity: z.number().min(0),
      notes: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return await InventoryController.updateStock(input.id, input.stockQuantity, input.notes);
    }),

  getLogs: publicProcedure
    .input(z.object({
      inventoryItemId: z.string().optional(),
      limit: z.number().default(50)
    }).optional())
    .query(async ({ input }) => {
      return await InventoryController.getLogs(input?.inventoryItemId, input?.limit ?? 50);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await InventoryController.deleteItem(input.id);
    })
});
