import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  startAt,
  endAt,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { FeedPost } from "../../../user-panel/services/feedService";

// Types for analytics data
export interface FeedAnalytics {
  postCount: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  topUsers: TopUser[];
  companyStats: CompanyStats[];
  dailyActivity: DailyActivity[];
  topPosts: TopPost[];
}

export interface TopUser {
  name: string;
  uid: string;
  email: string;
  likes: number;
  comments: number;
  posts: number;
  totalEngagement: number;
  engagementRate: number;
}

export interface CompanyStats {
  companyId: string;
  companyName: string;
  postCount: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  avgEngagementPerPost: number;
  activeUsers: number;
}

export interface DailyActivity {
  date: string;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  totalEngagement: number;
}

export interface TopPost {
  id: string;
  authorName: string;
  authorId: string;
  companyName?: string;
  companyId?: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  totalEngagement: number;
  createdAt: Date;
  engagementRate: number;
}

export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

class FeedAnalyticsService {
  // Helper function to safely convert timestamps
  private safeTimestampToDate(timestamp: any): Date {
    if (!timestamp) return new Date();

    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }

    if (timestamp instanceof Date) {
      return timestamp;
    }

    if (typeof timestamp === "number") {
      return new Date(timestamp);
    }

    if (typeof timestamp === "string") {
      return new Date(timestamp);
    }

    return new Date();
  }

  // Get date range for period
  private getDateRange(period: AnalyticsPeriod): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(now);

    switch (period) {
      case "daily":
        startDate.setDate(now.getDate() - 1);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate.setDate(now.getDate() - 30);
        break;
    }

    return { startDate, endDate };
  }

  // Get all posts within date range
  private async getPostsInRange(
    startDate: Date,
    endDate: Date,
  ): Promise<FeedPost[]> {
    try {
      const postsRef = collection(db, "posts");
      const q = query(
        postsRef,
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        where("createdAt", "<=", Timestamp.fromDate(endDate)),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const posts: FeedPost[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          authorId: data.authorId || "",
          authorName: data.authorName || "",
          content: data.content || { text: "" },
          visibility: data.visibility || "public",
          type: data.type || "text",
          engagement: data.engagement || {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
          },
          metadata: data.metadata || { isEdited: false },
          companyId: data.companyId,
          companyName: data.companyName,
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: data.updatedAt || serverTimestamp(),
        } as unknown as FeedPost);
      });

      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  // Calculate engagement rate
  private calculateEngagementRate(
    likes: number,
    comments: number,
    shares: number,
    posts: number,
  ): number {
    if (posts === 0) return 0;
    const totalEngagement = likes + comments + shares;
    return Math.round((totalEngagement / posts) * 100) / 100;
  }

  // Get comprehensive feed analytics
  async getFeedAnalytics(
    period: AnalyticsPeriod = "weekly",
  ): Promise<FeedAnalytics> {
    try {
      const { startDate, endDate } = this.getDateRange(period);
      const posts = await this.getPostsInRange(startDate, endDate);

      // Calculate basic metrics
      const postCount = posts.length;
      const totalLikes = posts.reduce(
        (sum, post) => sum + (post.engagement?.likes || 0),
        0,
      );
      const totalComments = posts.reduce(
        (sum, post) => sum + (post.engagement?.comments || 0),
        0,
      );
      const totalShares = posts.reduce(
        (sum, post) => sum + (post.engagement?.shares || 0),
        0,
      );
      const engagementRate = this.calculateEngagementRate(
        totalLikes,
        totalComments,
        totalShares,
        postCount,
      );

      // Get additional analytics
      const [topUsers, companyStats, dailyActivity, topPosts] =
        await Promise.all([
          this.getTopUsers(posts),
          this.getCompanyInsights(posts),
          this.getDailyActivity(posts, startDate, endDate),
          this.getTopPosts(posts),
        ]);

      return {
        postCount,
        totalLikes,
        totalComments,
        totalShares,
        engagementRate,
        topUsers,
        companyStats,
        dailyActivity,
        topPosts,
      };
    } catch (error) {
      console.error("Error getting feed analytics:", error);
      return {
        postCount: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        engagementRate: 0,
        topUsers: [],
        companyStats: [],
        dailyActivity: [],
        topPosts: [],
      };
    }
  }

  // Get top users by engagement
  async getTopUsers(
    posts?: FeedPost[],
    limitCount: number = 10,
  ): Promise<TopUser[]> {
    try {
      let postsToAnalyze = posts;

      if (!postsToAnalyze) {
        const { startDate, endDate } = this.getDateRange("monthly");
        postsToAnalyze = await this.getPostsInRange(startDate, endDate);
      }

      // Group posts by user
      const userStats = new Map<
        string,
        {
          name: string;
          email: string;
          likes: number;
          comments: number;
          posts: number;
        }
      >();

      postsToAnalyze.forEach((post) => {
        const userId = post.authorId;
        const current = userStats.get(userId) || {
          name: post.authorName,
          email: post.authorUsername || "",
          likes: 0,
          comments: 0,
          posts: 0,
        };

        current.likes += post.engagement?.likes || 0;
        current.comments += post.engagement?.comments || 0;
        current.posts += 1;

        userStats.set(userId, current);
      });

      // Convert to array and calculate engagement
      const topUsers: TopUser[] = Array.from(userStats.entries()).map(
        ([uid, stats]) => {
          const totalEngagement = stats.likes + stats.comments;
          const engagementRate = this.calculateEngagementRate(
            stats.likes,
            stats.comments,
            0,
            stats.posts,
          );

          return {
            uid,
            name: stats.name,
            email: stats.email,
            likes: stats.likes,
            comments: stats.comments,
            posts: stats.posts,
            totalEngagement,
            engagementRate,
          };
        },
      );

      // Sort by total engagement and limit
      return topUsers
        .sort((a, b) => b.totalEngagement - a.totalEngagement)
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error getting top users:", error);
      return [];
    }
  }

  // Get company insights
  async getCompanyInsights(posts?: FeedPost[]): Promise<CompanyStats[]> {
    try {
      let postsToAnalyze = posts;

      if (!postsToAnalyze) {
        const { startDate, endDate } = this.getDateRange("monthly");
        postsToAnalyze = await this.getPostsInRange(startDate, endDate);
      }

      // Group posts by company
      const companyStats = new Map<
        string,
        {
          companyName: string;
          postCount: number;
          totalLikes: number;
          totalComments: number;
          totalShares: number;
          activeUsers: Set<string>;
        }
      >();

      postsToAnalyze.forEach((post) => {
        if (!post.companyId) return;

        const companyId = post.companyId;
        const current = companyStats.get(companyId) || {
          companyName: post.companyName || "Unknown Company",
          postCount: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          activeUsers: new Set<string>(),
        };

        current.postCount += 1;
        current.totalLikes += post.engagement?.likes || 0;
        current.totalComments += post.engagement?.comments || 0;
        current.totalShares += post.engagement?.shares || 0;
        current.activeUsers.add(post.authorId);

        companyStats.set(companyId, current);
      });

      // Convert to array and calculate metrics
      const companies: CompanyStats[] = Array.from(companyStats.entries()).map(
        ([companyId, stats]) => {
          const engagementRate = this.calculateEngagementRate(
            stats.totalLikes,
            stats.totalComments,
            stats.totalShares,
            stats.postCount,
          );

          const avgEngagementPerPost =
            stats.postCount > 0
              ? Math.round(
                  ((stats.totalLikes +
                    stats.totalComments +
                    stats.totalShares) /
                    stats.postCount) *
                    100,
                ) / 100
              : 0;

          return {
            companyId,
            companyName: stats.companyName,
            postCount: stats.postCount,
            totalLikes: stats.totalLikes,
            totalComments: stats.totalComments,
            totalShares: stats.totalShares,
            engagementRate,
            avgEngagementPerPost,
            activeUsers: stats.activeUsers.size,
          };
        },
      );

      // Sort by engagement rate
      return companies.sort((a, b) => b.engagementRate - a.engagementRate);
    } catch (error) {
      console.error("Error getting company insights:", error);
      return [];
    }
  }

  // Get daily activity breakdown
  async getDailyActivity(
    posts?: FeedPost[],
    startDate?: Date,
    endDate?: Date,
  ): Promise<DailyActivity[]> {
    try {
      let postsToAnalyze = posts;
      let dateRange = { startDate, endDate };

      if (!postsToAnalyze) {
        dateRange = this.getDateRange("weekly");
        if (dateRange.startDate && dateRange.endDate) {
          postsToAnalyze = await this.getPostsInRange(
            dateRange.startDate,
            dateRange.endDate,
          );
        } else {
          postsToAnalyze = [];
        }
      }

      if (!dateRange.startDate || !dateRange.endDate) {
        dateRange = this.getDateRange("weekly");
      }

      // Create daily buckets
      const dailyStats = new Map<
        string,
        {
          posts: number;
          likes: number;
          comments: number;
          shares: number;
        }
      >();

      // Initialize all dates in range
      if (dateRange.startDate && dateRange.endDate) {
        const current = new Date(dateRange.startDate);
        const endDateSafe = dateRange.endDate;
        while (current <= endDateSafe) {
          const dateKey = current.toISOString().split("T")[0];
          dailyStats.set(dateKey, {
            posts: 0,
            likes: 0,
            comments: 0,
            shares: 0,
          });
          current.setDate(current.getDate() + 1);
        }
      } // Aggregate posts by day
      postsToAnalyze.forEach((post) => {
        const postDate = this.safeTimestampToDate(post.createdAt);
        const dateKey = postDate.toISOString().split("T")[0];

        const dayStats = dailyStats.get(dateKey);
        if (dayStats) {
          dayStats.posts += 1;
          dayStats.likes += post.engagement?.likes || 0;
          dayStats.comments += post.engagement?.comments || 0;
          dayStats.shares += post.engagement?.shares || 0;
        }
      }); // Convert to array
      const dailyActivity: DailyActivity[] = Array.from(
        dailyStats.entries(),
      ).map(([date, stats]) => ({
        date,
        posts: stats.posts,
        likes: stats.likes,
        comments: stats.comments,
        shares: stats.shares,
        totalEngagement: stats.likes + stats.comments + stats.shares,
      }));

      // Sort by date
      return dailyActivity.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error("Error getting daily activity:", error);
      return [];
    }
  }

  // Get top performing posts
  async getTopPosts(
    posts?: FeedPost[],
    limitCount: number = 10,
  ): Promise<TopPost[]> {
    try {
      let postsToAnalyze = posts;

      if (!postsToAnalyze) {
        const { startDate, endDate } = this.getDateRange("weekly");
        postsToAnalyze = await this.getPostsInRange(startDate, endDate);
      }

      // Calculate engagement for each post
      const topPosts: TopPost[] = postsToAnalyze.map((post) => {
        const likes = post.engagement?.likes || 0;
        const comments = post.engagement?.comments || 0;
        const shares = post.engagement?.shares || 0;
        const totalEngagement = likes + comments + shares;
        const engagementRate = totalEngagement; // Simple metric for sorting

        // Extract text content
        let contentText = "";
        if (typeof post.content === "string") {
          contentText = post.content;
        } else if (post.content?.text) {
          contentText = post.content.text;
        }

        return {
          id: post.id,
          authorName: post.authorName,
          authorId: post.authorId,
          companyName: post.companyName,
          companyId: post.companyId,
          content:
            contentText.length > 100
              ? contentText.substring(0, 100) + "..."
              : contentText,
          likes,
          comments,
          shares,
          totalEngagement,
          createdAt: this.safeTimestampToDate(post.createdAt),
          engagementRate,
        };
      }); // Sort by total engagement and limit
      return topPosts
        .sort((a, b) => b.totalEngagement - a.totalEngagement)
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error getting top posts:", error);
      return [];
    }
  }

  // Real-time listener for analytics updates
  onAnalyticsUpdate(
    period: AnalyticsPeriod,
    callback: (analytics: FeedAnalytics) => void,
  ): () => void {
    const updateAnalytics = async () => {
      try {
        const analytics = await this.getFeedAnalytics(period);
        callback(analytics);
      } catch (error) {
        console.error("Error updating analytics:", error);
      }
    };

    // Update immediately
    updateAnalytics();

    // Set up periodic updates every 5 minutes
    const intervalId = setInterval(updateAnalytics, 5 * 60 * 1000);

    // Return cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }
}

// Export singleton instance
export const analyticsService = new FeedAnalyticsService();
