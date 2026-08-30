import {UserService} from '../../services/index.js';
import {protectedProcedure, router} from '../trpc.js';

export const employeeRouter = router({
  list: protectedProcedure.query(() => UserService.getEmployees()),
});
