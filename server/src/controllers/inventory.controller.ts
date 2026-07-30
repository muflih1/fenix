import { InventoryService } from '../services/inventory.service.js';

export class InventoryController {
  static async listInventory(filters?: any) {
    return await InventoryService.listInventory(filters);
  }

  static async getItemById(id: string) {
    return await InventoryService.getItemById(id);
  }

  static async createItem(data: any) {
    return await InventoryService.createItem(data);
  }

  static async updateStock(id: string, qty: number, notes?: string) {
    return await InventoryService.updateStock(id, qty, notes);
  }

  static async getLogs(inventoryItemId?: string, limit: number = 50) {
    return await InventoryService.getLogs(inventoryItemId, limit);
  }

  static async deleteItem(id: string) {
    return await InventoryService.deleteItem(id);
  }
}
