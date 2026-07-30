import { CompanyService } from '../services/company.service.js';

export class CompanyController {
  static async listCompanies(search?: string) {
    return await CompanyService.listCompanies(search);
  }

  static async createCompany(name: string, details?: any) {
    return await CompanyService.findOrCreateCompany(name, details);
  }
}
