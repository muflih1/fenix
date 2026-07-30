import { dbStorage } from '../db/storage.js';

export class CompanyService {
  static async listCompanies(search?: string) {
    return await dbStorage.getCompanies(search);
  }

  static async findOrCreateCompany(name: string, details?: { phone?: string; email?: string; address?: string }) {
    return await dbStorage.getOrCreateCompany(name, details);
  }
}
