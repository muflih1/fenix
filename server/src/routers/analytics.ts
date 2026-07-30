import { router, publicProcedure } from '../trpc.js';
import { AnalyticsController } from '../controllers/analytics.controller.js';

export const analyticsRouter = router({
  getDashboardMetrics: publicProcedure
    .query(async () => {
      return await AnalyticsController.getDashboardMetrics();
    }),

  getManagerAnalytics: publicProcedure
    .query(async () => {
      return await AnalyticsController.getManagerAnalytics();
    })
});
