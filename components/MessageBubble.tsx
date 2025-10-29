import React from 'react';
import { Timestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { FiDownload, FiCheck, FiCheckCircle } from 'react-icons/fi';

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

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  showAvatar 
}) => {
  const formatTime = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <FiCheck className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <FiCheckCircle className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <FiCheckCircle className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            {message.fileUrl && (
              <img 
                src={message.fileUrl} 
                alt="Imagen compartida" 
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
            )}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-white/20 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiDownload className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {message.fileName || 'Archivo'}
              </p>
              <p className="text-xs opacity-75">Toca para descargar</p>
            </div>
            <button 
              onClick={() => message.fileUrl && window.open(message.fileUrl, '_blank')}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
        );
      
      default:
        return <p className="text-sm leading-relaxed">{message.content}</p>;
    }
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar && !isOwn ? (
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.senderId}`} />
            <AvatarFallback className="text-xs">
              {message.senderId.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>

      {/* Mensaje */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-2 rounded-2xl ${
            isOwn 
              ? 'bg-blue-600 text-white rounded-br-md' 
              : 'bg-white text-gray-900 border rounded-bl-md shadow-sm'
          }`}
        >
          {renderMessageContent()}
        </div>
        
        {/* Timestamp y estado */}
        <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};