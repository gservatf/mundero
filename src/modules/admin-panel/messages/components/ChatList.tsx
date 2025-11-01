import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../../../../hooks/useAuth";
import { ChatParticipant } from "../hooks/useChat";
import { FiMessageCircle, FiPlus, FiSearch, FiX } from "react-icons/fi";

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId: string | null;
}

export const ChatList: React.FC<ChatListProps> = ({
  onChatSelect,
  selectedChatId,
}) => {
  const { user, firebaseUser } = useAuth();
  const {
    chats,
    loading,
    createChat,
    searchUsers,
    getOtherParticipant,
    hasUnreadMessages,
  } = useChat();

  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ChatParticipant[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Protección visual: verificar que el usuario tenga UID antes de mostrar la interfaz
  const userId = firebaseUser?.uid || user?.id;
  if (!userId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400 text-center mt-6">Cargando tus chats...</p>
      </div>
    );
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (term.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const results = await searchUsers(term);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleCreateChat = async (recipientId: string) => {
    const chatId = await createChat(recipientId);
    if (chatId) {
      onChatSelect(chatId);
      setShowNewChat(false);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
          <Button
            size="sm"
            onClick={() => setShowNewChat(!showNewChat)}
            variant={showNewChat ? "destructive" : "default"}
          >
            {showNewChat ? (
              <FiX className="w-4 h-4" />
            ) : (
              <FiPlus className="w-4 h-4" />
            )}
          </Button>
        </div>

        {showNewChat && (
          <div className="space-y-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar usuario por email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchingUsers && (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg">
                {searchResults.map((user) => (
                  <div
                    key={user.uid}
                    onClick={() => handleCreateChat(user.uid)}
                    className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback>
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    {user.role && (
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {chats.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4">
            <div>
              <FiMessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 mb-2">No hay conversaciones</p>
              <p className="text-sm text-gray-400">
                Haz clic en + para iniciar una nueva conversación
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              const isSelected = selectedChatId === chat.id;
              const hasUnread = hasUnreadMessages(chat.id);

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
                      <AvatarImage src={otherParticipant?.photoURL} />
                      <AvatarFallback>
                        {otherParticipant?.displayName
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`font-medium truncate ${hasUnread ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {otherParticipant?.displayName || "Usuario"}
                        </h4>
                        {chat.lastMessageTimestamp && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessageTimestamp)}
                          </span>
                        )}
                      </div>

                      {chat.lastMessage ? (
                        <p
                          className={`text-sm truncate ${hasUnread ? "font-medium text-gray-900" : "text-gray-600"}`}
                        >
                          {chat.lastMessage}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Nueva conversación
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {otherParticipant?.role && (
                        <Badge variant="secondary" className="text-xs">
                          {otherParticipant.role}
                        </Badge>
                      )}
                      {hasUnread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
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
