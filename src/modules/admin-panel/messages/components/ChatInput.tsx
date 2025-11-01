import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useToast } from "../../../../hooks/use-toast";
import { useChat } from "../hooks/useChat";
import { FiSend, FiPaperclip, FiImage, FiLoader } from "react-icons/fi";

interface ChatInputProps {
  currentChatId?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ currentChatId }) => {
  const { sendMessage, sendingMessage, setTyping } = useChat();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || sendingMessage || !currentChatId) return;

    const messageText = message.trim();
    setMessage("");
    setIsTyping(false);
    setTyping(currentChatId, false);

    try {
      const success = await sendMessage(currentChatId, messageText);

      if (!success) {
        toast({
          title: "Error",
          description: "No se pudo enviar el mensaje",
          variant: "destructive",
        });
        setMessage(messageText); // Restaurar mensaje si falló
      }
    } catch (error) {
      console.error("[ChatInput] Error sending message:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
      setMessage(messageText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!currentChatId) return;

    // Manejar estado de "escribiendo"
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      setTyping(currentChatId, true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      setTyping(currentChatId, false);
    }

    // Reset del timeout de "escribiendo"
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTyping(currentChatId, false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (currentChatId) {
        setTyping(currentChatId, false);
      }
    };
  }, [setTyping, currentChatId]);

  return (
    <div className="p-4">
      {/* Formulario de envío */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {/* Botón de imagen - Funcionalidad futura */}
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-50 cursor-not-allowed"
              disabled={true}
              title="Próximamente: Enviar imágenes"
            >
              <FiImage className="w-5 h-5 text-gray-400" />
            </button>

            {/* Botón de archivo - Funcionalidad futura */}
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-50 cursor-not-allowed"
              disabled={true}
              title="Próximamente: Enviar archivos"
            >
              <FiPaperclip className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <Input
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={sendingMessage || !currentChatId}
            className="resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={!message.trim() || sendingMessage || !currentChatId}
          className="px-4 py-2"
        >
          {sendingMessage ? (
            <FiLoader className="w-5 h-5 animate-spin" />
          ) : (
            <FiSend className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
};
