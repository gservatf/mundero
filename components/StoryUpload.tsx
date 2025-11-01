import React, { useState, useRef } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "../hooks/use-toast";
import { FiX, FiCamera, FiVideo, FiUpload, FiLoader } from "react-icons/fi";

interface StoryUploadProps {
  onClose: () => void;
}

export const StoryUpload: React.FC<StoryUploadProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten imágenes y videos",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (50MB máximo)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 50MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);

    try {
      // Subir archivo a Firebase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const storageRef = ref(storage, `stories/${user.uid}/${fileName}`);

      const snapshot = await uploadBytes(storageRef, selectedFile);
      const mediaUrl = await getDownloadURL(snapshot.ref);

      // Crear documento de story
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(
        now.toMillis() + 72 * 60 * 60 * 1000,
      ); // 72 horas

      await addDoc(collection(db, "user_stories"), {
        userId: user.uid,
        mediaUrl,
        type: selectedFile.type.startsWith("image/") ? "image" : "video",
        createdAt: now,
        expiresAt,
      });

      toast({
        title: "Historia publicada",
        description: "Tu momento se ha compartido exitosamente",
      });

      onClose();
    } catch (error) {
      console.error("Error uploading story:", error);
      toast({
        title: "Error",
        description: "No se pudo publicar tu historia",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Compartir Momento</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FiX className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <FiCamera className="w-12 h-12 text-gray-400" />
                    <FiVideo className="w-12 h-12 text-gray-400" />
                  </div>

                  <div>
                    <p className="text-gray-600 mb-2">
                      Selecciona una imagen o video
                    </p>
                    <p className="text-sm text-gray-500">
                      Máximo 50MB • Expira en 72 horas
                    </p>
                  </div>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <FiUpload className="w-4 h-4" />
                    Seleccionar archivo
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                {selectedFile.type.startsWith("image/") ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    className="w-full h-64 object-cover"
                    controls
                  />
                )}

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Info del archivo */}
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Archivo:</strong> {selectedFile.name}
                </p>
                <p>
                  <strong>Tamaño:</strong>{" "}
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p>
                  <strong>Tipo:</strong>{" "}
                  {selectedFile.type.startsWith("image/") ? "Imagen" : "Video"}
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                  }}
                  disabled={isUploading}
                  className="flex-1"
                >
                  Cambiar
                </Button>

                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-4 h-4" />
                      Publicar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
