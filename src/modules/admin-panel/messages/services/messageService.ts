import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where, 
  serverTimestamp, 
  getDocs,
  setDoc,
  getDoc,
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useRealtimeGuard } from '../../../../hooks/useRealtimeGuard';

// Interfaces
export interface Chat {
  id: string;
  members: string[];
  lastMessage?: string;
  lastMessageTimestamp?: Timestamp;
  lastMessageSender?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  readBy: string[];
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

export interface ChatParticipant {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role?: string;
}

// Message Service
export const messageService = {
  // Obtener conversaciones del usuario autenticado usando useRealtimeGuard
  getUserChats(userId: string, callback: (chats: Chat[]) => void) {
    // 🔒 Validación para prevenir consultas con undefined
    if (!userId) {
      console.warn('getUserChats: userId is undefined');
      callback([]);
      return () => {}; // Return empty cleanup function
    }

    // Crear query protegida
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('members', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );

    // TODO: Implementar autenticación sin hooks
    // const { user, firebaseUser } = getCurrentUser();
    
    // Usar realtime listener directamente por ahora
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chat[];
        callback(chats);
      },
      (error: any) => {
        console.error('[messageService] Error in getUserChats:', error);
        callback([]);
      }
    );
    
    return unsubscribe;
  },

  // Obtener mensajes de un chat específico usando useRealtimeGuard
  getChatMessages(chatId: string, callback: (messages: Message[]) => void) {
    // 🔒 Validación para prevenir consultas con undefined
    if (!chatId) {
      console.warn('getChatMessages: chatId is undefined');
      callback([]);
      return () => {};
    }

    // Crear query protegida
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    // Usar realtime listener directamente por ahora
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
        callback(messages);
      },
      (error: any) => {
        console.error('[messageService] Error in getChatMessages:', error);
        callback([]);
      }
    );
    
    return unsubscribe;
  },

  // Enviar mensaje
  async sendMessage(chatId: string, senderId: string, text: string, recipientId?: string) {
    // 🔒 Validaciones para prevenir operaciones con undefined
    if (!chatId || !senderId || !text.trim()) {
      throw new Error('Missing required parameters for sendMessage');
    }

    try {
      const batch = writeBatch(db);
      
      // Crear mensaje
      const messageData = {
        senderId,
        text: text.trim(),
        timestamp: serverTimestamp(),
        readBy: [senderId],
        type: 'text'
      };

      const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
      batch.set(messageRef, messageData);

      // Actualizar información del chat
      const chatRef = doc(db, 'chats', chatId);
      const chatUpdateData = {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSender: senderId,
        updatedAt: serverTimestamp()
      };

      // Si el chat no existe, crearlo
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists() && recipientId) {
        batch.set(chatRef, {
          members: [senderId, recipientId],
          createdAt: serverTimestamp(),
          ...chatUpdateData
        });
      } else {
        batch.update(chatRef, chatUpdateData);
      }

      await batch.commit();

      // Enviar notificación al destinatario (si existe recipientId)
      if (recipientId && recipientId !== senderId) {
        await this.sendNotification(recipientId, {
          type: 'message',
          from: senderId,
          chatId,
          text: text.trim(),
          timestamp: Date.now()
        });
      }

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Crear o obtener chat entre dos usuarios
  async createOrGetChat(userId1: string, userId2: string): Promise<string> {
    // 🔒 Validaciones para prevenir operaciones con undefined
    if (!userId1 || !userId2) {
      throw new Error('Both user IDs are required to create/get chat');
    }

    try {
      // Buscar chat existente
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('members', 'array-contains', userId1)
      );

      const snapshot = await getDocs(q);
      let existingChatId: string | null = null;

      snapshot.forEach((doc) => {
        const chatData = doc.data() as Chat;
        if (chatData.members.includes(userId2)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        return existingChatId;
      }

      // Crear nuevo chat
      const newChatRef = doc(collection(db, 'chats'));
      await setDoc(newChatRef, {
        members: [userId1, userId2],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return newChatRef.id;
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      throw error;
    }
  },

  // Marcar mensajes como leídos
  async markMessagesAsRead(chatId: string, userId: string) {
    // 🔒 Validaciones para prevenir operaciones con undefined
    if (!chatId || !userId) {
      console.warn('markMessagesAsRead: missing chatId or userId');
      return;
    }

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(
        messagesRef,
        where('readBy', 'not-in', [[userId]])
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        const messageData = doc.data() as Message;
        if (!messageData.readBy.includes(userId)) {
          const updatedReadBy = [...messageData.readBy, userId];
          batch.update(doc.ref, { readBy: updatedReadBy });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // Obtener información de participantes del chat
  async getChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    // 🔒 Validación para prevenir operaciones con undefined
    if (!chatId) {
      console.warn('getChatParticipants: chatId is undefined');
      return [];
    }

    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) return [];

      const chatData = chatDoc.data() as Chat;
      const participants: ChatParticipant[] = [];

      for (const memberId of chatData.members) {
        if (!memberId) continue; // Skip undefined member IDs
        
        const userDoc = await getDoc(doc(db, 'users', memberId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          participants.push({
            uid: memberId,
            displayName: userData.displayName || userData.email || 'Usuario',
            email: userData.email || '',
            photoURL: userData.photoURL,
            role: userData.role
          });
        }
      }

      return participants;
    } catch (error) {
      console.error('Error getting chat participants:', error);
      return [];
    }
  },

  // Buscar usuarios para iniciar chat
  async searchUsers(searchTerm: string): Promise<ChatParticipant[]> {
    // 🔒 Validación para prevenir búsquedas con undefined
    if (!searchTerm || !searchTerm.trim()) {
      return [];
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('email', '>=', searchTerm.toLowerCase()),
        where('email', '<=', searchTerm.toLowerCase() + '\uf8ff')
      );

      const snapshot = await getDocs(q);
      const users: ChatParticipant[] = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          uid: doc.id,
          displayName: userData.displayName || userData.email || 'Usuario',
          email: userData.email || '',
          photoURL: userData.photoURL,
          role: userData.role
        });
      });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  // Enviar notificación (mock implementation para Realtime DB)
  async sendNotification(recipientId: string, notification: any) {
    try {
      // En una implementación real, esto usaría Firebase Realtime Database
      console.log(`Notification sent to ${recipientId}:`, notification);
      
      // También se podría integrar con Firebase Cloud Messaging aquí
      // await this.sendPushNotification(recipientId, notification);
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },

  // Estado de "escribiendo" (mock implementation)
  setTypingStatus(chatId: string, userId: string, isTyping: boolean) {
    try {
      // En una implementación real, esto usaría Firebase Realtime Database
      console.log(`User ${userId} typing in chat ${chatId}: ${isTyping}`);
      return true;
    } catch (error) {
      console.error('Error setting typing status:', error);
      return false;
    }
  },

  // Obtener estado de "escribiendo"
  subscribeToTypingStatus(chatId: string, callback: (typingUsers: string[]) => void) {
    // Mock implementation
    // En una implementación real, esto escucharía cambios en Firebase Realtime Database
    callback([]);
    return () => {}; // cleanup function
  }
};