import z from 'zod';
import {JobService} from '../../services/index.js';
import {protectedProcedure, router} from '../trpc.js';

export const jobRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        title: z.string().min(1),
        quoteAmount: z.string().nonempty(),
        priority: z
          .enum(['LOW', 'NORMAL', 'HIGH', 'IMMEDIATE'])
          .default('NORMAL'),
        location: z.string(),
      }),
    )
    .mutation(async ({input}) => {
      return JobService.createJob(input);
    }),
  quotations: protectedProcedure.query(() => JobService.getQuotations()),
  approveQuotation: protectedProcedure
    .input(z.object({jobId: z.string()}))
    .mutation(({input}) => {
      return JobService.updateJob(input.jobId, {stage: 'APPROVED'});
    }),
  rejectQuotation: protectedProcedure
    .input(z.object({jobId: z.string(), reason: z.string()}))
    .mutation(({input}) => {
      return JobService.updateJob(input.jobId, {
        stage: 'REJECTED',
        rejectedReason: input.reason,
      });
    }),
});
