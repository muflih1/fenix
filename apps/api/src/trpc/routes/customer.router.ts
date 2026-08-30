import {z} from 'zod';
import {protectedProcedure, router} from '../trpc.js';
import {CustomerService} from '../../services/index.js';

export const customerRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        phone: z.string().nonempty(),
      }),
    )
    .mutation(async ({input}) => {
      const customer = await CustomerService.createCustomer(input);
      return customer;
    }),
  list: protectedProcedure.query(() => CustomerService.getCustomers()),
});
