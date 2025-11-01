// Feed Analytics Module Index
// Export all feed analytics components for easy importing

export { FeedAnalyticsDashboard } from "./FeedAnalyticsDashboard";
export { EngagementCharts } from "./EngagementCharts";
export { ActivityTable } from "./ActivityTable";
export { CompanyInsights } from "./CompanyInsights";

// Export services
export { analyticsService } from "./analyticsService";

// Re-export types for convenience
export type {
  FeedAnalytics,
  TopUser,
  CompanyStats,
  DailyActivity,
  TopPost,
  AnalyticsPeriod,
} from "./analyticsService";
