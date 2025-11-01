import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useAuth } from "../hooks/useAuth";
import { mockApi } from "../lib/mockApi";
import { FiCamera, FiType, FiUpload, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

interface StoryUploadProps {
  onClose: () => void;
  onStoryCreated: () => void;
}

const StoryUpload: React.FC<StoryUploadProps> = ({
  onClose,
  onStoryCreated,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || (!content.trim() && !mediaFile)) {
      toast.error("Agrega contenido o una imagen para tu historia");
      return;
    }

    try {
      setUploading(true);

      // Simular subida de archivo si hay media
      let mediaUrl = "";
      if (mediaFile) {
        // En una implementación real, subirías el archivo a un servicio de almacenamiento
        mediaUrl = `https://example.com/media/${user.id}/${Date.now()}`;
      }

      const newStory = await mockApi.createStory({
        userId: user.id,
        content: content.trim(),
        mediaUrl,
        userDisplayName: user.display_name,
        userPhotoURL: user.photo_url,
      });

      toast.success("Historia publicada exitosamente");
      onStoryCreated();
      onClose();
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Error al publicar la historia");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FiCamera className="w-5 h-5" />
              Nueva Historia
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <FiX className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative">
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeMedia}
                  className="absolute top-2 right-2"
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Content Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiType className="w-4 h-4 inline mr-1" />
                Contenido
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué está pasando?"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCamera className="w-4 h-4 inline mr-1" />
                Imagen (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 flex items-center gap-2"
                disabled={uploading || (!content.trim() && !mediaFile)}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryUpload;
