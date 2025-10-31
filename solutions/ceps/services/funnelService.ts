import { db } from "../../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface FunnelEventData {
    userId: string;
    source: "solution";
    stage: "awareness" | "interest" | "action" | "conversion";
    solution?: string;
    metadata?: Record<string, any>;
}

/**
 * Registra un evento de funnel para la solución CEPS
 * Reutiliza la estructura existente de funnel_events si existe
 */
export async function registerFunnelEvent(
    userId: string,
    source: "solution",
    stage: "awareness" | "interest" | "action" | "conversion",
    extra?: Record<string, any>
): Promise<void> {
    try {
        const eventData: FunnelEventData & Record<string, any> = {
            userId,
            source,
            stage,
            solution: "ceps",
            timestamp: serverTimestamp(),
            ...extra
        };

        await addDoc(collection(db, "funnel_events"), eventData);

        console.log("✅ CEPS Funnel event registered:", { userId, source, stage, solution: "ceps" });
    } catch (error) {
        console.error("❌ Error registering CEPS funnel event:", error);
        // No lanzar error para no bloquear el flujo principal
    }
}

/**
 * Registra eventos específicos de la solución CEPS
 */
export async function registerCepsEvent(
    userId: string,
    event: "quiz_started" | "quiz_completed" | "results_viewed" | "pdf_downloaded",
    metadata?: Record<string, any>
): Promise<void> {
    try {
        const eventData = {
            userId,
            solution: "ceps",
            event,
            timestamp: serverTimestamp(),
            metadata: {
                ...metadata,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        };

        await addDoc(collection(db, "solution_events"), eventData);

        console.log("✅ CEPS Solution event registered:", { userId, event });
    } catch (error) {
        console.error("❌ Error registering CEPS solution event:", error);
    }
}