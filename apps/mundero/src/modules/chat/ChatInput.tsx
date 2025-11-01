// src/modules/chat/ChatInput.tsx
import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  getFirestore,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "../../core/firebase/firebaseClient";

// Wrapper opcional: import { db, auth } from "@/lib/firebase";
const db = getFirestore(app);
const auth = getAuth(app);

interface ChatInputProps {
  chatId: string | null;
  className?: string;
  placeholder?: string;
  onSent?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  chatId,
  className,
  placeholder = "Escribe un mensaje…",
  onSent,
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    const clean = text.trim();
    if (!chatId || !user?.uid || clean.length === 0) return;

    try {
      setSending(true);
      const msgsCol = collection(db, "chats", chatId, "messages");

      await addDoc(msgsCol, {
        text: clean,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Actualiza cabecera del chat
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessage: clean,
        updatedAt: serverTimestamp(),
      });

      setText("");
      onSent?.();
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className={`border-t border-gray-200 p-2 ${className || ""}`}>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!chatId || sending}
        />
        <button
          onClick={handleSend}
          disabled={!chatId || sending || text.trim().length === 0}
          className="rounded-lg px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
