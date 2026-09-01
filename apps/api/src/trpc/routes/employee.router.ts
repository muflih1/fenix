import z from 'zod';
import {UserService} from '../../services/index.js';
import {protectedProcedure, router} from '../trpc.js';

export const employeeRouter = router({
  list: protectedProcedure.query(() => UserService.getEmployees()),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.email(),
        password: z.string().min(6),
        role: z.enum([
          'MANAGER',
          'SUPERVISOR',
          'FRONT_OFFICE',
          'DESIGNER',
          'TECHNISION',
        ]),
      }),
    )
    .mutation(async ({input}) => {
      return UserService.createEmployee(input);
    }),
});
