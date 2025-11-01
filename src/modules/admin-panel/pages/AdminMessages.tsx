import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { ChatList, ChatWindow } from "../messages";
import { useAuth } from "../../../hooks/useAuth";
import { FiMessageCircle, FiLoader } from "react-icons/fi";

// Componente de carga
const LoadingScreen: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <FiLoader className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
      <p className="text-gray-600">{text}</p>
    </div>
  </div>
);

export const AdminMessages: React.FC = () => {
  const { user, firebaseUser, loading } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // 🔒 Previene renderizado con usuario undefined
  if (loading) {
    return <LoadingScreen text="Conectando a Firebase..." />;
  }

  if (!user && !firebaseUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <FiMessageCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error de Autenticación</h3>
          <p className="text-sm">
            No se pudo verificar tu identidad. Recarga la página.
          </p>
        </div>
      </div>
    );
  }

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedChatId(null);
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <FiMessageCircle className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
            <p className="text-gray-600">
              Comunicación interna del ecosistema MUNDERO
            </p>
          </div>
        </div>
      </div>

      <Card className="h-[calc(100vh-200px)]">
        <div className="flex h-full">
          {/* Lista de chats - Desktop siempre visible, Mobile condicional */}
          <div
            className={`w-full lg:w-1/3 border-r ${showMobileChat ? "hidden lg:block" : "block"}`}
          >
            <ChatList
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChatId}
            />
          </div>

          {/* Ventana de chat - Desktop siempre visible, Mobile condicional */}
          <div
            className={`w-full lg:w-2/3 ${showMobileChat ? "block" : "hidden lg:block"}`}
          >
            {selectedChatId ? (
              <ChatWindow chatId={selectedChatId} onBack={handleBackToList} />
            ) : (
              <div className="flex-1 flex items-center justify-center h-full bg-gray-50">
                <div className="text-center text-gray-500">
                  <FiMessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    Selecciona una conversación
                  </h3>
                  <p className="text-sm">
                    Elige un chat de la lista para comenzar a conversar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
