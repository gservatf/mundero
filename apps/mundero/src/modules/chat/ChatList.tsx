// src/modules/chat/ChatList.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getFirestore,
  DocumentData,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "../../core/firebase/firebaseClient";

// ⬇️ Si ya tienes un wrapper de Firebase, usa ese import:
// import { db } from "@/lib/firebase";
const db = getFirestore(app);
const auth = getAuth(app);

type Chat = {
  id: string;
  title?: string;
  lastMessage?: string;
  members: string[];
  updatedAt?: { seconds: number; nanoseconds: number } | number | null;
};

interface ChatListProps {
  onSelect?: (chatId: string) => void;
  className?: string;
}

const ChatList: React.FC<ChatListProps> = ({ onSelect, className }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Evita recomputar la colección
  const chatsCol = useMemo(() => collection(db, "chats"), []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed - user:", currentUser); // Debug temporal
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 🔐 1) No intentes abrir listeners sin usuario válido
    if (!user || !user.uid) {
      console.warn("Esperando usuario autenticado antes de cargar chats...");
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // 🔎 2) Query robusta: filtra por membership y evita campos undefined
    const q = query(chatsCol, where("members", "array-contains", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Chat[] = snapshot.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            title: (data.title as string) || "Chat",
            lastMessage: (data.lastMessage as string) || "",
            members: (data.members as string[]) || [],
            updatedAt: (data.updatedAt as any) ?? null,
          };
        });

        // 🧹 3) Ordena de forma defensiva por updatedAt si existe
        list.sort((a, b) => {
          const A =
            typeof a.updatedAt === "number"
              ? a.updatedAt
              : ((a.updatedAt as any)?.seconds ?? 0);
          const B =
            typeof b.updatedAt === "number"
              ? b.updatedAt
              : ((b.updatedAt as any)?.seconds ?? 0);
          return B - A;
        });

        setChats(list);
        setLoading(false);
      },
      (err) => {
        console.error("🔥 onSnapshot(chats) error:", err);
        // Errores típicos: permission-denied, failed-precondition (índices), etc.
        setErrorMsg(
          "No se pudo cargar tus chats. Verifica permisos/índices o intenta nuevamente.",
        );
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, chatsCol]); // Dependencias actualizadas

  if (loading) {
    return (
      <div className={className}>
        <div className="p-3 text-sm text-gray-500">Cargando chats…</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className={className}>
        <div className="p-3 text-sm text-red-600">{errorMsg}</div>
      </div>
    );
  }

  if (!chats.length) {
    return (
      <div className={className}>
        <div className="p-3 text-sm text-gray-500">
          Aún no tienes conversaciones. Crea una para estrenar el sistema.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ul className="divide-y divide-gray-200">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className="p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect?.(chat.id)}
          >
            <div className="font-medium">{chat.title}</div>
            {chat.lastMessage ? (
              <div className="text-sm text-gray-500 line-clamp-1">
                {chat.lastMessage}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">Sin mensajes</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
