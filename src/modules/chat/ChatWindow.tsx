// src/modules/chat/ChatWindow.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  getFirestore,
  DocumentData,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

// Si tienes wrapper propio, puedes usar: import { db, auth } from "@/lib/firebase";
const db = getFirestore();
const auth = getAuth();

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

interface ChatWindowProps {
  chatId: string | null;
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, className }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  const msgsCol = useMemo(() => {
    if (!chatId) return null;
    return collection(db, "chats", chatId, "messages");
  }, [chatId]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid || !chatId || !msgsCol) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const q = query(msgsCol, orderBy("createdAt", "asc")); // single-field index (seguro)
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            text: (data.text as string) ?? "",
            senderId: (data.senderId as string) ?? "",
            createdAt: (data.createdAt as any) ?? null,
          } as Message;
        });
        setMessages(list);
        setLoading(false);

        // Auto-scroll
        requestAnimationFrame(() =>
          endRef.current?.scrollIntoView({ behavior: "smooth" }),
        );
      },
      (err) => {
        console.error("onSnapshot(messages) error:", err);
        setErrorMsg("No se pudieron cargar los mensajes de este chat.");
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user?.uid, chatId, msgsCol]);

  if (!chatId) {
    return (
      <div className={className}>
        <div className="p-3 text-sm text-gray-500">
          Selecciona un chat para ver los mensajes.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={className}>
        <div className="p-3 text-sm text-gray-500">Cargando mensajes…</div>
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

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-500">Aún no hay mensajes aquí.</div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.uid;
            return (
              <div
                key={m.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  mine
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-gray-100 text-gray-900"
                }`}
              >
                {m.text}
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
