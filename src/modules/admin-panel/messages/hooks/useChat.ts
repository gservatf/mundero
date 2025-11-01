import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🧩 Tipo de usuario en el chat
export interface ChatParticipant {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role?: string;
}

export function useChat() {
  // 🔥 Firebase Auth exclusivamente
  const auth = getAuth();
  const firebaseUser = auth.currentUser;
  const db = getFirestore();

  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [currentChat, setCurrentChat] = useState<any | null>(null);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // 🧠 Escucha activa de los chats del usuario
  useEffect(() => {
    // 🔐 Guard clause: no ejecutar consultas sin usuario autenticado
    const uid = firebaseUser?.uid;
    if (!uid) {
      console.warn("Skipping Firestore query — user not authenticated yet.");
      setLoading(false);
      setChats([]);
      return;
    }

    console.log("[useChat] Iniciando listener con UID:", uid);
    setLoading(true);

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("members", "array-contains", uid),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(chatList);
        setLoading(false);
        console.log("[useChat] Chats cargados:", chatList.length);
      },
      (error) => {
        console.error("[useChat] Firestore error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [firebaseUser]); // Dependencia únicamente de Firebase Auth

  // 📩 Enviar mensaje
  const sendMessage = async (chatId?: string, text?: string) => {
    // 🔐 Guard clause: verificar usuario autenticado
    const uid = firebaseUser?.uid;
    if (!uid) {
      console.warn("Skipping sendMessage — user not authenticated yet.");
      return false;
    }

    if (!chatId || !text?.trim()) return false;

    setSendingMessage(true);
    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text,
        sender: uid,
        createdAt: serverTimestamp(),
      });
      console.log("[useChat] Mensaje enviado exitosamente");
      return true;
    } catch (error) {
      console.error("[useChat] Error al enviar mensaje:", error);
      return false;
    } finally {
      setSendingMessage(false);
    }
  };

  // 🧩 Crear nuevo chat
  const createChat = async (otherUserId?: string): Promise<string | null> => {
    // 🔐 Guard clause: verificar usuario autenticado
    const uid = firebaseUser?.uid;
    if (!uid) {
      console.warn("Skipping createChat — user not authenticated yet.");
      return null;
    }

    if (!otherUserId) {
      console.warn("[useChat] createChat: otherUserId es requerido");
      return null;
    }

    try {
      const newChat = await addDoc(collection(db, "chats"), {
        members: [uid, otherUserId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("[useChat] Chat creado con ID:", newChat.id);
      return newChat.id;
    } catch (error) {
      console.error("[useChat] Error al crear chat:", error);
      return null;
    }
  };

  // 🔍 Buscar usuarios (versión segura contra undefined)
  const searchUsers = async (term: string): Promise<ChatParticipant[]> => {
    // 🔐 Guard clause: verificar usuario autenticado
    const uid = firebaseUser?.uid;
    if (!uid) {
      console.warn("Skipping searchUsers — user not authenticated yet.");
      return [];
    }

    try {
      if (!term || typeof term !== "string" || term.trim().length < 2) {
        console.warn("[useChat] Búsqueda omitida: término muy corto");
        return [];
      }

      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", ">=", term.toLowerCase()),
        where("email", "<=", term.toLowerCase() + "\uf8ff"),
      );

      const snapshot = await getDocs(q);
      console.log("[useChat] Usuarios encontrados:", snapshot.docs.length);

      return snapshot.docs
        .map((doc) => {
          const rawData = doc.data() || {};
          return {
            uid: doc.id,
            displayName: rawData.displayName || rawData.name || "Usuario",
            email: rawData.email || "",
            photoURL: rawData.photoURL || rawData.avatar,
            role: rawData.role,
          } as ChatParticipant;
        })
        .filter((user) => user.uid !== uid); // Excluir al usuario actual
    } catch (error) {
      console.error("[useChat] Error al buscar usuarios:", error);
      return [];
    }
  };

  // 👥 Obtener el otro participante del chat
  const getOtherParticipant = (chat: any) => {
    const uid = firebaseUser?.uid;
    return Array.isArray(chat?.members)
      ? chat.members.find((m: string) => m !== uid)
      : null;
  };

  // 🔔 Placeholder para mensajes no leídos
  const hasUnreadMessages = (_chat: any) => false;

  // ✏️ Placeholder para estado de escritura
  const setTyping = (_chatId?: string, _isTyping?: boolean) => {};

  // 🔐 Verificar si hay un usuario no autenticado
  if (!firebaseUser) {
    console.log(
      "[useChat] Usuario no autenticado, retornando estado por defecto",
    );
    return {
      chats: [],
      messages: [],
      participants: [],
      currentChat: null,
      typingUsers: [],
      loading: true,
      sendingMessage: false,
      sendMessage: async () => false,
      createChat: async () => null,
      searchUsers: async () => [],
      getOtherParticipant: () => null,
      hasUnreadMessages: () => false,
      setTyping: () => {},
    };
  }

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
