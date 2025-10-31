import { db } from "../../../lib/firebase";
import { doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";

export interface ReputationData {
    score: number;
    level: string;
    badges: string[];
    lastUpdated: Date;
}

/**
 * Incrementa la reputación del usuario por completar CEPS
 * Reutiliza la estructura existente de reputation si existe
 */
export async function incrementReputation(userId: string, points: number): Promise<void> {
    if (!userId || points <= 0) return;

    try {
        const reputationRef = doc(db, "reputation", userId);

        // Verificar si el documento existe
        const reputationSnap = await getDoc(reputationRef);

        if (reputationSnap.exists()) {
            // Actualizar documento existente
            await updateDoc(reputationRef, {
                score: increment(points),
                lastUpdated: new Date(),
                cepsCompleted: true,
                cepsCompletedAt: new Date()
            });
        } else {
            // Crear nuevo documento de reputación
            await setDoc(reputationRef, {
                userId,
                score: points,
                level: "Beginner",
                badges: ["ceps_completed"],
                cepsCompleted: true,
                cepsCompletedAt: new Date(),
                lastUpdated: new Date(),
                createdAt: new Date()
            });
        }

        console.log("✅ CEPS Reputation updated:", { userId, points });
    } catch (error) {
        console.error("❌ Error updating CEPS reputation:", error);
        // No lanzar error para no bloquear el flujo principal
    }
}

/**
 * Otorga badge específico por completar CEPS
 */
export async function awardCepsBadge(userId: string, overallLevel: string): Promise<void> {
    if (!userId) return;

    try {
        const reputationRef = doc(db, "reputation", userId);

        // Determinar badge según nivel
        let badge = "ceps_completed";
        if (overallLevel === "Alto") {
            badge = "ceps_excellence";
        } else if (overallLevel === "Promedio") {
            badge = "ceps_proficient";
        }

        const reputationSnap = await getDoc(reputationRef);

        if (reputationSnap.exists()) {
            const currentData = reputationSnap.data();
            const currentBadges = currentData.badges || [];

            // Agregar badge si no existe
            if (!currentBadges.includes(badge)) {
                await updateDoc(reputationRef, {
                    badges: [...currentBadges, badge],
                    lastBadgeEarned: badge,
                    lastBadgeEarnedAt: new Date()
                });
            }
        }

        console.log("✅ CEPS Badge awarded:", { userId, badge, level: overallLevel });
    } catch (error) {
        console.error("❌ Error awarding CEPS badge:", error);
    }
}

/**
 * Registra logro específico de CEPS
 */
export async function recordCepsAchievement(
    userId: string,
    achievement: {
        type: "completion" | "excellence" | "speed" | "perfectionist";
        score: number;
        timeSpent?: number;
        competencyHighlights?: string[];
    }
): Promise<void> {
    if (!userId) return;

    try {
        const achievementData = {
            userId,
            solution: "ceps",
            achievement: achievement.type,
            score: achievement.score,
            timeSpent: achievement.timeSpent,
            competencyHighlights: achievement.competencyHighlights,
            timestamp: new Date(),
            points: calculatePointsForAchievement(achievement)
        };

        await setDoc(
            doc(db, "user_achievements", `${userId}_ceps_${Date.now()}`),
            achievementData
        );

        // Incrementar reputación basada en el logro
        await incrementReputation(userId, achievementData.points);

        console.log("✅ CEPS Achievement recorded:", achievementData);
    } catch (error) {
        console.error("❌ Error recording CEPS achievement:", error);
    }
}

function calculatePointsForAchievement(achievement: {
    type: string;
    score: number;
    timeSpent?: number;
}): number {
    let basePoints = 5; // Puntos base por completar

    // Bonus por tipo de logro
    switch (achievement.type) {
        case "excellence":
            basePoints += 10;
            break;
        case "speed":
            basePoints += 7;
            break;
        case "perfectionist":
            basePoints += 8;
            break;
    }

    // Bonus por score alto
    if (achievement.score >= 180) {
        basePoints += 5;
    } else if (achievement.score >= 150) {
        basePoints += 3;
    }

    return basePoints;
}