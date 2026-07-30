import { AnalyticsService } from '../services/analytics.service.js';

export class AnalyticsController {
  static async getDashboardMetrics() {
    return await AnalyticsService.getDashboardMetrics();
  }

  static async getManagerAnalytics() {
    return await AnalyticsService.getManagerAnalytics();
  }
}
