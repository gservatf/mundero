// Hook de Integración de Reputación con Mensajería y Eventos
// Escucha eventos relevantes y actualiza reputación automáticamente

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { reputationService, REPUTATION_ENABLED } from '../reputation/reputationService';
import { ReputationActionType } from '../reputation/types';
import { validateReputationAction } from '../reputation/security/ReputationSecurity';

// Tipos de eventos monitoreados
export type ReputationTriggerEvent =
    | 'chat_message'
    | 'message_reaction'
    | 'feed_highlight'
    | 'live_participation'
    | 'community_leadership'
    | 'content_engagement';

interface TriggerEventData {
    eventType: ReputationTriggerEvent;
    userId: string;
    metadata?: Record<string, any>;
    timestamp: number;
}

interface CooldownEntry {
    eventType: string;
    lastTriggered: number;
}

export function useReputationTriggers() {
    const { user } = useAuth();
    const cooldownRef = useRef<Map<string, CooldownEntry>>(new Map());
    const listenersRef = useRef<(() => void)[]>([]);

    // Cooldown de 30 segundos por acción idéntica
    const COOLDOWN_DURATION = 30 * 1000;

    /**
     * Verificar si una acción está en cooldown
     */
    const isInCooldown = useCallback((eventType: string, context?: string): boolean => {
        const key = `${eventType}_${context || 'default'}`;
        const entry = cooldownRef.current.get(key);

        if (!entry) return false;

        const timeSinceLastTrigger = Date.now() - entry.lastTriggered;
        return timeSinceLastTrigger < COOLDOWN_DURATION;
    }, []);

    /**
     * Actualizar cooldown para una acción
     */
    const updateCooldown = useCallback((eventType: string, context?: string): void => {
        const key = `${eventType}_${context || 'default'}`;
        cooldownRef.current.set(key, {
            eventType: key,
            lastTriggered: Date.now()
        });
    }, []);

    /**
     * Trigger principal para eventos de reputación
     */
    const triggerReputationEvent = useCallback(async (
        eventData: TriggerEventData
    ): Promise<boolean> => {
        if (!REPUTATION_ENABLED || !user?.id) {
            return false;
        }

        const { eventType, userId, metadata = {}, timestamp } = eventData;

        // Verificar que el evento sea del usuario actual
        if (userId !== user.id) {
            return false;
        }

        // Verificar cooldown
        const contextKey = metadata.contextId || metadata.targetId || 'general';
        if (isInCooldown(eventType, contextKey)) {
            console.log(`Reputation event ${eventType} is in cooldown for context ${contextKey}`);
            return false;
        }

        try {
            // Mapear eventos trigger a acciones de reputación
            const actionMap: Record<ReputationTriggerEvent, ReputationActionType> = {
                'chat_message': 'post_comment',
                'message_reaction': 'post_like',
                'feed_highlight': 'post_create',
                'live_participation': 'event_attend',
                'community_leadership': 'community_create',
                'content_engagement': 'post_like'
            };

            const reputationAction = actionMap[eventType];
            if (!reputationAction) {
                console.warn(`Unknown trigger event type: ${eventType}`);
                return false;
            }

            // 🔒 Validar seguridad antes de procesar
            const validationResult = await validateReputationAction(
                userId,
                reputationAction,
                {
                    ...metadata,
                    triggerEvent: eventType,
                    triggeredAt: timestamp,
                    source: 'useReputationTriggers'
                }
            );

            if (!validationResult.isValid) {
                console.warn(`Reputation action blocked by security:`, {
                    userId,
                    action: reputationAction,
                    issues: validationResult.issues,
                    riskLevel: validationResult.riskLevel,
                    actionTaken: validationResult.actionTaken
                });
                return false;
            }

            // Si hay advertencias de seguridad pero es válido, proceder con precaución
            if (validationResult.riskLevel !== 'low') {
                console.warn(`Security warning for reputation action:`, {
                    userId,
                    action: reputationAction,
                    riskLevel: validationResult.riskLevel,
                    issues: validationResult.issues
                });
            }

            // Ejecutar acción de reputación
            await reputationService.logAction(userId, reputationAction, {
                ...metadata,
                triggerEvent: eventType,
                triggeredAt: timestamp,
                source: 'useReputationTriggers',
                securityValidated: true,
                securityRiskLevel: validationResult.riskLevel
            });

            // Actualizar cooldown
            updateCooldown(eventType, contextKey);

            console.log(`Reputation event triggered: ${eventType} → ${reputationAction}`, metadata);
            return true;

        } catch (error) {
            console.error('Error triggering reputation event:', error);
            return false;
        }
    }, [user?.id, isInCooldown, updateCooldown]);

    /**
     * Listener para mensajes de chat
     */
    const setupChatMessageListener = useCallback(() => {
        if (!user?.id) return () => { };

        // Simulación del listener - en producción sería Firebase onSnapshot
        const handleChatMessage = (messageData: any) => {
            if (messageData.authorId === user.id) {
                triggerReputationEvent({
                    eventType: 'chat_message',
                    userId: user.id,
                    metadata: {
                        messageId: messageData.id,
                        chatId: messageData.chatId,
                        messageLength: messageData.content?.length || 0,
                        hasAttachment: !!messageData.attachment
                    },
                    timestamp: Date.now()
                });
            }
        };

        // En producción: onSnapshot(chatMessagesRef, handleChatMessage)
        // Por ahora solo registramos el listener
        console.log('Chat message listener setup for user:', user.id);

        return () => {
            console.log('Chat message listener cleanup for user:', user.id);
        };
    }, [user?.id, triggerReputationEvent]);

    /**
     * Listener para reacciones a mensajes
     */
    const setupMessageReactionListener = useCallback(() => {
        if (!user?.id) return () => { };

        const handleMessageReaction = (reactionData: any) => {
            // Trigger cuando RECIBE una reacción positiva
            if (reactionData.messageAuthorId === user.id && reactionData.type === 'positive') {
                triggerReputationEvent({
                    eventType: 'message_reaction',
                    userId: user.id,
                    metadata: {
                        messageId: reactionData.messageId,
                        reactionType: reactionData.reaction,
                        reactorId: reactionData.reactorId,
                        chatId: reactionData.chatId
                    },
                    timestamp: Date.now()
                });
            }
        };

        console.log('Message reaction listener setup for user:', user.id);

        return () => {
            console.log('Message reaction listener cleanup for user:', user.id);
        };
    }, [user?.id, triggerReputationEvent]);

    /**
     * Listener para posts destacados en feed
     */
    const setupFeedHighlightListener = useCallback(() => {
        if (!user?.id) return () => { };

        const handleFeedHighlight = (postData: any) => {
            if (postData.authorId === user.id && postData.isHighlighted) {
                triggerReputationEvent({
                    eventType: 'feed_highlight',
                    userId: user.id,
                    metadata: {
                        postId: postData.id,
                        communityId: postData.communityId,
                        engagementScore: postData.likes + postData.comments * 2,
                        isFirstPost: postData.isFirstPost
                    },
                    timestamp: Date.now()
                });
            }
        };

        console.log('Feed highlight listener setup for user:', user.id);

        return () => {
            console.log('Feed highlight listener cleanup for user:', user.id);
        };
    }, [user?.id, triggerReputationEvent]);

    /**
     * Listener para participación en lives/eventos
     */
    const setupLiveParticipationListener = useCallback(() => {
        if (!user?.id) return () => { };

        const handleLiveParticipation = (participationData: any) => {
            if (participationData.userId === user.id && participationData.duration > 300000) { // 5 min+
                triggerReputationEvent({
                    eventType: 'live_participation',
                    userId: user.id,
                    metadata: {
                        eventId: participationData.eventId,
                        duration: participationData.duration,
                        interactions: participationData.interactions,
                        eventType: participationData.type
                    },
                    timestamp: Date.now()
                });
            }
        };

        console.log('Live participation listener setup for user:', user.id);

        return () => {
            console.log('Live participation listener cleanup for user:', user.id);
        };
    }, [user?.id, triggerReputationEvent]);

    /**
     * Listener para liderazgo comunitario
     */
    const setupCommunityLeadershipListener = useCallback(() => {
        if (!user?.id) return () => { };

        const handleCommunityLeadership = (leadershipData: any) => {
            if (leadershipData.userId === user.id) {
                triggerReputationEvent({
                    eventType: 'community_leadership',
                    userId: user.id,
                    metadata: {
                        communityId: leadershipData.communityId,
                        action: leadershipData.action, // 'moderation', 'event_creation', 'member_invitation'
                        impact: leadershipData.membersAffected || 1
                    },
                    timestamp: Date.now()
                });
            }
        };

        console.log('Community leadership listener setup for user:', user.id);

        return () => {
            console.log('Community leadership listener cleanup for user:', user.id);
        };
    }, [user?.id, triggerReputationEvent]);

    /**
     * Configurar todos los listeners
     */
    useEffect(() => {
        if (!REPUTATION_ENABLED || !user?.id) {
            return;
        }

        console.log('Setting up reputation triggers for user:', user.id);

        // Configurar listeners
        const cleanupFunctions = [
            setupChatMessageListener(),
            setupMessageReactionListener(),
            setupFeedHighlightListener(),
            setupLiveParticipationListener(),
            setupCommunityLeadershipListener()
        ];

        // Guardar referencias para cleanup
        listenersRef.current = cleanupFunctions;

        return () => {
            console.log('Cleaning up all reputation triggers');
            cleanupFunctions.forEach(cleanup => cleanup());
            listenersRef.current = [];
        };
    }, [
        user?.id,
        setupChatMessageListener,
        setupMessageReactionListener,
        setupFeedHighlightListener,
        setupLiveParticipationListener,
        setupCommunityLeadershipListener
    ]);

    /**
     * Función expuesta para triggers manuales
     */
    const manualTrigger = useCallback((
        eventType: ReputationTriggerEvent,
        metadata?: Record<string, any>
    ) => {
        if (!user?.id) return Promise.resolve(false);

        return triggerReputationEvent({
            eventType,
            userId: user.id,
            metadata,
            timestamp: Date.now()
        });
    }, [user?.id, triggerReputationEvent]);

    /**
     * Obtener estado del cooldown
     */
    const getCooldownStatus = useCallback((eventType: string, context?: string) => {
        const key = `${eventType}_${context || 'default'}`;
        const entry = cooldownRef.current.get(key);

        if (!entry) {
            return { inCooldown: false, remainingTime: 0 };
        }

        const timeSinceLastTrigger = Date.now() - entry.lastTriggered;
        const remainingTime = Math.max(0, COOLDOWN_DURATION - timeSinceLastTrigger);

        return {
            inCooldown: remainingTime > 0,
            remainingTime,
            lastTriggered: entry.lastTriggered
        };
    }, []);

    /**
     * Limpiar todos los cooldowns
     */
    const clearCooldowns = useCallback(() => {
        cooldownRef.current.clear();
        console.log('All reputation trigger cooldowns cleared');
    }, []);

    return {
        triggerReputationEvent,
        manualTrigger,
        getCooldownStatus,
        clearCooldowns,
        isEnabled: REPUTATION_ENABLED && !!user?.id
    };
}