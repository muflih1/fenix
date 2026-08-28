import {customerRouter} from './routes/customer.router.js';
import {router} from './trpc.js';

export const appRouter = router({
  customers: customerRouter,
});

export type AppRouter = typeof appRouter;
