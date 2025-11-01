import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  FieldValue,
  QueryDocumentSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
// Integración de reputación (opcional, no intrusiva)
import {
  reputationService,
  REPUTATION_ENABLED,
} from "../reputation/reputationService";

// Types for feed system
export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorUsername?: string;
  companyId?: string;
  companyName?: string;
  appSource?: string;
  content: {
    text?: string;
    media?: Array<{
      type: "image" | "video" | "document" | "youtube" | "drive" | "vimeo";
      url: string;
      name?: string;
      thumbnail?: string;
    }>;
    mediaUrls?: string[];
    mediaTypes?: ("image" | "video" | "document")[];
    tags?: string[];
    mentions?: string[];
  };
  visibility: "public" | "followers" | "private";
  type: "text" | "media" | "shared" | "event";
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  metadata: {
    isEdited: boolean;
    editedAt?: Timestamp;
    originalPostId?: string; // For shared posts
    location?: {
      name: string;
      coordinates: [number, number];
    };
  };
  // Moderation fields
  isVisible?: boolean;
  hasReports?: boolean;
  moderatedAt?: Timestamp;
  moderatedBy?: string;
  moderationReason?: string;
  restoredAt?: Timestamp;
  restoredBy?: string;
  restorationReason?: string;
  lastReportedAt?: Timestamp;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface FeedComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentCommentId?: string; // For nested comments
  likes: number;
  likedBy: string[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: Timestamp | FieldValue;
}

export interface UserFeedPreferences {
  uid: string;
  showFollowersOnly: boolean;
  muteKeywords: string[];
  blockedUsers: string[];
  categories: {
    showText: boolean;
    showMedia: boolean;
    showShared: boolean;
    showEvents: boolean;
  };
  updatedAt: Timestamp | FieldValue;
}

export const feedService = {
  /**
   * Create a new feed post
   */
  async createPost(
    uid: string,
    postData: {
      content: FeedPost["content"];
      visibility: FeedPost["visibility"];
      type: FeedPost["type"];
      metadata?: Partial<FeedPost["metadata"]>;
      authorName: string;
      authorAvatar?: string;
      authorUsername?: string;
    },
  ): Promise<string> {
    try {
      console.log("📝 Creating feed post...", { uid, type: postData.type });

      const post: Omit<FeedPost, "id"> = {
        authorId: uid,
        authorName: postData.authorName,
        authorAvatar: postData.authorAvatar,
        authorUsername: postData.authorUsername,
        content: postData.content,
        visibility: postData.visibility,
        type: postData.type,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
        },
        metadata: {
          isEdited: false,
          ...postData.metadata,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "feed_posts"), post);

      console.log("✅ Feed post created successfully", { postId: docRef.id });

      // Hook de reputación opcional (no bloquea la creación del post)
      if (REPUTATION_ENABLED) {
        try {
          await reputationService.logAction(uid, "post_create", {
            postId: docRef.id,
            postType: postData.type,
            hasMedia: Boolean(
              postData.content.media?.length ||
                postData.content.mediaUrls?.length,
            ),
          });
        } catch (error) {
          console.log("Reputation tracking failed (non-blocking):", error);
        }
      }

      return docRef.id;
    } catch (error) {
      console.error("❌ Error creating feed post:", error);
      throw new Error("Failed to create feed post");
    }
  },

  /**
   * Get global public feed
   */
  async getGlobalFeed(
    options: {
      limitCount?: number;
      lastDoc?: QueryDocumentSnapshot;
    } = {},
  ): Promise<{
    posts: FeedPost[];
    lastDoc?: QueryDocumentSnapshot;
    hasMore: boolean;
  }> {
    try {
      console.log("🌍 Loading global feed...", {
        limitCount: options.limitCount,
      });

      let feedQuery = query(
        collection(db, "feed_posts"),
        where("visibility", "==", "public"),
        orderBy("createdAt", "desc"),
        limit(options.limitCount || 20),
      );

      if (options.lastDoc) {
        feedQuery = query(feedQuery, startAfter(options.lastDoc));
      }

      const snapshot = await getDocs(feedQuery);

      const posts: FeedPost[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FeedPost,
      );

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === (options.limitCount || 20);

      console.log("✅ Global feed loaded successfully", {
        postsCount: posts.length,
        hasMore,
      });

      return { posts, lastDoc, hasMore };
    } catch (error) {
      console.error("❌ Error loading global feed:", error);
      throw new Error("Failed to load global feed");
    }
  },

  /**
   * Get user's personalized feed
   */
  async getUserFeed(
    uid: string,
    options: {
      limitCount?: number;
      lastDoc?: QueryDocumentSnapshot;
    } = {},
  ): Promise<{
    posts: FeedPost[];
    lastDoc?: QueryDocumentSnapshot;
    hasMore: boolean;
  }> {
    try {
      console.log("👤 Loading user feed...", {
        uid,
        limitCount: options.limitCount,
      });

      // Get user preferences first
      const preferences = await this.getUserFeedPreferences(uid);

      // For now, load posts from followed users + own posts
      // In a full implementation, you'd get the user's following list
      let feedQuery = query(
        collection(db, "feed_posts"),
        where("authorId", "==", uid), // Simplified: just user's own posts
        orderBy("createdAt", "desc"),
        limit(options.limitCount || 20),
      );

      if (options.lastDoc) {
        feedQuery = query(feedQuery, startAfter(options.lastDoc));
      }

      const snapshot = await getDocs(feedQuery);

      let posts: FeedPost[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FeedPost,
      );

      // Apply user preferences filtering
      if (preferences) {
        posts = this.applyFeedFilters(posts, preferences);
      }

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === (options.limitCount || 20);

      console.log("✅ User feed loaded successfully", {
        postsCount: posts.length,
        hasMore,
      });

      return { posts, lastDoc, hasMore };
    } catch (error) {
      console.error("❌ Error loading user feed:", error);
      throw new Error("Failed to load user feed");
    }
  },

  /**
   * Get public feed by username
   */
  async getPublicFeedByUsername(
    username: string,
    options: {
      limitCount?: number;
      lastDoc?: QueryDocumentSnapshot;
    } = {},
  ): Promise<{
    posts: FeedPost[];
    lastDoc?: QueryDocumentSnapshot;
    hasMore: boolean;
  }> {
    try {
      console.log("🔍 Loading public feed by username...", { username });

      let feedQuery = query(
        collection(db, "feed_posts"),
        where("authorUsername", "==", username),
        where("visibility", "in", ["public", "followers"]),
        orderBy("createdAt", "desc"),
        limit(options.limitCount || 20),
      );

      if (options.lastDoc) {
        feedQuery = query(feedQuery, startAfter(options.lastDoc));
      }

      const snapshot = await getDocs(feedQuery);

      const posts: FeedPost[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FeedPost,
      );

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === (options.limitCount || 20);

      console.log("✅ Public feed by username loaded successfully", {
        username,
        postsCount: posts.length,
        hasMore,
      });

      return { posts, lastDoc, hasMore };
    } catch (error) {
      console.error("❌ Error loading public feed by username:", error);
      throw new Error("Failed to load public feed by username");
    }
  },

  /**
   * Get user feed preferences
   */
  async getUserFeedPreferences(
    uid: string,
  ): Promise<UserFeedPreferences | null> {
    try {
      const prefsRef = doc(db, "user_feed_preferences", uid);
      const prefsDoc = await getDoc(prefsRef);

      if (!prefsDoc.exists()) {
        // Create default preferences
        const defaultPrefs: UserFeedPreferences = {
          uid,
          showFollowersOnly: false,
          muteKeywords: [],
          blockedUsers: [],
          categories: {
            showText: true,
            showMedia: true,
            showShared: true,
            showEvents: true,
          },
          updatedAt: serverTimestamp(),
        };

        await doc(db, "user_feed_preferences", uid);
        return defaultPrefs;
      }

      return {
        uid: prefsDoc.id,
        ...prefsDoc.data(),
      } as UserFeedPreferences;
    } catch (error) {
      console.error("❌ Error getting feed preferences:", error);
      return null;
    }
  },

  /**
   * Apply filters to feed based on user preferences
   */
  applyFeedFilters(
    posts: FeedPost[],
    preferences: UserFeedPreferences,
  ): FeedPost[] {
    return posts.filter((post) => {
      // Filter by blocked users
      if (preferences.blockedUsers.includes(post.authorId)) {
        return false;
      }

      // Filter by muted keywords
      const postText = post.content.text?.toLowerCase() || "";
      if (
        preferences.muteKeywords.some((keyword) =>
          postText.includes(keyword.toLowerCase()),
        )
      ) {
        return false;
      }

      // Filter by post type preferences
      const { categories } = preferences;
      switch (post.type) {
        case "text":
          return categories.showText;
        case "media":
          return categories.showMedia;
        case "shared":
          return categories.showShared;
        case "event":
          return categories.showEvents;
        default:
          return true;
      }
    });
  },

  /**
   * Update post engagement metrics (views, etc.)
   */
  async incrementPostViews(postId: string): Promise<void> {
    try {
      const postRef = doc(db, "feed_posts", postId);
      await updateDoc(postRef, {
        "engagement.views": increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ Error incrementing post views:", error);
      // Don't throw error for view tracking failure
    }
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string, uid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting post...", { postId, uid });

      const postRef = doc(db, "feed_posts", postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      const postData = postDoc.data() as FeedPost;
      if (postData.authorId !== uid) {
        throw new Error("Unauthorized to delete this post");
      }

      await deleteDoc(postRef);

      console.log("✅ Post deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting post:", error);
      throw new Error("Failed to delete post");
    }
  },

  /**
   * Toggle like on a post
   */
  async togglePostLike(
    postId: string,
    uid: string,
    userData: { userName: string; userAvatar?: string },
  ): Promise<{ liked: boolean; likesCount: number }> {
    try {
      console.log("❤️ Toggling post like...", { postId, uid });

      const postRef = doc(db, "feed_posts", postId);
      const likesRef = collection(db, "feed_posts", postId, "likes");
      const userLikeRef = doc(likesRef, uid);

      // Check if user already liked the post
      const userLikeDoc = await getDoc(userLikeRef);
      const isCurrentlyLiked = userLikeDoc.exists();

      if (isCurrentlyLiked) {
        // Remove like
        await deleteDoc(userLikeRef);
        await updateDoc(postRef, {
          "engagement.likes": increment(-1),
          updatedAt: serverTimestamp(),
        });

        console.log("💔 Like removed");

        // Get updated likes count
        const postDoc = await getDoc(postRef);
        const likesCount = postDoc.exists()
          ? (postDoc.data() as FeedPost).engagement.likes
          : 0;

        return { liked: false, likesCount };
      } else {
        // Add like
        const likeData: Omit<PostLike, "id"> = {
          postId,
          userId: uid,
          userName: userData.userName,
          userAvatar: userData.userAvatar,
          createdAt: serverTimestamp(),
        };

        await setDoc(userLikeRef, likeData);
        await updateDoc(postRef, {
          "engagement.likes": increment(1),
          updatedAt: serverTimestamp(),
        });

        console.log("❤️ Like added");

        // Get updated likes count
        const postDoc = await getDoc(postRef);
        const likesCount = postDoc.exists()
          ? (postDoc.data() as FeedPost).engagement.likes
          : 0;

        return { liked: true, likesCount };
      }
    } catch (error) {
      console.error("❌ Error toggling post like:", error);
      throw new Error("Failed to toggle post like");
    }
  },

  /**
   * Check if user has liked a post
   */
  async hasUserLikedPost(postId: string, uid: string): Promise<boolean> {
    try {
      const userLikeRef = doc(db, "feed_posts", postId, "likes", uid);
      const userLikeDoc = await getDoc(userLikeRef);
      return userLikeDoc.exists();
    } catch (error) {
      console.error("❌ Error checking if user liked post:", error);
      return false;
    }
  },

  /**
   * Add a comment to a post
   */
  async addComment(
    postId: string,
    uid: string,
    commentData: {
      content: string;
      authorName: string;
      authorAvatar?: string;
      parentCommentId?: string;
    },
  ): Promise<string> {
    try {
      console.log("💬 Adding comment...", { postId, uid });

      const commentsRef = collection(db, "feed_posts", postId, "comments");
      const postRef = doc(db, "feed_posts", postId);

      const comment: Omit<FeedComment, "id"> = {
        postId,
        authorId: uid,
        authorName: commentData.authorName,
        authorAvatar: commentData.authorAvatar,
        content: commentData.content,
        parentCommentId: commentData.parentCommentId,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const commentDoc = await addDoc(commentsRef, comment);

      // Update post comment count
      await updateDoc(postRef, {
        "engagement.comments": increment(1),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Comment added successfully", {
        commentId: commentDoc.id,
      });
      return commentDoc.id;
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      throw new Error("Failed to add comment");
    }
  },

  /**
   * Get comments for a post
   */
  async getPostComments(
    postId: string,
    options: {
      limitCount?: number;
      lastDoc?: QueryDocumentSnapshot;
    } = {},
  ): Promise<{
    comments: FeedComment[];
    lastDoc?: QueryDocumentSnapshot;
    hasMore: boolean;
  }> {
    try {
      console.log("📄 Loading post comments...", {
        postId,
        limitCount: options.limitCount,
      });

      let commentsQuery = query(
        collection(db, "feed_posts", postId, "comments"),
        orderBy("createdAt", "desc"),
        limit(options.limitCount || 10),
      );

      if (options.lastDoc) {
        commentsQuery = query(commentsQuery, startAfter(options.lastDoc));
      }

      const snapshot = await getDocs(commentsQuery);

      const comments: FeedComment[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FeedComment,
      );

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === (options.limitCount || 10);

      console.log("✅ Comments loaded successfully", {
        commentsCount: comments.length,
        hasMore,
      });

      return { comments, lastDoc, hasMore };
    } catch (error) {
      console.error("❌ Error loading comments:", error);
      throw new Error("Failed to load comments");
    }
  },

  /**
   * Listen to comments in real time
   */
  listenToPostComments(
    postId: string,
    callback: (comments: FeedComment[]) => void,
  ): () => void {
    console.log("👂 Setting up comments listener...", { postId });

    const commentsQuery = query(
      collection(db, "feed_posts", postId, "comments"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const comments: FeedComment[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as FeedComment,
        );

        console.log("🔄 Comments updated via listener", {
          commentsCount: comments.length,
        });
        callback(comments);
      },
      (error) => {
        console.error("❌ Comments listener error:", error);
      },
    );

    return unsubscribe;
  },

  /**
   * Delete a comment
   */
  async deleteComment(
    postId: string,
    commentId: string,
    uid: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    try {
      console.log("🗑️ Deleting comment...", {
        postId,
        commentId,
        uid,
        isAdmin,
      });

      const commentRef = doc(db, "feed_posts", postId, "comments", commentId);
      const commentDoc = await getDoc(commentRef);

      if (!commentDoc.exists()) {
        throw new Error("Comment not found");
      }

      const commentData = commentDoc.data() as FeedComment;

      // Only allow deletion by comment author or admin
      if (commentData.authorId !== uid && !isAdmin) {
        throw new Error("Unauthorized to delete this comment");
      }

      await deleteDoc(commentRef);

      // Update post comment count
      const postRef = doc(db, "feed_posts", postId);
      await updateDoc(postRef, {
        "engagement.comments": increment(-1),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Comment deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
      throw new Error("Failed to delete comment");
    }
  },

  /**
   * Delete a post (enhanced with admin permissions)
   */
  async deletePostEnhanced(
    postId: string,
    uid: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    try {
      console.log("🗑️ Deleting post (enhanced)...", { postId, uid, isAdmin });

      const postRef = doc(db, "feed_posts", postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      const postData = postDoc.data() as FeedPost;

      // Only allow deletion by post author or admin
      if (postData.authorId !== uid && !isAdmin) {
        throw new Error("Unauthorized to delete this post");
      }

      // Delete all comments first
      const commentsRef = collection(db, "feed_posts", postId, "comments");
      const commentsSnapshot = await getDocs(commentsRef);

      const deletePromises = commentsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref),
      );
      await Promise.all(deletePromises);

      // Delete all likes
      const likesRef = collection(db, "feed_posts", postId, "likes");
      const likesSnapshot = await getDocs(likesRef);

      const deleteLikesPromises = likesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref),
      );
      await Promise.all(deleteLikesPromises);

      // Finally delete the post
      await deleteDoc(postRef);

      console.log("✅ Post and all related data deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting post:", error);
      throw new Error("Failed to delete post");
    }
  },
};
