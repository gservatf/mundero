import {
    collection,
    doc,
    updateDoc,
    deleteDoc,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    FieldValue,
    writeBatch
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { FeedPost } from '../../../user-panel/services/feedService';

// Types for moderation
export interface ModerationLog {
    id: string;
    postId: string;
    action: 'hide' | 'delete' | 'restore' | 'review' | 'report_reviewed';
    adminUid: string;
    adminName: string;
    adminEmail: string;
    reason?: string;
    timestamp: Timestamp | FieldValue;
    previousState?: {
        isVisible?: boolean;
        status?: string;
    };
}

export interface PostReport {
    id: string;
    postId: string;
    reporterUid: string;
    reporterName: string;
    reporterEmail: string;
    reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'copyright' | 'other';
    description: string;
    status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
    reviewedBy?: string;
    reviewedAt?: Timestamp;
    actionTaken?: string;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

export interface FeedStats {
    totalPosts: number;
    activePosts: number;
    hiddenPosts: number;
    deletedPosts: number;
    reportedPosts: number;
    pendingReports: number;
    totalEngagement: number;
    averageEngagement: number;
}

export interface AdminInfo {
    uid: string;
    name: string;
    email: string;
}

class ModerationService {
    private readonly postsCollection = 'feed_posts';
    private readonly reportsCollection = 'post_reports';
    private readonly moderationLogsCollection = 'moderation_logs';

    /**
     * Get all posts with optional filters for moderation view
     */
    async getPostsForModeration(filters?: {
        status?: 'all' | 'visible' | 'hidden' | 'reported';
        appSource?: string;
        authorId?: string;
        dateRange?: { start: Date; end: Date };
        searchText?: string;
        limit?: number;
    }): Promise<FeedPost[]> {
        try {
            let q = query(collection(db, this.postsCollection));

            // Add filters
            if (filters?.status === 'visible') {
                q = query(q, where('isVisible', '==', true));
            } else if (filters?.status === 'hidden') {
                q = query(q, where('isVisible', '==', false));
            } else if (filters?.status === 'reported') {
                q = query(q, where('hasReports', '==', true));
            }

            if (filters?.appSource) {
                q = query(q, where('appSource', '==', filters.appSource));
            }

            if (filters?.authorId) {
                q = query(q, where('authorId', '==', filters.authorId));
            }

            if (filters?.dateRange) {
                q = query(q,
                    where('createdAt', '>=', filters.dateRange.start),
                    where('createdAt', '<=', filters.dateRange.end)
                );
            }

            // Order by creation date (newest first)
            q = query(q, orderBy('createdAt', 'desc'));

            if (filters?.limit) {
                q = query(q, limit(filters.limit));
            }

            const snapshot = await getDocs(q);
            let posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FeedPost[];

            // Client-side text search if needed
            if (filters?.searchText) {
                const searchLower = filters.searchText.toLowerCase();
                posts = posts.filter(post =>
                    post.content.text?.toLowerCase().includes(searchLower) ||
                    post.authorName.toLowerCase().includes(searchLower) ||
                    post.companyName?.toLowerCase().includes(searchLower)
                );
            }

            return posts;
        } catch (error) {
            console.error('❌ Error fetching posts for moderation:', error);
            throw new Error('Failed to fetch posts for moderation');
        }
    }

    /**
     * Hide a post (set isVisible to false)
     */
    async hidePost(postId: string, adminInfo: AdminInfo, reason?: string): Promise<void> {
        try {
            const postRef = doc(db, this.postsCollection, postId);

            // Update post visibility
            await updateDoc(postRef, {
                isVisible: false,
                moderatedAt: serverTimestamp(),
                moderatedBy: adminInfo.uid,
                moderationReason: reason || 'Hidden by admin'
            });

            // Log the action
            await this.logModerationAction({
                postId,
                action: 'hide',
                adminUid: adminInfo.uid,
                adminName: adminInfo.name,
                adminEmail: adminInfo.email,
                reason,
                previousState: { isVisible: true }
            });

            console.log('✅ Post hidden successfully:', postId);
        } catch (error) {
            console.error('❌ Error hiding post:', error);
            throw new Error('Failed to hide post');
        }
    }

    /**
     * Restore a hidden post (set isVisible to true)
     */
    async restorePost(postId: string, adminInfo: AdminInfo, reason?: string): Promise<void> {
        try {
            const postRef = doc(db, this.postsCollection, postId);

            // Update post visibility
            await updateDoc(postRef, {
                isVisible: true,
                restoredAt: serverTimestamp(),
                restoredBy: adminInfo.uid,
                restorationReason: reason || 'Restored by admin'
            });

            // Log the action
            await this.logModerationAction({
                postId,
                action: 'restore',
                adminUid: adminInfo.uid,
                adminName: adminInfo.name,
                adminEmail: adminInfo.email,
                reason,
                previousState: { isVisible: false }
            });

            console.log('✅ Post restored successfully:', postId);
        } catch (error) {
            console.error('❌ Error restoring post:', error);
            throw new Error('Failed to restore post');
        }
    }

    /**
     * Delete a post permanently
     */
    async deletePost(postId: string, adminInfo: AdminInfo, reason?: string): Promise<void> {
        try {
            const batch = writeBatch(db);

            // Delete the main post
            const postRef = doc(db, this.postsCollection, postId);
            batch.delete(postRef);

            // Delete associated comments
            const commentsSnapshot = await getDocs(
                collection(db, this.postsCollection, postId, 'comments')
            );
            commentsSnapshot.docs.forEach(commentDoc => {
                batch.delete(commentDoc.ref);
            });

            // Delete associated likes
            const likesSnapshot = await getDocs(
                collection(db, this.postsCollection, postId, 'likes')
            );
            likesSnapshot.docs.forEach(likeDoc => {
                batch.delete(likeDoc.ref);
            });

            // Commit the batch
            await batch.commit();

            // Log the action
            await this.logModerationAction({
                postId,
                action: 'delete',
                adminUid: adminInfo.uid,
                adminName: adminInfo.name,
                adminEmail: adminInfo.email,
                reason
            });

            console.log('✅ Post deleted successfully:', postId);
        } catch (error) {
            console.error('❌ Error deleting post:', error);
            throw new Error('Failed to delete post');
        }
    }

    /**
     * Report a post
     */
    async reportPost(
        postId: string,
        reporterInfo: { uid: string; name: string; email: string },
        reportData: {
            reason: PostReport['reason'];
            description: string;
        }
    ): Promise<string> {
        try {
            const report: Omit<PostReport, 'id'> = {
                postId,
                reporterUid: reporterInfo.uid,
                reporterName: reporterInfo.name,
                reporterEmail: reporterInfo.email,
                reason: reportData.reason,
                description: reportData.description,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const reportRef = await addDoc(collection(db, this.reportsCollection), report);

            // Update post to mark it as having reports
            const postRef = doc(db, this.postsCollection, postId);
            await updateDoc(postRef, {
                hasReports: true,
                lastReportedAt: serverTimestamp()
            });

            console.log('✅ Post reported successfully:', reportRef.id);
            return reportRef.id;
        } catch (error) {
            console.error('❌ Error reporting post:', error);
            throw new Error('Failed to report post');
        }
    }

    /**
     * Get all reports with optional filters
     */
    async getReports(filters?: {
        status?: PostReport['status'];
        postId?: string;
        limit?: number;
    }): Promise<PostReport[]> {
        try {
            let q = query(collection(db, this.reportsCollection));

            if (filters?.status) {
                q = query(q, where('status', '==', filters.status));
            }

            if (filters?.postId) {
                q = query(q, where('postId', '==', filters.postId));
            }

            q = query(q, orderBy('createdAt', 'desc'));

            if (filters?.limit) {
                q = query(q, limit(filters.limit));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PostReport[];
        } catch (error) {
            console.error('❌ Error fetching reports:', error);
            throw new Error('Failed to fetch reports');
        }
    }

    /**
     * Review a report (mark as reviewed)
     */
    async reviewReport(
        reportId: string,
        adminInfo: AdminInfo,
        decision: {
            status: 'reviewed' | 'dismissed' | 'action_taken';
            actionTaken?: string;
        }
    ): Promise<void> {
        try {
            const reportRef = doc(db, this.reportsCollection, reportId);

            await updateDoc(reportRef, {
                status: decision.status,
                reviewedBy: adminInfo.uid,
                reviewedAt: serverTimestamp(),
                actionTaken: decision.actionTaken,
                updatedAt: serverTimestamp()
            });

            // Log the review action
            await this.logModerationAction({
                postId: 'report_' + reportId,
                action: 'report_reviewed',
                adminUid: adminInfo.uid,
                adminName: adminInfo.name,
                adminEmail: adminInfo.email,
                reason: `Report ${decision.status}: ${decision.actionTaken || 'No action'}`
            });

            console.log('✅ Report reviewed successfully:', reportId);
        } catch (error) {
            console.error('❌ Error reviewing report:', error);
            throw new Error('Failed to review report');
        }
    }

    /**
     * Get feed statistics for dashboard
     */
    async getFeedStats(): Promise<FeedStats> {
        try {
            // Get all posts
            const postsSnapshot = await getDocs(collection(db, this.postsCollection));
            const posts = postsSnapshot.docs.map(doc => doc.data()) as FeedPost[];

            // Get pending reports
            const pendingReportsSnapshot = await getDocs(
                query(collection(db, this.reportsCollection), where('status', '==', 'pending'))
            );

            // Calculate stats
            const totalPosts = posts.length;
            const activePosts = posts.filter(p => p.isVisible !== false).length;
            const hiddenPosts = posts.filter(p => p.isVisible === false).length;
            const deletedPosts = totalPosts - posts.length; // This would need better tracking
            const reportedPosts = posts.filter(p => p.hasReports).length;
            const pendingReports = pendingReportsSnapshot.size;

            // Calculate engagement
            const totalLikes = posts.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0);
            const totalComments = posts.reduce((sum, p) => sum + (p.engagement?.comments || 0), 0);
            const totalEngagement = totalLikes + totalComments;
            const averageEngagement = totalPosts > 0 ? totalEngagement / totalPosts : 0;

            return {
                totalPosts,
                activePosts,
                hiddenPosts,
                deletedPosts,
                reportedPosts,
                pendingReports,
                totalEngagement,
                averageEngagement
            };
        } catch (error) {
            console.error('❌ Error getting feed stats:', error);
            throw new Error('Failed to get feed statistics');
        }
    }

    /**
     * Get moderation logs
     */
    async getModerationLogs(filters?: {
        postId?: string;
        adminUid?: string;
        action?: ModerationLog['action'];
        limit?: number;
    }): Promise<ModerationLog[]> {
        try {
            let q = query(collection(db, this.moderationLogsCollection));

            if (filters?.postId) {
                q = query(q, where('postId', '==', filters.postId));
            }

            if (filters?.adminUid) {
                q = query(q, where('adminUid', '==', filters.adminUid));
            }

            if (filters?.action) {
                q = query(q, where('action', '==', filters.action));
            }

            q = query(q, orderBy('timestamp', 'desc'));

            if (filters?.limit) {
                q = query(q, limit(filters.limit));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ModerationLog[];
        } catch (error) {
            console.error('❌ Error fetching moderation logs:', error);
            throw new Error('Failed to fetch moderation logs');
        }
    }

    /**
     * Listen to posts changes in real-time
     */
    listenToPostsChanges(
        callback: (posts: FeedPost[]) => void,
        filters?: {
            status?: 'all' | 'visible' | 'hidden' | 'reported';
            limit?: number;
        }
    ): () => void {
        try {
            let q = query(collection(db, this.postsCollection));

            if (filters?.status === 'visible') {
                q = query(q, where('isVisible', '==', true));
            } else if (filters?.status === 'hidden') {
                q = query(q, where('isVisible', '==', false));
            } else if (filters?.status === 'reported') {
                q = query(q, where('hasReports', '==', true));
            }

            q = query(q, orderBy('createdAt', 'desc'));

            if (filters?.limit) {
                q = query(q, limit(filters.limit));
            }

            return onSnapshot(q, (snapshot) => {
                const posts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as FeedPost[];
                callback(posts);
            });
        } catch (error) {
            console.error('❌ Error setting up posts listener:', error);
            return () => { };
        }
    }

    /**
     * Log moderation action
     */
    private async logModerationAction(logData: Omit<ModerationLog, 'id' | 'timestamp'>): Promise<void> {
        try {
            const log: Omit<ModerationLog, 'id'> = {
                ...logData,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, this.moderationLogsCollection), log);
        } catch (error) {
            console.error('❌ Error logging moderation action:', error);
            // Don't throw here as this is a secondary operation
        }
    }
}

// Export singleton instance
export const moderationService = new ModerationService();