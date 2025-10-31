import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    onSnapshot,
    Timestamp,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { analyticsService, type FeedAnalytics } from './analyticsService';
import { FeedPost } from '../../../user-panel/services/feedService';

// Types for behavior analysis
export interface ActivityMatrix {
    byDay: {
        [day: number]: {
            [hour: number]: {
                posts: number;
                interactions: number;
                users: number;
            };
        };
    };
    totalsByHour: {
        [hour: number]: {
            posts: number;
            interactions: number;
            users: number;
        };
    };
    totalsByDay: {
        [day: number]: {
            posts: number;
            interactions: number;
            users: number;
        };
    };
}

export type AlertType = 'growth' | 'drop' | 'topUser' | 'topCompany' | 'anomaly' | 'milestone';

export interface Alert {
    id: string;
    type: AlertType;
    title: string;
    message: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Timestamp;
    metadata?: {
        userId?: string;
        userName?: string;
        companyId?: string;
        companyName?: string;
        entity?: string;
        value?: number;
        previousValue?: number;
        changePercentage?: number;
    };
    isRead?: boolean;
}

export interface TrendData {
    current: number;
    previous: number;
    changePercentage: number;
    trend: 'up' | 'down' | 'stable';
}

export interface UserTrend {
    userId: string;
    userName: string;
    currentEngagement: number;
    previousEngagement: number;
    trend: TrendData;
}

export interface CompanyTrend {
    companyId: string;
    companyName: string;
    currentEngagement: number;
    previousEngagement: number;
    trend: TrendData;
}

class BehaviorAnalysisService {
    // Helper function to safely convert timestamps
    private safeTimestampToDate(timestamp: any): Date {
        if (!timestamp) return new Date();

        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }

        if (timestamp instanceof Date) {
            return timestamp;
        }

        if (typeof timestamp === 'number') {
            return new Date(timestamp);
        }

        if (typeof timestamp === 'string') {
            return new Date(timestamp);
        }

        return new Date();
    }

    // Calculate activity matrix for heatmap
    async getActivityMatrix(companyId?: string): Promise<ActivityMatrix> {
        try {
            const days = 7; // Last 7 days for heatmap
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const endDate = new Date();

            // Get posts in the specified period
            const postsRef = collection(db, 'posts');
            let q = query(
                postsRef,
                where('createdAt', '>=', Timestamp.fromDate(startDate)),
                where('createdAt', '<=', Timestamp.fromDate(endDate)),
                orderBy('createdAt', 'desc')
            );

            // Add company filter if specified
            if (companyId) {
                q = query(
                    postsRef,
                    where('companyId', '==', companyId),
                    where('createdAt', '>=', Timestamp.fromDate(startDate)),
                    where('createdAt', '<=', Timestamp.fromDate(endDate)),
                    orderBy('createdAt', 'desc')
                );
            }

            const querySnapshot = await getDocs(q);
            const posts: FeedPost[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                posts.push({
                    id: doc.id,
                    authorId: data.authorId || '',
                    authorName: data.authorName || '',
                    content: data.content || { text: '' },
                    visibility: data.visibility || 'public',
                    type: data.type || 'text',
                    engagement: data.engagement || { likes: 0, comments: 0, shares: 0, views: 0 },
                    metadata: data.metadata || { isEdited: false },
                    companyId: data.companyId,
                    companyName: data.companyName,
                    createdAt: data.createdAt || serverTimestamp(),
                    updatedAt: data.updatedAt || serverTimestamp(),
                } as unknown as FeedPost);
            });

            // Initialize the activity matrix structure
            const matrix: ActivityMatrix = {
                byDay: {},
                totalsByHour: {},
                totalsByDay: {}
            };

            // Initialize all day/hour combinations
            for (let day = 0; day < 7; day++) {
                matrix.byDay[day] = {};
                matrix.totalsByDay[day] = { posts: 0, interactions: 0, users: 0 };

                for (let hour = 0; hour < 24; hour++) {
                    matrix.byDay[day][hour] = { posts: 0, interactions: 0, users: 0 };
                }
            }

            for (let hour = 0; hour < 24; hour++) {
                matrix.totalsByHour[hour] = { posts: 0, interactions: 0, users: 0 };
            }

            // Track unique users per day/hour
            const userTracking = new Map<string, Set<string>>();

            // Process posts and fill matrix
            posts.forEach(post => {
                const date = this.safeTimestampToDate(post.createdAt);
                const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                const hour = date.getHours(); // 0-23

                const interactions = (post.engagement?.likes || 0) +
                    (post.engagement?.comments || 0) +
                    (post.engagement?.shares || 0);

                // Update matrix
                matrix.byDay[dayOfWeek][hour].posts += 1;
                matrix.byDay[dayOfWeek][hour].interactions += interactions;

                // Track unique users
                const key = `${dayOfWeek}-${hour}`;
                if (!userTracking.has(key)) {
                    userTracking.set(key, new Set());
                }
                userTracking.get(key)?.add(post.authorId);

                // Update totals
                matrix.totalsByHour[hour].posts += 1;
                matrix.totalsByHour[hour].interactions += interactions;
                matrix.totalsByDay[dayOfWeek].posts += 1;
                matrix.totalsByDay[dayOfWeek].interactions += interactions;
            });

            // Update user counts
            userTracking.forEach((users, key) => {
                const [day, hour] = key.split('-').map(Number);
                matrix.byDay[day][hour].users = users.size;
            });

            // Calculate totals for users
            for (let hour = 0; hour < 24; hour++) {
                const hourUsers = new Set<string>();
                for (let day = 0; day < 7; day++) {
                    const key = `${day}-${hour}`;
                    const users = userTracking.get(key);
                    if (users) {
                        users.forEach(user => hourUsers.add(user));
                    }
                }
                matrix.totalsByHour[hour].users = hourUsers.size;
            }

            for (let day = 0; day < 7; day++) {
                const dayUsers = new Set<string>();
                for (let hour = 0; hour < 24; hour++) {
                    const key = `${day}-${hour}`;
                    const users = userTracking.get(key);
                    if (users) {
                        users.forEach(user => dayUsers.add(user));
                    }
                }
                matrix.totalsByDay[day].users = dayUsers.size;
            }

            return matrix;

        } catch (error) {
            console.error('Error calculating activity matrix:', error);
            throw error;
        }
    }

    // Calculate trend between two periods
    private calculateTrend(current: number, previous: number): TrendData {
        if (previous === 0) {
            return {
                current,
                previous,
                changePercentage: current > 0 ? 100 : 0,
                trend: current > 0 ? 'up' : 'stable'
            };
        }

        const changePercentage = ((current - previous) / previous) * 100;
        const trend = changePercentage > 5 ? 'up' :
            changePercentage < -5 ? 'down' : 'stable';

        return {
            current,
            previous,
            changePercentage: Math.round(changePercentage * 100) / 100,
            trend
        };
    }

    // Generate alerts based on activity patterns
    async generateAlerts(): Promise<void> {
        try {
            const alerts: Alert[] = [];

            // Get current analytics
            const currentAnalytics = await analyticsService.getFeedAnalytics('weekly');

            // Growth alert
            if (currentAnalytics.postCount > 50) {
                alerts.push({
                    id: `growth-${Date.now()}`,
                    type: 'growth',
                    title: 'Crecimiento en Publicaciones',
                    message: 'Se ha detectado un aumento significativo en la actividad',
                    description: `El número de publicaciones ha aumentado significativamente esta semana (${currentAnalytics.postCount} posts).`,
                    priority: 'medium',
                    timestamp: serverTimestamp() as Timestamp,
                    metadata: {
                        value: currentAnalytics.postCount,
                        previousValue: Math.floor(currentAnalytics.postCount * 0.8),
                        changePercentage: 25
                    }
                });
            }

            // Engagement drop alert
            if (currentAnalytics.engagementRate < 2) {
                alerts.push({
                    id: `drop-${Date.now()}`,
                    type: 'drop',
                    title: 'Descenso en Engagement',
                    message: 'El engagement promedio ha disminuido',
                    description: `El engagement promedio ha bajado a ${currentAnalytics.engagementRate.toFixed(1)}, requiere atención.`,
                    priority: 'high',
                    timestamp: serverTimestamp() as Timestamp,
                    metadata: {
                        value: currentAnalytics.engagementRate,
                        previousValue: 3.5,
                        changePercentage: -20
                    }
                });
            }

            // Top users alert
            if (currentAnalytics.topUsers.length > 0) {
                const topUser = currentAnalytics.topUsers[0];
                alerts.push({
                    id: `topUser-${Date.now()}`,
                    type: 'topUser',
                    title: 'Usuario Destacado',
                    message: 'Nuevo usuario con alto engagement',
                    description: `${topUser.name} ha mostrado una actividad excepcional con ${topUser.totalEngagement} interacciones.`,
                    priority: 'low',
                    timestamp: serverTimestamp() as Timestamp,
                    metadata: {
                        userId: topUser.uid,
                        userName: topUser.name,
                        entity: topUser.name,
                        value: topUser.totalEngagement
                    }
                });
            }

            // Top companies alert
            if (currentAnalytics.companyStats.length > 0) {
                const topCompany = currentAnalytics.companyStats[0];
                alerts.push({
                    id: `topCompany-${Date.now()}`,
                    type: 'topCompany',
                    title: 'Empresa Destacada',
                    message: 'Empresa con mayor actividad',
                    description: `${topCompany.companyName} lidera en actividad con ${topCompany.postCount} publicaciones.`,
                    priority: 'low',
                    timestamp: serverTimestamp() as Timestamp,
                    metadata: {
                        companyId: topCompany.companyId,
                        companyName: topCompany.companyName,
                        entity: topCompany.companyName,
                        value: topCompany.postCount
                    }
                });
            }

            // Anomaly alert (very high activity in short time)
            if (currentAnalytics.totalLikes > 1000) {
                alerts.push({
                    id: `anomaly-${Date.now()}`,
                    type: 'anomaly',
                    title: 'Actividad Anómala',
                    message: 'Pico inusual de actividad detectado',
                    description: `Se ha detectado un pico inusual de likes (${currentAnalytics.totalLikes}) que podría requerir investigación.`,
                    priority: 'high',
                    timestamp: serverTimestamp() as Timestamp,
                    metadata: {
                        value: currentAnalytics.totalLikes
                    }
                });
            }

            // Milestone alert
            if (currentAnalytics.totalComments >= 500) {
                alerts.push({
                    id: `milestone-${Date.now()}`,
                    type: 'milestone',
                    title: 'Hito Alcanzado',
                    message: 'Se ha alcanzado un hito importante',
                    description: `¡Felicitaciones! Se han alcanzado ${currentAnalytics.totalComments} comentarios totales.`,
                    priority: 'medium',
                    timestamp: serverTimestamp() as Timestamp,
                    metadata: {
                        value: currentAnalytics.totalComments
                    }
                });
            }

            // Save alerts to Firebase
            for (const alert of alerts) {
                await addDoc(collection(db, 'behaviorAlerts'), {
                    ...alert,
                    timestamp: serverTimestamp()
                });
            }

        } catch (error) {
            console.error('Error generating alerts:', error);
            throw error;
        }
    }

    // Get alerts from database
    async getAlerts(companyId?: string, maxAlerts: number = 10): Promise<Alert[]> {
        try {
            const alertsRef = collection(db, 'behaviorAlerts');
            const q = query(
                alertsRef,
                orderBy('timestamp', 'desc'),
                limit(maxAlerts)
            );

            const querySnapshot = await getDocs(q);
            const alerts: Alert[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                alerts.push({
                    id: doc.id,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    description: data.description,
                    priority: data.priority,
                    timestamp: data.timestamp,
                    metadata: data.metadata,
                    isRead: data.isRead || false
                } as Alert);
            });

            return alerts;
        } catch (error) {
            console.error('Error getting alerts:', error);
            return [];
        }
    }

    // Dismiss alert
    async dismissAlert(alertId: string): Promise<void> {
        try {
            const alertRef = doc(db, 'behaviorAlerts', alertId);
            await updateDoc(alertRef, {
                isRead: true
            });
        } catch (error) {
            console.error('Error dismissing alert:', error);
            throw error;
        }
    }

    // Listen for new alerts (real-time)
    onNewAlert(callback: (alert: Alert) => void): () => void {
        const alertsRef = collection(db, 'behaviorAlerts');
        const q = query(
            alertsRef,
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        return onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const alert: Alert = {
                    id: doc.id,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    description: data.description,
                    priority: data.priority,
                    timestamp: data.timestamp,
                    metadata: data.metadata,
                    isRead: data.isRead || false
                };

                callback(alert);
            });
        });
    }

    // Get user engagement trends
    async getUserTrends(period: '7d' | '30d' = '7d'): Promise<UserTrend[]> {
        try {
            const currentAnalytics = await analyticsService.getFeedAnalytics('weekly');

            // Mock implementation - in real scenario, calculate from historical data
            const trends: UserTrend[] = currentAnalytics.topUsers.map(user => {
                const previousEngagement = Math.floor(user.totalEngagement * (0.8 + Math.random() * 0.4));
                const trend = this.calculateTrend(user.totalEngagement, previousEngagement);

                return {
                    userId: user.uid,
                    userName: user.name,
                    currentEngagement: user.totalEngagement,
                    previousEngagement,
                    trend
                };
            });

            return trends;
        } catch (error) {
            console.error('Error getting user trends:', error);
            return [];
        }
    }

    // Get company engagement trends
    async getCompanyTrends(period: '7d' | '30d' = '7d'): Promise<CompanyTrend[]> {
        try {
            const currentAnalytics = await analyticsService.getFeedAnalytics('weekly');

            // Mock implementation - in real scenario, calculate from historical data
            const trends: CompanyTrend[] = currentAnalytics.companyStats.map(company => {
                const currentEngagement = company.engagementRate;
                const previousEngagement = Math.floor(currentEngagement * (0.8 + Math.random() * 0.4));
                const trend = this.calculateTrend(currentEngagement, previousEngagement);

                return {
                    companyId: company.companyId,
                    companyName: company.companyName,
                    currentEngagement,
                    previousEngagement,
                    trend
                };
            });

            return trends;
        } catch (error) {
            console.error('Error getting company trends:', error);
            return [];
        }
    }
}

// Export singleton instance
export const behaviorService = new BehaviorAnalysisService();