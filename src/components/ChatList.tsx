import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useAuth } from "../hooks/useAuth";
import { mockApi } from "../lib/mockApi";
import { FiMessageCircle, FiPlus, FiSearch } from "react-icons/fi";
import { Chat, Message } from "../lib/types";

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId: string | null;
}

export const ChatList: React.FC<ChatListProps> = ({
  onChatSelect,
  selectedChatId,
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Usar id en lugar de uid
        const userChats = await mockApi.getUserChats(user.id);
        setChats(userChats);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [user]);

  const createNewChat = async () => {
    if (!user) return;

    try {
      // Usar id en lugar de uid
      const newChat = await mockApi.createChat([user.id, "other-user-id"]);
      setChats((prev) => [newChat, ...prev]);
      onChatSelect(newChat.id);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    // Usar id en lugar de uid
    const otherUserId = chat.participants.find((id) => id !== user?.id);
    return {
      id: otherUserId || "unknown",
      name: "Usuario",
      avatar: `https://ui-avatars.com/api/?name=Usuario&background=3b82f6&color=fff`,
    };
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FiMessageCircle className="w-5 h-5" />
            Mensajes
          </CardTitle>
          <Button size="sm" onClick={createNewChat}>
            <FiPlus className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {chats.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4">
            <div>
              <FiMessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-2">No hay conversaciones</p>
              <p className="text-sm text-gray-400">
                Inicia una nueva conversación
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              const isSelected = selectedChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={otherParticipant.avatar} />
                      <AvatarFallback>
                        {otherParticipant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {otherParticipant.name}
                        </h4>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>

                      {chat.lastMessage ? (
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage.text}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Nueva conversación
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="text-xs">
                        En línea
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </div>
  );
};
