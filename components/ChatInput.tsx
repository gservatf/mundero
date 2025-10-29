import React, { useState, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { 
  FiSend, 
  FiPaperclip, 
  FiImage, 
  FiFile,
  FiX,
  FiLoader
} from 'react-icons/fi';

interface ChatInputProps {
  chatId: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ chatId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || (!message.trim() && !selectedFile)) return;

    try {
      let messageData: any = {
        senderId: user.id, // Usar user.id en lugar de user.uid
        timestamp: serverTimestamp(),
        status: 'sent'
      };

      if (selectedFile) {
        setIsUploading(true);
        
        // Subir archivo a Firebase Storage
        const timestamp = Date.now();
        const fileName = `${timestamp}_${selectedFile.name}`;
        const storageRef = ref(storage, `chat-files/${chatId}/${fileName}`);
        
        const snapshot = await uploadBytes(storageRef, selectedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        messageData = {
          ...messageData,
          content: message.trim() || selectedFile.name,
          type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
          fileUrl: downloadURL,
          fileName: selectedFile.name
        };
      } else {
        messageData = {
          ...messageData,
          content: message.trim(),
          type: 'text'
        };
      }

      // Enviar mensaje
      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      // Actualizar último mensaje del chat
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: messageData.content,
        lastMessageType: messageData.type,
        lastMessageSender: user.id, // Usar user.id en lugar de user.uid
        updatedAt: serverTimestamp()
      });

      // Limpiar formulario
      setMessage('');
      setSelectedFile(null);
      setPreviewUrl('');
      setIsUploading(false);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Crear preview si es imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <div className="p-4 space-y-3">
      {/* Preview del archivo seleccionado */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
              <FiFile className="w-6 h-6 text-blue-600" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          
          <button 
            onClick={clearSelectedFile}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formulario de envío */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {/* Botón de imagen */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isUploading}
            >
              <FiImage className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Botón de archivo */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isUploading}
            >
              <FiPaperclip className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={selectedFile ? "Agregar comentario..." : "Escribe un mensaje..."}
            className="resize-none"
            disabled={isUploading}
          />
        </div>

        <Button 
          type="submit" 
          disabled={(!message.trim() && !selectedFile) || isUploading}
          className="px-4 py-2"
        >
          {isUploading ? (
            <FiLoader className="w-5 h-5 animate-spin" />
          ) : (
            <FiSend className="w-5 h-5" />
          )}
        </Button>
      </form>

      {/* Inputs ocultos para archivos */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};