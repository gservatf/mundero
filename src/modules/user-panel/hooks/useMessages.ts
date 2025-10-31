import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    getDoc,
    getDocs,
    limit as limitQuery,
    Timestamp,
    DocumentSnapshot,
    writeBatch
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { apiClient } from '../../../lib/apiClient';

// Types for messages
export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'system';
    timestamp: Date;
    edited?: boolean;
    editedAt?: Date;
    readBy: string[];
}

export interface Chat {
    id: string;
    name: string;
    type: 'direct' | 'group' | 'support' | 'system';
    participants: string[];
    participantNames: Record<string, string>;
    participantAvatars: Record<string, string>;
    lastMessage?: string;
    lastMessageTime?: Date;
    lastMessageSender?: string;
    unreadCount: number;
    isOnline?: boolean;
    metadata?: {
        description?: string;
        avatar?: string;
        isPrivate?: boolean;
        adminOnly?: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface MessagesState {
    chats: Chat[];
    messages: Record<string, Message[]>;
    currentChatId: string | null;
    isLoading: boolean;
    isLoadingChats: boolean;
    isLoadingMessages: boolean;
    isSending: boolean;
    error: string | null;
    connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const initialState: MessagesState = {
    chats: [],
    messages: {},
    currentChatId: null,
    isLoading: false,
    isLoadingChats: false,
    isLoadingMessages: false,
    isSending: false,
    error: null,
    connectionStatus: 'disconnected',
};

export const useMessages = () => {
    const [state, setState] = useState<MessagesState>(initialState);
    const { user, isAuthenticated } = useAuth();

    // Real-time listeners
    const [chatsUnsubscribe, setChatsUnsubscribe] = useState<(() => void) | null>(null);
    const [messagesUnsubscribe, setMessagesUnsubscribe] = useState<Record<string, () => void>>({});

    // Set loading state
    const setLoadingState = useCallback((key: keyof Pick<MessagesState, 'isLoading' | 'isLoadingChats' | 'isLoadingMessages' | 'isSending'>, loading: boolean) => {
        setState(prev => ({ ...prev, [key]: loading }));
    }, []);

    // Set error state
    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    // Load user chats with real-time updates
    const loadChats = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        setLoadingState('isLoadingChats', true);
        setError(null);

        try {
            setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

            // Query chats where user is a participant
            const chatsQuery = query(
                collection(db, 'chats'),
                where('participants', 'array-contains', user.id),
                orderBy('updatedAt', 'desc')
            );

            // Set up real-time listener
            const unsubscribe = onSnapshot(
                chatsQuery,
                (snapshot) => {
                    const chats: Chat[] = [];

                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        chats.push({
                            id: doc.id,
                            name: data.name || 'Chat sin nombre',
                            type: data.type || 'direct',
                            participants: data.participants || [],
                            participantNames: data.participantNames || {},
                            participantAvatars: data.participantAvatars || {},
                            lastMessage: data.lastMessage,
                            lastMessageTime: data.lastMessageTime?.toDate(),
                            lastMessageSender: data.lastMessageSender,
                            unreadCount: data.unreadCounts?.[user.id] || 0,
                            isOnline: data.onlineParticipants?.includes(user.id) || false,
                            metadata: data.metadata,
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date(),
                        });
                    });

                    setState(prev => ({
                        ...prev,
                        chats,
                        connectionStatus: 'connected'
                    }));
                },
                (error) => {
                    console.error('Error loading chats:', error);
                    setError('Failed to load chats');
                    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
                }
            );

            setChatsUnsubscribe(() => unsubscribe);

        } catch (error) {
            console.error('Error setting up chats listener:', error);
            setError(error instanceof Error ? error.message : 'Failed to load chats');
            setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        } finally {
            setLoadingState('isLoadingChats', false);
        }
    }, [isAuthenticated, user?.id, setLoadingState, setError]);

    // Load messages for a specific chat with real-time updates
    const loadMessages = useCallback(async (chatId: string) => {
        if (!isAuthenticated || !user?.id || !chatId) {
            return;
        }

        setLoadingState('isLoadingMessages', true);
        setState(prev => ({ ...prev, currentChatId: chatId }));

        try {
            // Clean up existing listener for this chat
            if (messagesUnsubscribe[chatId]) {
                messagesUnsubscribe[chatId]();
            }

            // Query messages for the chat
            const messagesQuery = query(
                collection(db, 'messages'),
                where('chatId', '==', chatId),
                orderBy('timestamp', 'desc'),
                limitQuery(100) // Load last 100 messages
            );

            // Set up real-time listener
            const unsubscribe = onSnapshot(
                messagesQuery,
                (snapshot) => {
                    const messages: Message[] = [];

                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        messages.push({
                            id: doc.id,
                            chatId: data.chatId,
                            senderId: data.senderId,
                            senderName: data.senderName || 'Usuario desconocido',
                            senderAvatar: data.senderAvatar,
                            content: data.content || '',
                            type: data.type || 'text',
                            timestamp: data.timestamp?.toDate() || new Date(),
                            edited: data.edited || false,
                            editedAt: data.editedAt?.toDate(),
                            readBy: data.readBy || [],
                        });
                    });

                    // Reverse to show oldest first
                    messages.reverse();

                    setState(prev => ({
                        ...prev,
                        messages: {
                            ...prev.messages,
                            [chatId]: messages
                        }
                    }));
                },
                (error) => {
                    console.error('Error loading messages:', error);
                    setError('Failed to load messages');
                }
            );

            setMessagesUnsubscribe(prev => ({
                ...prev,
                [chatId]: unsubscribe
            }));

        } catch (error) {
            console.error('Error setting up messages listener:', error);
            setError(error instanceof Error ? error.message : 'Failed to load messages');
        } finally {
            setLoadingState('isLoadingMessages', false);
        }
    }, [isAuthenticated, user?.id, setLoadingState, setError, messagesUnsubscribe]);

    // Send a message
    const sendMessage = useCallback(async (chatId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<boolean> => {
        if (!isAuthenticated || !user?.id || !content.trim()) {
            return false;
        }

        setLoadingState('isSending', true);

        try {
            // Add message to Firestore
            await addDoc(collection(db, 'messages'), {
                chatId,
                senderId: user.id,
                senderName: user.display_name || user.email || 'Usuario',
                senderAvatar: user.photo_url,
                content: content.trim(),
                type,
                timestamp: serverTimestamp(),
                readBy: [user.id], // Mark as read by sender
            });

            // Update chat's last message info
            const chatRef = doc(db, 'chats', chatId);
            await updateDoc(chatRef, {
                lastMessage: content.trim(),
                lastMessageTime: serverTimestamp(),
                lastMessageSender: user.id,
                updatedAt: serverTimestamp(),
            });            // Try to sync with integrations API
            try {
                await apiClient.post('integrations/sync-chats', {
                    chatId,
                    messageId: `${chatId}_${Date.now()}`,
                    userId: user.id,
                    content: content.trim(),
                    timestamp: new Date().toISOString(),
                });
            } catch (error) {
                console.warn('Failed to sync with integrations API:', error);
                // Continue even if integration sync fails
            }

            return true;

        } catch (error) {
            console.error('Error sending message:', error);
            setError(error instanceof Error ? error.message : 'Failed to send message');
            return false;
        } finally {
            setLoadingState('isSending', false);
        }
    }, [isAuthenticated, user, setLoadingState, setError]);

    // Create a new chat
    const createChat = useCallback(async (
        name: string,
        type: 'direct' | 'group' | 'support' = 'direct',
        participantIds: string[] = [],
        metadata?: Chat['metadata']
    ): Promise<string | null> => {
        if (!isAuthenticated || !user?.id) {
            return null;
        }

        try {
            const participants = [user.id, ...participantIds];

            const chatData = {
                name,
                type,
                participants,
                participantNames: {
                    [user.id]: user.display_name || user.email || 'Usuario'
                },
                participantAvatars: {
                    [user.id]: user.photo_url || ''
                },
                unreadCounts: {},
                onlineParticipants: [user.id],
                metadata: metadata || {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'chats'), chatData);

            return docRef.id;

        } catch (error) {
            console.error('Error creating chat:', error);
            setError(error instanceof Error ? error.message : 'Failed to create chat');
            return null;
        }
    }, [isAuthenticated, user, setError]);

    // Mark messages as read
    const markAsRead = useCallback(async (chatId: string, messageIds: string[]) => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        try {
            // Update read status for messages
            const batch = writeBatch(db);

            messageIds.forEach(messageId => {
                const messageRef = doc(db, 'messages', messageId);
                batch.update(messageRef, {
                    readBy: [...(state.messages[chatId]?.find(m => m.id === messageId)?.readBy || []), user.id]
                });
            });

            await batch.commit();

            // Reset unread count for the chat
            const chatRef = doc(db, 'chats', chatId);
            await updateDoc(chatRef, {
                [`unreadCounts.${user.id}`]: 0
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }, [isAuthenticated, user?.id, state.messages]);

    // Search chats
    const searchChats = useCallback((searchTerm: string): Chat[] => {
        if (!searchTerm.trim()) {
            return state.chats;
        }

        const term = searchTerm.toLowerCase();
        return state.chats.filter(chat =>
            chat.name.toLowerCase().includes(term) ||
            chat.lastMessage?.toLowerCase().includes(term) ||
            Object.values(chat.participantNames).some(name =>
                name.toLowerCase().includes(term)
            )
        );
    }, [state.chats]);

    // Initialize when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadChats();
        }

        return () => {
            // Cleanup listeners
            if (chatsUnsubscribe) {
                chatsUnsubscribe();
            }
            Object.values(messagesUnsubscribe).forEach(unsubscribe => {
                unsubscribe();
            });
        };
    }, [isAuthenticated, user?.id, loadChats]);

    return {
        // State
        ...state,

        // Current chat data
        currentChat: state.chats.find(chat => chat.id === state.currentChatId),
        currentMessages: state.currentChatId ? state.messages[state.currentChatId] || [] : [],

        // Actions
        loadChats,
        loadMessages,
        sendMessage,
        createChat,
        markAsRead,
        searchChats,

        // Utilities
        setCurrentChat: (chatId: string | null) => {
            setState(prev => ({ ...prev, currentChatId: chatId }));
            if (chatId) {
                loadMessages(chatId);
            }
        },

        clearError: () => setError(null),
        isAuthenticated,
        user,
    };
};