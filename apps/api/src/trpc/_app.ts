import {customerRouter} from './routes/customer.router.js';
import {employeeRouter} from './routes/employee.router.js';
import {jobRouter} from './routes/job.route.js';
import {router} from './trpc.js';

export const appRouter = router({
  customers: customerRouter,
  jobs: jobRouter,
  employees: employeeRouter,
});

export type AppRouter = typeof appRouter;
