import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeGuard } from '../hooks/useRealtimeGuard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { FiArrowLeft, FiMoreVertical } from 'react-icons/fi';

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Timestamp;
  status: 'sent' | 'delivered' | 'read';
  fileUrl?: string;
  fileName?: string;
}

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Crear query protegida para mensajes
  const messagesQuery = (chatId && user?.id) 
    ? query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'))
    : null;

  // Usar useRealtimeGuard para escuchar mensajes
  useRealtimeGuard(
    messagesQuery,
    (messagesList: Message[]) => {
      setMessages(messagesList);
      setLoading(false);
      
      // Marcar mensajes como leídos
      markMessagesAsRead(messagesList);
    },
    (error) => {
      console.error('[ChatWindow] Error loading messages:', error);
      setLoading(false);
    },
    [chatId, user?.id]
  );

  const markMessagesAsRead = async (messagesList: Message[]) => {
    if (!user) return;

    const unreadMessages = messagesList.filter(
      msg => msg.senderId !== user.id && msg.status !== 'read'
    );

    for (const message of unreadMessages) {
      try {
        await updateDoc(doc(db, 'chats', chatId, 'messages', message.id), {
          status: 'read'
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const getOtherMemberName = () => {
    if (!chatInfo || !user) return 'Usuario';
    const otherMember = chatInfo.members?.find((member: string) => member !== user.id);
    return otherMember || 'Usuario desconocido';
  };

  const formatLastSeen = () => {
    // Aquí podrías implementar lógica para mostrar "última vez visto"
    return 'En línea';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Cargando conversación...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header del chat */}
      <CardHeader className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          
          <Avatar className="w-10 h-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getOtherMemberName()}`} />
            <AvatarFallback>
              {getOtherMemberName().substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg">{getOtherMemberName()}</CardTitle>
            <p className="text-sm text-gray-500">{formatLastSeen()}</p>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay mensajes aún</p>
            <p className="text-sm">Inicia la conversación</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
                showAvatar={
                  index === 0 || 
                  messages[index - 1].senderId !== message.senderId
                }
              />
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {getOtherMemberName().substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="border-t bg-white">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
};