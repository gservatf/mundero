import React, { useEffect, useRef } from 'react';
import { CardHeader, CardTitle } from '../../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Badge } from '../../../../components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../../../../hooks/useAuth';
import { FiArrowLeft, FiMoreVertical } from 'react-icons/fi';

interface ChatWindowProps {
  chatId: string;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, onBack }) => {
  const { firebaseUser, user } = useAuth();
  const { 
    messages, 
    participants, 
    currentChat, 
    getOtherParticipant,
    typingUsers 
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = firebaseUser?.uid || user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const otherParticipant = currentChat ? getOtherParticipant(currentChat) : null;

  const formatLastSeen = () => {
    // Aquí podrías implementar lógica para mostrar "última vez visto"
    return 'En línea';
  };

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Selecciona una conversación para comenzar</p>
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
            <AvatarImage src={otherParticipant?.photoURL} />
            <AvatarFallback>
              {otherParticipant?.displayName?.substring(0, 2)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg">
              {otherParticipant?.displayName || 'Usuario'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">{formatLastSeen()}</p>
              {otherParticipant?.role && (
                <Badge variant="outline" className="text-xs">
                  {otherParticipant.role}
                </Badge>
              )}
            </div>
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
                isOwn={message.senderId === userId}
                showAvatar={
                  index === 0 || 
                  messages[index - 1].senderId !== message.senderId
                }
                senderName={
                  participants.find(p => p.uid === message.senderId)?.displayName || 'Usuario'
                }
              />
            ))}
            
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {otherParticipant?.displayName?.substring(0, 1) || 'U'}
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
        <ChatInput currentChatId={chatId} />
      </div>
    </div>
  );
};