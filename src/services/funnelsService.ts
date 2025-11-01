// Funnels Service
// Core service for funnel management, tracking, and conversion analytics

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { solutionsService } from "../modules/solutions/services/solutionsService";
import {
  Funnel,
  FunnelSubmission,
  FunnelEvent,
  Organization,
  OrgMember,
  CreateFunnelData,
  UpdateFunnelData,
  FunnelMetrics,
  FunnelAnalytics,
} from "../modules/funnels/types";

class FunnelsService {
  private static instance: FunnelsService;

  static getInstance(): FunnelsService {
    if (!FunnelsService.instance) {
      FunnelsService.instance = new FunnelsService();
    }
    return FunnelsService.instance;
  }

  // ==================== FUNNEL EVENT TRACKING ====================

  async registerFunnelEvent(
    userId: string | null,
    source: "feed" | "event" | "community" | "challenge" | "direct",
    stage: "awareness" | "interest" | "action" | "conversion",
    metadata: Record<string, any> = {},
  ): Promise<void> {
    try {
      await addDoc(collection(db, "funnel_events"), {
        userId: userId || null,
        source,
        stage,
        metadata,
        timestamp: serverTimestamp(),
        sessionId: this.getSessionId(),
      });
    } catch (error) {
      console.error("Error registering funnel event:", error);
      // Don't throw - tracking should be non-blocking
    }
  }

  async trackFunnelView(funnelId: string, userId?: string): Promise<void> {
    try {
      // Update funnel analytics
      const funnelRef = doc(db, "funnels", funnelId);
      await updateDoc(funnelRef, {
        "analytics.views": increment(1),
        "analytics.lastUpdated": serverTimestamp(),
      });

      // Register event
      await this.registerFunnelEvent(userId || null, "direct", "awareness", {
        funnelId,
        action: "view",
      });
    } catch (error) {
      console.error("Error tracking funnel view:", error);
    }
  }

  async trackFunnelSubmission(
    funnelId: string,
    submissionId: string,
    userId?: string,
  ): Promise<void> {
    try {
      // Update funnel analytics
      const funnelRef = doc(db, "funnels", funnelId);
      await updateDoc(funnelRef, {
        "analytics.submissions": increment(1),
        "analytics.lastUpdated": serverTimestamp(),
      });

      // Register event
      await this.registerFunnelEvent(userId || null, "direct", "conversion", {
        funnelId,
        submissionId,
        action: "submit",
      });

      // Recalculate conversion rate
      await this.updateConversionRate(funnelId);
    } catch (error) {
      console.error("Error tracking funnel submission:", error);
    }
  }

  // ==================== FUNNEL MANAGEMENT ====================

  // Get funnel by organization and funnel slug (for public access)
  async getFunnelBySlug(
    orgSlug: string,
    funnelSlug: string,
  ): Promise<Funnel | null> {
    try {
      // First get organization by slug
      const orgsQuery = query(
        collection(db, "organizations"),
        where("slug", "==", orgSlug),
        where("isActive", "==", true),
        limit(1),
      );

      const orgSnapshot = await getDocs(orgsQuery);

      if (orgSnapshot.empty) {
        return null;
      }

      const org = orgSnapshot.docs[0];
      const organizationId = org.id;

      // Then get funnel by slug within organization
      const funnelsQuery = query(
        collection(db, "funnels"),
        where("organizationId", "==", organizationId),
        where("slug", "==", funnelSlug),
        where("isPublished", "==", true),
        limit(1),
      );

      const funnelSnapshot = await getDocs(funnelsQuery);

      if (funnelSnapshot.empty) {
        return null;
      }

      const funnelDoc = funnelSnapshot.docs[0];
      return {
        id: funnelDoc.id,
        ...funnelDoc.data(),
        createdAt: funnelDoc.data().createdAt?.toDate(),
        updatedAt: funnelDoc.data().updatedAt?.toDate(),
      } as Funnel;
    } catch (error) {
      console.error("Error getting funnel by slug:", error);
      throw error;
    }
  }

  async createFunnel(
    organizationId: string,
    userId: string,
    data: CreateFunnelData,
  ): Promise<string> {
    try {
      // Validate user permissions
      await this.validateOrgPermission(organizationId, userId, [
        "owner",
        "admin",
      ]);

      // Generate unique slug
      const slug = await this.generateUniqueSlug(organizationId, data.name);

      const funnelData: Omit<Funnel, "id"> = {
        organizationId,
        name: data.name,
        slug,
        description: data.description,
        status: "draft",
        steps: data.steps.map((step, index) => ({
          ...step,
          id: `step_${Date.now()}_${index}`,
          order: index,
        })),
        settings: data.settings,
        workflowId: data.workflowId,
        analytics: {
          views: 0,
          submissions: 0,
          conversionRate: 0,
          lastUpdated: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        tags: [],
      };

      const docRef = await addDoc(collection(db, "funnels"), funnelData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating funnel:", error);
      throw error;
    }
  }

  async updateFunnel(
    funnelId: string,
    userId: string,
    updates: UpdateFunnelData,
  ): Promise<void> {
    try {
      const funnel = await this.getFunnel(funnelId);
      if (!funnel) {
        throw new Error("Funnel not found");
      }

      await this.validateOrgPermission(funnel.organizationId, userId, [
        "owner",
        "admin",
      ]);

      await updateDoc(doc(db, "funnels", funnelId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating funnel:", error);
      throw error;
    }
  }

  async deleteFunnel(funnelId: string, userId: string): Promise<void> {
    try {
      const funnel = await this.getFunnel(funnelId);
      if (!funnel) {
        throw new Error("Funnel not found");
      }

      await this.validateOrgPermission(funnel.organizationId, userId, [
        "owner",
        "admin",
      ]);

      await deleteDoc(doc(db, "funnels", funnelId));
    } catch (error) {
      console.error("Error deleting funnel:", error);
      throw error;
    }
  }

  async getFunnel(funnelId: string): Promise<Funnel | null> {
    try {
      const docSnap = await getDoc(doc(db, "funnels", funnelId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Funnel;
      }
      return null;
    } catch (error) {
      console.error("Error getting funnel:", error);
      return null;
    }
  }

  async getOrganizationFunnels(organizationId: string): Promise<Funnel[]> {
    try {
      const q = query(
        collection(db, "funnels"),
        where("organizationId", "==", organizationId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Funnel[];
    } catch (error) {
      console.error("Error getting organization funnels:", error);
      return [];
    }
  }

  // ==================== SUBMISSIONS ====================

  async submitFunnel(
    funnelId: string,
    formData: Record<string, any>,
    metadata: {
      source?: string;
      userAgent: string;
      ipAddress: string;
      utmParams?: Record<string, string>;
    },
  ): Promise<string> {
    try {
      const submissionData: Omit<FunnelSubmission, "id"> = {
        funnelId,
        organizationId: "", // Will be filled from funnel data
        formData,
        responses: formData, // Alias for backward compatibility
        email: formData.email,
        phone: formData.phone,
        source: (metadata.source as any) || "direct",
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        utmParams: metadata.utmParams,
        status: "new",
        notes: [],
        submittedAt: new Date(),
        updatedAt: new Date(),
      };

      // Get funnel to get organization ID
      const funnel = await this.getFunnel(funnelId);
      if (funnel) {
        submissionData.organizationId = funnel.organizationId;
      }

      const docRef = await addDoc(
        collection(db, "funnel_submissions"),
        submissionData,
      );

      // Track the submission
      await this.trackFunnelSubmission(funnelId, docRef.id);

      return docRef.id;
    } catch (error) {
      console.error("Error submitting funnel:", error);
      throw error;
    }
  }

  async getFunnelSubmissions(
    funnelId: string,
    userId: string,
    limitCount = 50,
  ): Promise<FunnelSubmission[]> {
    try {
      const funnel = await this.getFunnel(funnelId);
      if (!funnel) {
        throw new Error("Funnel not found");
      }

      await this.validateOrgPermission(funnel.organizationId, userId, [
        "owner",
        "admin",
        "member",
      ]);

      const q = query(
        collection(db, "funnel_submissions"),
        where("funnelId", "==", funnelId),
        orderBy("submittedAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FunnelSubmission[];
    } catch (error) {
      console.error("Error getting funnel submissions:", error);
      return [];
    }
  }

  // ==================== ANALYTICS ====================

  async getFunnelMetrics(
    funnelId: string,
    userId: string,
  ): Promise<FunnelMetrics | null> {
    try {
      const funnel = await this.getFunnel(funnelId);
      if (!funnel) {
        return null;
      }

      await this.validateOrgPermission(funnel.organizationId, userId, [
        "owner",
        "admin",
        "member",
      ]);

      // Get basic metrics from funnel
      const basicMetrics = {
        views: funnel.analytics.views,
        submissions: funnel.analytics.submissions,
        conversionRate: funnel.analytics.conversionRate,
        timeOnPage: 0, // Would need additional tracking
      };

      // Get top sources from events
      const eventsQuery = query(
        collection(db, "funnel_events"),
        where("metadata.funnelId", "==", funnelId),
        limit(1000),
      );

      const eventsSnap = await getDocs(eventsQuery);
      const sources: Record<string, number> = {};

      eventsSnap.docs.forEach((doc) => {
        const data = doc.data();
        const source = data.source;
        sources[source] = (sources[source] || 0) + 1;
      });

      const topSources = Object.entries(sources)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Daily stats would require more complex aggregation
      const dailyStats: Array<{
        date: string;
        views: number;
        submissions: number;
      }> = [];

      return {
        ...basicMetrics,
        topSources,
        dailyStats,
      };
    } catch (error) {
      console.error("Error getting funnel metrics:", error);
      return null;
    }
  }

  async getFunnelEvents(
    funnelId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      eventType?: string;
    } = {},
  ): Promise<FunnelEvent[]> {
    try {
      const funnel = await this.getFunnel(funnelId);
      if (!funnel) {
        throw new Error("Funnel not found");
      }

      const constraints: QueryConstraint[] = [
        where("metadata.funnelId", "==", funnelId),
      ];

      if (options.eventType) {
        constraints.push(where("event", "==", options.eventType));
      }

      if (options.startDate) {
        constraints.push(where("timestamp", ">=", options.startDate));
      }

      if (options.endDate) {
        constraints.push(where("timestamp", "<=", options.endDate));
      }

      constraints.push(orderBy("timestamp", "desc"));

      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, "funnel_events"), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || null,
          event: data.event,
          timestamp: data.timestamp?.toDate() || new Date(),
          metadata: data.metadata || {},
          source: data.source,
        } as FunnelEvent;
      });
    } catch (error) {
      console.error("Error getting funnel events:", error);
      return [];
    }
  }

  // ==================== ORGANIZATION MANAGEMENT ====================

  async createOrganization(
    userId: string,
    data: { name: string; slug: string; [key: string]: any },
  ): Promise<string> {
    try {
      const orgData: Omit<Organization, "id"> = {
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        branding: data.branding || {
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
        },
        settings: {
          allowPublicFunnels: true,
          requireApproval: false,
          maxFunnels: 10,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
      };

      const docRef = await addDoc(collection(db, "organizations"), orgData);

      // Add user as owner
      await addDoc(collection(db, "org_members"), {
        organizationId: docRef.id,
        userId,
        role: "owner",
        permissions: ["all"],
        joinedAt: serverTimestamp(),
        status: "active",
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    try {
      const membersQuery = query(
        collection(db, "org_members"),
        where("userId", "==", userId),
        where("status", "==", "active"),
      );

      const membersSnap = await getDocs(membersQuery);
      const orgIds = membersSnap.docs.map((doc) => doc.data().organizationId);

      if (orgIds.length === 0) {
        return [];
      }

      // Get organizations (in production, use batch get for efficiency)
      const organizations: Organization[] = [];
      for (const orgId of orgIds) {
        const orgDoc = await getDoc(doc(db, "organizations", orgId));
        if (orgDoc.exists()) {
          organizations.push({
            id: orgDoc.id,
            ...orgDoc.data(),
          } as Organization);
        }
      }

      return organizations;
    } catch (error) {
      console.error("Error getting user organizations:", error);
      return [];
    }
  }

  // ==================== PRIVATE HELPERS ====================

  private async validateOrgPermission(
    organizationId: string,
    userId: string,
    requiredRoles: string[],
  ): Promise<void> {
    const memberQuery = query(
      collection(db, "org_members"),
      where("organizationId", "==", organizationId),
      where("userId", "==", userId),
      where("status", "==", "active"),
      limit(1),
    );

    const memberSnap = await getDocs(memberQuery);

    if (memberSnap.empty) {
      throw new Error("Access denied: Not a member of this organization");
    }

    const member = memberSnap.docs[0].data() as OrgMember;

    if (!requiredRoles.includes(member.role)) {
      throw new Error(
        `Access denied: Requires role: ${requiredRoles.join(" or ")}`,
      );
    }
  }

  private async generateUniqueSlug(
    organizationId: string,
    name: string,
  ): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(organizationId, slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private async slugExists(
    organizationId: string,
    slug: string,
  ): Promise<boolean> {
    const q = query(
      collection(db, "funnels"),
      where("organizationId", "==", organizationId),
      where("slug", "==", slug),
      limit(1),
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  private async updateConversionRate(funnelId: string): Promise<void> {
    try {
      const funnel = await this.getFunnel(funnelId);
      if (!funnel) return;

      const conversionRate =
        funnel.analytics.views > 0
          ? (funnel.analytics.submissions / funnel.analytics.views) * 100
          : 0;

      await updateDoc(doc(db, "funnels", funnelId), {
        "analytics.conversionRate": conversionRate,
        "analytics.lastUpdated": serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating conversion rate:", error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem("funnel_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("funnel_session_id", sessionId);
    }
    return sessionId;
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  subscribeToOrganizationFunnels(
    organizationId: string,
    callback: (funnels: Funnel[]) => void,
  ): () => void {
    const q = query(
      collection(db, "funnels"),
      where("organizationId", "==", organizationId),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(q, (snapshot) => {
      const funnels = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Funnel[];
      callback(funnels);
    });
  }

  subscribeToFunnelSubmissions(
    funnelId: string,
    callback: (submissions: FunnelSubmission[]) => void,
  ): () => void {
    const q = query(
      collection(db, "funnel_submissions"),
      where("funnelId", "==", funnelId),
      orderBy("submittedAt", "desc"),
      limit(100),
    );

    return onSnapshot(q, (snapshot) => {
      const submissions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FunnelSubmission[];
      callback(submissions);
    });
  }

  // Solution Integration Methods
  async validateAndRedirectToSolution(
    funnelId: string,
    organizationId: string,
    solutionKey: string,
  ): Promise<{ success: boolean; redirectUrl?: string; reason?: string }> {
    try {
      // Validate solution access
      const access = await solutionsService.validateSolutionAccess(
        organizationId,
        solutionKey,
      );

      if (!access.hasAccess) {
        // Track failed access attempt
        await this.registerFunnelEvent(funnelId, "direct", "awareness", {
          solutionKey,
          accessDenied: true,
          reason: access.reason,
        });

        // Send notification email for access request
        await this.sendSolutionAccessRequestEmail(
          organizationId,
          solutionKey,
          access.reason,
        );

        return {
          success: false,
          reason: access.reason,
          redirectUrl: "/soon", // Redirect to coming soon page
        };
      }

      // Track successful access
      await this.registerFunnelEvent(funnelId, "direct", "conversion", {
        solutionKey,
        accessGranted: true,
      });

      // Track solution view event
      await solutionsService.trackSolutionEvent({
        solutionKey,
        orgId: organizationId,
        event: "redirect",
        metadata: {
          source: "funnel",
          funnelId,
          timestamp: new Date().toISOString(),
        },
      });

      return {
        success: true,
        redirectUrl:
          access.solution?.routeReader || `/solutions/${solutionKey}/start`,
      };
    } catch (error) {
      console.error("Error validating solution access:", error);

      // Track error
      await this.registerFunnelEvent(funnelId, "direct", "awareness", {
        solutionKey,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        reason: "validation_error",
        redirectUrl: "/error",
      };
    }
  }

  private async sendSolutionAccessRequestEmail(
    organizationId: string,
    solutionKey: string,
    reason?: string,
  ): Promise<void> {
    try {
      // This would typically integrate with your email service
      // For now, we'll log the request
      console.log("Solution access request:", {
        organizationId,
        solutionKey,
        reason,
        timestamp: new Date().toISOString(),
      });

      // You could integrate with services like:
      // - SendGrid
      // - AWS SES
      // - Firebase Functions for email
      // - Resend

      // Example email data structure:
      const emailData = {
        to: "admin@mundero.com",
        subject: `Solution Access Request - ${solutionKey}`,
        template: "solution_access_request",
        data: {
          organizationId,
          solutionKey,
          reason,
          requestedAt: new Date().toISOString(),
          actionUrl: `https://app.mundero.com/admin/solutions/${solutionKey}/access`,
        },
      };

      // TODO: Implement actual email sending
      // await emailService.send(emailData);
    } catch (error) {
      console.error("Failed to send solution access request email:", error);
    }
  }

  // Helper method to process funnel completion with solution destination
  async processFunnelCompletion(
    submission: FunnelSubmission,
    funnel: Funnel,
  ): Promise<{ redirectUrl?: string; action: string }> {
    try {
      // Check if funnel has solution destination
      if (
        funnel.settings?.destination === "solution" &&
        funnel.settings?.solutionKey
      ) {
        const validationResult = await this.validateAndRedirectToSolution(
          funnel.id,
          submission.organizationId,
          funnel.settings.solutionKey,
        );

        if (validationResult.success) {
          return {
            redirectUrl: validationResult.redirectUrl,
            action: "redirect_to_solution",
          };
        } else {
          return {
            redirectUrl: validationResult.redirectUrl || "/soon",
            action: "access_denied",
          };
        }
      }

      // Default behavior for non-solution funnels
      if (funnel.settings?.destination === "email") {
        // Send email notification
        await this.sendFunnelCompletionEmail(submission, funnel);
        return { action: "email_sent" };
      }

      if (
        funnel.settings?.destination === "redirect" &&
        funnel.settings?.redirectUrl
      ) {
        return {
          redirectUrl: funnel.settings.redirectUrl,
          action: "external_redirect",
        };
      }

      return { action: "default_completion" };
    } catch (error) {
      console.error("Error processing funnel completion:", error);
      return { action: "error" };
    }
  }

  private async sendFunnelCompletionEmail(
    submission: FunnelSubmission,
    funnel: Funnel,
  ): Promise<void> {
    try {
      // Example email notification logic
      const emailData = {
        to: funnel.settings?.notificationEmail || "admin@mundero.com",
        subject: `New submission: ${funnel.name}`,
        template: "funnel_completion",
        data: {
          funnelName: funnel.name,
          submissionId: submission.id,
          submittedAt: submission.submittedAt,
          organizationId: submission.organizationId,
          responses: submission.responses,
          viewUrl: `https://app.mundero.com/funnels/${funnel.id}/submissions/${submission.id}`,
        },
      };

      // TODO: Implement actual email sending
      console.log("Funnel completion email:", emailData);
    } catch (error) {
      console.error("Failed to send funnel completion email:", error);
    }
  }
}

// Export singleton instance
export const funnelsService = FunnelsService.getInstance();

// Export the class for testing
export { FunnelsService };
