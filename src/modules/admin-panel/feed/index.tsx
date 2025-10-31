// Feed Moderation Module Index
// Export all feed moderation components for easy importing

export { FeedModeration } from './FeedModeration';
export { FeedItemCard } from './FeedItemCard';
export { ReportedPosts } from './ReportedPosts';
export { AdminFeedDashboard } from './AdminFeedDashboard';

// Export services
export { moderationService } from './services/moderationService';

// Re-export types for convenience
export type {
    ModerationLog,
    PostReport,
    FeedStats,
    AdminInfo
} from './services/moderationService';
export type { FeedPost, FeedComment } from '../../user-panel/services/feedService';