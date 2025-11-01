// Solutions Service - Firebase Firestore Integration
// FASE 7.0 - SOLUCIONES EMPRESARIALES

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import type {
  Solution,
  OrgSolution,
  CreateSolutionData,
  CreateOrgSolutionData,
  SolutionAccess,
  SolutionEvent,
} from "../types";

class SolutionsService {
  private solutionsCollection = collection(db, "solutions");
  private orgSolutionsCollection = collection(db, "org_solutions");
  private eventsCollection = collection(db, "solution_events");

  // Solutions CRUD Operations
  async getAllSolutions(): Promise<Solution[]> {
    try {
      const q = query(this.solutionsCollection, orderBy("name"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Solution[];
    } catch (error) {
      console.error("Error fetching solutions:", error);
      throw new Error("Failed to fetch solutions");
    }
  }

  async getSolutionByKey(key: string): Promise<Solution | null> {
    try {
      const q = query(this.solutionsCollection, where("key", "==", key));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Solution;
    } catch (error) {
      console.error("Error fetching solution by key:", error);
      throw new Error("Failed to fetch solution");
    }
  }

  async createSolution(
    data: CreateSolutionData,
    createdBy: string,
  ): Promise<Solution> {
    try {
      // Check if key already exists
      const existing = await this.getSolutionByKey(data.key);
      if (existing) {
        throw new Error("Solution with this key already exists");
      }

      const solutionData = {
        ...data,
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy,
      };

      const docRef = await addDoc(this.solutionsCollection, solutionData);

      return {
        id: docRef.id,
        ...solutionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Solution;
    } catch (error) {
      console.error("Error creating solution:", error);
      throw error;
    }
  }

  async updateSolution(id: string, data: Partial<Solution>): Promise<void> {
    try {
      const docRef = doc(this.solutionsCollection, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating solution:", error);
      throw new Error("Failed to update solution");
    }
  }

  async deleteSolution(id: string): Promise<void> {
    try {
      const docRef = doc(this.solutionsCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting solution:", error);
      throw new Error("Failed to delete solution");
    }
  }

  // Organization Solutions Management
  async getOrgSolutions(orgId: string): Promise<OrgSolution[]> {
    try {
      const q = query(
        this.orgSolutionsCollection,
        where("orgId", "==", orgId),
        orderBy("grantedAt", "desc"),
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        grantedAt: doc.data().grantedAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as OrgSolution[];
    } catch (error) {
      console.error("Error fetching org solutions:", error);
      throw new Error("Failed to fetch organization solutions");
    }
  }

  async grantSolutionAccess(
    data: CreateOrgSolutionData,
    grantedBy: string,
  ): Promise<void> {
    try {
      // Check if access already exists
      const q = query(
        this.orgSolutionsCollection,
        where("orgId", "==", data.orgId),
        where("solutionKey", "==", data.solutionKey),
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        throw new Error("Organization already has access to this solution");
      }

      const orgSolutionData = {
        ...data,
        enabled: true,
        grantedBy,
        grantedAt: Timestamp.now(),
        usage: {
          totalViews: 0,
          totalConversions: 0,
        },
        ...(data.expiresAt && {
          expiresAt: Timestamp.fromDate(data.expiresAt),
        }),
      };

      await addDoc(this.orgSolutionsCollection, orgSolutionData);
    } catch (error) {
      console.error("Error granting solution access:", error);
      throw error;
    }
  }

  async revokeSolutionAccess(
    orgId: string,
    solutionKey: string,
  ): Promise<void> {
    try {
      const q = query(
        this.orgSolutionsCollection,
        where("orgId", "==", orgId),
        where("solutionKey", "==", solutionKey),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("Access not found");
      }

      const docRef = doc(this.orgSolutionsCollection, snapshot.docs[0].id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error revoking solution access:", error);
      throw error;
    }
  }

  async updateOrgSolutionSettings(
    orgId: string,
    solutionKey: string,
    settings: Record<string, any>,
  ): Promise<void> {
    try {
      const q = query(
        this.orgSolutionsCollection,
        where("orgId", "==", orgId),
        where("solutionKey", "==", solutionKey),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("Access not found");
      }

      const docRef = doc(this.orgSolutionsCollection, snapshot.docs[0].id);
      await updateDoc(docRef, { settings });
    } catch (error) {
      console.error("Error updating org solution settings:", error);
      throw error;
    }
  }

  // Access Validation
  async validateSolutionAccess(
    orgId: string,
    solutionKey: string,
  ): Promise<SolutionAccess> {
    try {
      // First check if solution exists
      const solution = await this.getSolutionByKey(solutionKey);
      if (!solution) {
        return { hasAccess: false, reason: "not_found" };
      }

      // Check if solution is active
      if (!solution.active) {
        return { hasAccess: false, solution, reason: "not_enabled" };
      }

      // Check if organization is in allowed list
      if (!solution.allowedOrgs.includes(orgId)) {
        return { hasAccess: false, solution, reason: "org_not_allowed" };
      }

      // Check organization-specific access
      const q = query(
        this.orgSolutionsCollection,
        where("orgId", "==", orgId),
        where("solutionKey", "==", solutionKey),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { hasAccess: false, solution, reason: "not_enabled" };
      }

      const orgSolution = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
        grantedAt: snapshot.docs[0].data().grantedAt?.toDate() || new Date(),
        expiresAt: snapshot.docs[0].data().expiresAt?.toDate(),
      } as OrgSolution;

      // Check if access is enabled
      if (!orgSolution.enabled) {
        return {
          hasAccess: false,
          solution,
          orgSolution,
          reason: "not_enabled",
        };
      }

      // Check if access has expired
      if (orgSolution.expiresAt && orgSolution.expiresAt < new Date()) {
        return { hasAccess: false, solution, orgSolution, reason: "expired" };
      }

      return { hasAccess: true, solution, orgSolution };
    } catch (error) {
      console.error("Error validating solution access:", error);
      throw new Error("Failed to validate solution access");
    }
  }

  // Event Tracking
  async trackSolutionEvent(
    eventData: Omit<SolutionEvent, "id" | "timestamp">,
  ): Promise<void> {
    try {
      const event = {
        ...eventData,
        timestamp: Timestamp.now(),
      };

      await addDoc(this.eventsCollection, event);

      // Update usage stats if it's a view or conversion
      if (eventData.event === "view" || eventData.event === "conversion") {
        await this.updateUsageStats(
          eventData.orgId,
          eventData.solutionKey,
          eventData.event,
        );
      }
    } catch (error) {
      console.error("Error tracking solution event:", error);
      // Don't throw error for tracking failures to avoid breaking user flow
    }
  }

  private async updateUsageStats(
    orgId: string,
    solutionKey: string,
    event: "view" | "conversion",
  ): Promise<void> {
    try {
      const q = query(
        this.orgSolutionsCollection,
        where("orgId", "==", orgId),
        where("solutionKey", "==", solutionKey),
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(this.orgSolutionsCollection, snapshot.docs[0].id);
        const currentData = snapshot.docs[0].data();
        const usage = currentData.usage || {
          totalViews: 0,
          totalConversions: 0,
        };

        const updates: any = {
          "usage.lastUsed": Timestamp.now(),
        };

        if (event === "view") {
          updates["usage.totalViews"] = (usage.totalViews || 0) + 1;
        } else if (event === "conversion") {
          updates["usage.totalConversions"] = (usage.totalConversions || 0) + 1;
        }

        await updateDoc(docRef, updates);
      }
    } catch (error) {
      console.error("Error updating usage stats:", error);
    }
  }

  // Analytics
  async getSolutionEvents(
    solutionKey: string,
    orgId?: string,
    limit = 100,
  ): Promise<SolutionEvent[]> {
    try {
      let q = query(
        this.eventsCollection,
        where("solutionKey", "==", solutionKey),
        orderBy("timestamp", "desc"),
      );

      if (orgId) {
        q = query(
          this.eventsCollection,
          where("solutionKey", "==", solutionKey),
          where("orgId", "==", orgId),
          orderBy("timestamp", "desc"),
        );
      }

      const snapshot = await getDocs(q);

      return snapshot.docs.slice(0, limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as SolutionEvent[];
    } catch (error) {
      console.error("Error fetching solution events:", error);
      throw new Error("Failed to fetch solution events");
    }
  }
}

export const solutionsService = new SolutionsService();
