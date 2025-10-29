import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export interface ChatParticipant {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role?: string;
}

export function useChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [currentChat, setCurrentChat] = useState<any | null>(null);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const uid = (user as any)?.uid;

  useEffect(() => {
    if (!uid) {
      console.warn("[useChat] UID no disponible, omitiendo listener.");
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("members", "array-contains", uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(chatList);
        setLoading(false);
      },
      (error) => {
        console.error("[useChat] Firestore error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const sendMessage = async (chatId?: string, text?: string) => {
    if (!chatId || !text?.trim()) return;
    setSendingMessage(true);
    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text,
        sender: uid,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("[useChat] Error al enviar mensaje:", error);
      return false;
    } finally {
      setSendingMessage(false);
    }
  };

  const createChat = async (otherUserId?: string): Promise<string | null> => {
    if (!otherUserId || !uid) return null;
    try {
      const newChat = await addDoc(collection(db, "chats"), {
        members: [uid, otherUserId],
        createdAt: serverTimestamp(),
      });
      return newChat.id;
    } catch (error) {
      console.error("[useChat] Error al crear chat:", error);
      return null;
    }
  };

  // ✅ FIX: elimina duplicación del campo `uid`
  const searchUsers = async (term: string): Promise<ChatParticipant[]> => {
    if (!term?.trim()) return [];
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", ">=", term),
        where("email", "<=", term + "\uf8ff")
      );

      const snapshot = await getDocs(q);
      const results: ChatParticipant[] = snapshot.docs.map((doc) => {
        const rawData = doc.data();
        const { uid: _ignored, ...cleanData } = rawData || {};

        return {
          uid: doc.id,
          ...(cleanData as Omit<ChatParticipant, "uid">),
        };
      });

      return results;
    } catch (error) {
      console.error("[useChat] Error al buscar usuarios:", error);
      return [];
    }
  };

  const getOtherParticipant = (chat: any) =>
    Array.isArray(chat?.members)
      ? chat.members.find((m: string) => m !== uid)
      : null;

  const hasUnreadMessages = (_chat: any) => false;
  const setTyping = (_chatId?: string, _isTyping?: boolean) => {};

  return {
    chats,
    messages,
    participants,
    currentChat,
    typingUsers,
    loading,
    sendingMessage,
    sendMessage,
    createChat,
    searchUsers,
    getOtherParticipant,
    hasUnreadMessages,
    setTyping,
  };
}