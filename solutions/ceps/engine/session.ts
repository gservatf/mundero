import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface SessionData {
    userId: string;
    mode: "user" | "corporate";
    answers: Record<number, number>;
    order: number[];
    startedAt: number;
    lastSavedAt: number;
    progress: number;

    // Corporate mode data
    companyName?: string;
    area?: string;
    position?: string;
    userName?: string;
    userEmail?: string;
}

export async function saveSession(userId: string, data: Partial<SessionData>): Promise<void> {
    if (!userId) return;

    try {
        const sessionData: Partial<SessionData> = {
            ...data,
            userId,
            lastSavedAt: Date.now()
        };

        await setDoc(
            doc(db, "solutions_sessions", `ceps_${userId}`),
            sessionData,
            { merge: true }
        );
    } catch (error) {
        console.error("Error saving CEPS session:", error);
        throw error;
    }
}

export async function loadSession(userId: string): Promise<SessionData | null> {
    if (!userId) return null;

    try {
        const snap = await getDoc(doc(db, "solutions_sessions", `ceps_${userId}`));

        if (snap.exists()) {
            const data = snap.data() as SessionData;

            // Check if session is not too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            const sessionAge = Date.now() - data.lastSavedAt;

            if (sessionAge > maxAge) {
                // Session is too old, delete it
                await clearSession(userId);
                return null;
            }

            return data;
        }

        return null;
    } catch (error) {
        console.error("Error loading CEPS session:", error);
        return null;
    }
}

export async function clearSession(userId: string): Promise<void> {
    if (!userId) return;

    try {
        await setDoc(doc(db, "solutions_sessions", `ceps_${userId}`), {
            cleared: true,
            clearedAt: Date.now()
        });
    } catch (error) {
        console.error("Error clearing CEPS session:", error);
    }
}

export async function updateSessionProgress(userId: string, answers: Record<number, number>, totalQuestions: number = 55): Promise<void> {
    if (!userId) return;

    try {
        const progress = (Object.keys(answers).length / totalQuestions) * 100;

        await saveSession(userId, {
            answers,
            progress
        });
    } catch (error) {
        console.error("Error updating session progress:", error);
    }
}