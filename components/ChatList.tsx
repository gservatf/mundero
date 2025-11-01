import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { FiMessageCircle, FiUsers } from "react-icons/fi";

interface Chat {
  id: string;
  members: string[];
  lastMessage: string;
  lastMessageType: "text" | "image" | "file";
  lastMessageSender: string;
  updatedAt: Timestamp;
  unreadCount?: number;
}

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  onChatSelect,
  selectedChatId,
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("members", "array-contains", user.uid),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsList: Chat[] = [];
      snapshot.forEach((doc) => {
        chatsList.push({ id: doc.id, ...doc.data() } as Chat);
      });
      setChats(chatsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const formatTime = (timestamp: Timestamp) => {
    const now = new Date();
    const messageTime = timestamp.toDate();
    const diffInHours =
      (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 días
      return messageTime.toLocaleDateString("es-ES", { weekday: "short" });
    } else {
      return messageTime.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const getOtherMemberName = (members: string[]) => {
    const otherMember = members.find((member) => member !== user?.uid);
    return otherMember || "Usuario desconocido";
  };

  const truncateMessage = (message: string, type: string) => {
    if (type === "image") return "📷 Imagen";
    if (type === "file") return "📎 Archivo";
    return message.length > 50 ? `${message.substring(0, 50)}...` : message;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-3 p-3 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-4 border-b">
        <FiMessageCircle className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-gray-900">Mensajes</h2>
        <Badge variant="secondary" className="ml-auto">
          {chats.length}
        </Badge>
      </div>

      {chats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay conversaciones</p>
          <p className="text-sm">Inicia una nueva conversación</p>
        </div>
      ) : (
        <div className="space-y-1">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedChatId === chat.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : ""
              }`}
              onClick={() => onChatSelect(chat.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${getOtherMemberName(chat.members)}`}
                    />
                    <AvatarFallback>
                      {getOtherMemberName(chat.members)
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {getOtherMemberName(chat.members)}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(chat.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessageSender === user?.uid && (
                          <span className="text-blue-600 mr-1">Tú:</span>
                        )}
                        {truncateMessage(
                          chat.lastMessage,
                          chat.lastMessageType,
                        )}
                      </p>

                      {chat.unreadCount && chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
