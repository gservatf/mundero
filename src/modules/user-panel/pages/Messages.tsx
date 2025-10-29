import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMessageSquare, 
  FiUsers, 
  FiSend, 
  FiPaperclip,
  FiSearch,
  FiMoreVertical,
  FiPhone,
  FiVideo
} from 'react-icons/fi';

export const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const chats = [
    {
      id: 1,
      name: 'Equipo LEGALTY',
      type: 'group',
      lastMessage: 'Nueva actualización disponible',
      timestamp: '10:30',
      unread: 2,
      avatar: '⚖️',
      online: true
    },
    {
      id: 2,
      name: 'María González',
      type: 'direct',
      lastMessage: 'Perfecto, nos vemos mañana',
      timestamp: '09:15',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      online: true
    },
    {
      id: 3,
      name: 'Soporte Técnico',
      type: 'support',
      lastMessage: 'Tu ticket ha sido resuelto',
      timestamp: 'Ayer',
      unread: 0,
      avatar: '🛠️',
      online: false
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'María González',
      content: '¡Hola! ¿Cómo va el proyecto de LEGALTY?',
      timestamp: '09:00',
      isOwn: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 2,
      sender: 'Tú',
      content: 'Todo va muy bien, ya tenemos el 80% completado',
      timestamp: '09:05',
      isOwn: true,
      avatar: ''
    },
    {
      id: 3,
      sender: 'María González',
      content: 'Excelente, ¿podemos hacer una reunión mañana para revisar los avances?',
      timestamp: '09:10',
      isOwn: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: 4,
      sender: 'Tú',
      content: 'Perfecto, nos vemos mañana',
      timestamp: '09:15',
      isOwn: true,
      avatar: ''
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // TODO: Send message via Firebase
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mensajes</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              whileHover={{ backgroundColor: '#f9fafb' }}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 cursor-pointer border-b border-gray-100 ${
                selectedChat === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {typeof chat.avatar === 'string' && chat.avatar.startsWith('http') ? (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {chat.avatar}
                    </div>
                  )}
                  {chat.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {typeof chats.find(c => c.id === selectedChat)?.avatar === 'string' && 
                   chats.find(c => c.id === selectedChat)?.avatar?.startsWith('http') ? (
                    <img
                      src={chats.find(c => c.id === selectedChat)?.avatar || ''}
                      alt={chats.find(c => c.id === selectedChat)?.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {chats.find(c => c.id === selectedChat)?.avatar}
                    </div>
                  )}
                  {chats.find(c => c.id === selectedChat)?.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {chats.find(c => c.id === selectedChat)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {chats.find(c => c.id === selectedChat)?.online ? 'En línea' : 'Desconectado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <FiPhone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <FiVideo className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <FiMoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                    message.isOwn ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {!message.isOwn && message.avatar && (
                      <img
                        src={message.avatar}
                        alt={message.sender}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className={`px-4 py-2 rounded-2xl ${
                        message.isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${
                        message.isOwn ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <FiPaperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Los mensajes se eliminan automáticamente después de 72 horas
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-gray-500">
                Elige un chat de la lista para comenzar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};