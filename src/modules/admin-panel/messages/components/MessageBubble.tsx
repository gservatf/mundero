import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Message } from '../services/messageService';
import { useAuth } from '../../../../hooks/useAuth';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  senderName?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  showAvatar,
  senderName = 'Usuario'
}) => {
  const { firebaseUser, user } = useAuth();

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    const isRead = message.readBy && message.readBy.length > 1; // Más de 1 significa que el destinatario lo leyó
    
    if (isRead) {
      return <FiCheckCircle className="w-3 h-3 text-blue-500" />;
    } else {
      return <FiCheck className="w-3 h-3 text-gray-400" />;
    }
  };

  // Determinar si el mensaje es propio basado en el senderId y el usuario actual
  const userId = firebaseUser?.uid || user?.id;
  const messageIsOwn = userId === message.senderId;

  return (
    <div className={`flex gap-3 ${messageIsOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar && !messageIsOwn ? (
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${senderName}`} />
            <AvatarFallback className="text-xs">
              {senderName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>

      {/* Mensaje */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${messageIsOwn ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-2 rounded-2xl ${
            messageIsOwn 
              ? 'bg-blue-600 text-white rounded-br-md' 
              : 'bg-white text-gray-900 border rounded-bl-md shadow-sm'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.text}
          </p>
        </div>
        
        {/* Timestamp y estado */}
        <div className={`flex items-center gap-1 mt-1 px-2 ${messageIsOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};