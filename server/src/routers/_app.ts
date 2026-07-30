import { router } from '../trpc.js';
import { jobsRouter } from './jobs.js';
import { inventoryRouter } from './inventory.js';
import { estimatorRouter } from './estimator.js';
import { analyticsRouter } from './analytics.js';
import { companiesRouter } from './companies.js';

export const appRouter = router({
  jobs: jobsRouter,
  inventory: inventoryRouter,
  estimator: estimatorRouter,
  analytics: analyticsRouter,
  companies: companiesRouter
});

export type AppRouter = typeof appRouter;
