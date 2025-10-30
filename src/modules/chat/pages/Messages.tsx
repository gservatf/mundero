import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import ChatList from '../ChatList';
import ChatWindow from '../ChatWindow';
import ChatInput from '../ChatInput';
import { FiMessageCircle } from 'react-icons/fi';

const Messages: React.FC = () => {
  const auth = getAuth();
  const firebaseUser = auth.currentUser;
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // 🔐 Protección de ruta: solo mostrar si el usuario está autenticado
  if (!firebaseUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <FiMessageCircle className="w-16 h-16 mx-auto text-gray-300" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-700">Autenticación requerida</h2>
            <p className="text-gray-500">Inicia sesión para acceder a tus mensajes</p>
          </div>
        </div>
      </div>
    );
  }

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleMessageSent = () => {
    // Optional: Add any post-send logic here
    console.log('[MessagesPage] Mensaje enviado');
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-lg shadow-sm border">
      {/* 📋 Lista de chats - Panel izquierdo */}
      <aside className="w-96 border-r border-gray-200 flex flex-col">
        <ChatList
          onSelect={handleChatSelect}
          className="h-full"
        />
      </aside>

      {/* 💬 Área principal de chat */}
      <main className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            {/* Ventana de mensajes */}
            <div className="flex-1 overflow-hidden">
              <ChatWindow
                chatId={selectedChatId}
                className="h-full"
              />
            </div>
            
            {/* Input para escribir mensajes */}
            <div className="border-t border-gray-200">
              <ChatInput
                chatId={selectedChatId}
                onSent={handleMessageSent}
                placeholder="Escribe tu mensaje..."
                className=""
              />
            </div>
          </>
        ) : (
          // 📝 Placeholder cuando no hay chat seleccionado
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
              <FiMessageCircle className="w-16 h-16 mx-auto text-gray-300" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-700">Bienvenido a Mensajes</h3>
                <p className="text-gray-500 max-w-sm">
                  Selecciona una conversación de la lista para comenzar a chatear, 
                  o crea una nueva conversación.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;