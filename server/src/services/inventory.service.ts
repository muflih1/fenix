import { dbStorage } from '../db/storage.js';
import { InventoryCategory } from '../types.js';

export class InventoryService {
  static async listInventory(filters?: { category?: InventoryCategory; lowStockOnly?: boolean; search?: string }) {
    return await dbStorage.getInventory(filters);
  }

  static async getItemById(id: string) {
    const items = await dbStorage.getInventory();
    const item = items.find(i => i.id === id);
    if (!item) {
      throw new Error(`Inventory item ${id} not found`);
    }
    return item;
  }

  static async createItem(data: any) {
    return await dbStorage.createInventoryItem(data);
  }

  static async updateStock(id: string, qty: number, notes?: string) {
    return await dbStorage.updateStockQuantity(id, qty, notes);
  }

  static async getLogs(inventoryItemId?: string, limit: number = 50) {
    let logs = await dbStorage.getStockLogs();
    if (inventoryItemId) {
      logs = logs.filter(l => l.inventoryItemId === inventoryItemId);
    }
    return logs.slice(0, limit);
  }

  static async deleteItem(id: string) {
    return await dbStorage.deleteInventoryItem(id);
  }
}
