import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { CompanyController } from '../controllers/company.controller.js';

export const companiesRouter = router({
  list: publicProcedure
    .input(z.object({
      search: z.string().optional()
    }).optional())
    .query(async ({ input }) => {
      return await CompanyController.listCompanies(input?.search);
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return await CompanyController.createCompany(input.name, input);
    })
});
