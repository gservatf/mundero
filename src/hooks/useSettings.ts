import { useState, useEffect } from "react";
import { db, storage } from "../lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Hook centralizado de configuración global de Mundero.
 * Escucha el documento fijo 'settings/app' en Firestore
 * y permite actualizar configuraciones generales y de branding.
 */
export function useSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Lectura en tiempo real del documento settings/app
  useEffect(() => {
    const refDoc = doc(db, "settings", "app");

    const unsubscribe = onSnapshot(
      refDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data());
        } else {
          console.warn("[useSettings] El documento settings/app no existe.");
        }
      },
      (error) => console.error("[useSettings] Firestore error:", error),
    );

    return () => unsubscribe();
  }, []);

  // ⚙️ Actualiza configuraciones generales (nombre, tema, meta, etc.)
  const updateGeneralSettings = async (data: Record<string, any>) => {
    setLoading(true);
    try {
      const refDoc = doc(db, "settings", "app");
      await updateDoc(refDoc, data);
      console.log("[useSettings] Configuraciones generales actualizadas.");
    } catch (error) {
      console.error(
        "[useSettings] Error al actualizar configuraciones:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Actualiza configuraciones de branding (colores, logos, slogans)
  const updateBrandingSettings = async (branding: Record<string, any>) => {
    setLoading(true);
    try {
      const refDoc = doc(db, "settings", "app");
      await updateDoc(refDoc, { branding });
      console.log("[useSettings] Branding actualizado.");
    } catch (error) {
      console.error("[useSettings] Error al actualizar branding:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📤 Sube imágenes al Storage y devuelve su URL pública
  const uploadImage = async (file: File, path = "branding") => {
    setLoading(true);
    try {
      const fileRef = ref(storage, `${path}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      console.log("[useSettings] Imagen subida con éxito:", url);
      return url;
    } catch (error) {
      console.error("[useSettings] Error al subir imagen:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    updateGeneralSettings,
    updateBrandingSettings,
    uploadImage,
  };
}
