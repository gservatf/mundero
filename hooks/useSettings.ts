import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";

export interface BrandingSettings {
  logoUrl?: string;
  faviconUrl?: string;
}

export interface GeneralSettings {
  title?: string;
  welcomePhrase?: string;
  tagline?: string;
}

export interface AppSettings {
  branding: BrandingSettings;
  general: GeneralSettings;
}

const defaultSettings: AppSettings = {
  branding: {
    logoUrl: "",
    faviconUrl: "/favicon.png",
  },
  general: {
    title: "MUNDERO Hub",
    welcomePhrase: "Conecta. Accede. Evoluciona.",
    tagline: "El hub universal de identidad del Grupo Servat.",
  },
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscripción en tiempo real a los cambios de configuración
    const unsubscribe = onSnapshot(doc(db, "settings", "app"), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as AppSettings;
        setSettings({ ...defaultSettings, ...data });

        // Actualizar favicon dinámicamente
        updateFavicon(data.branding?.faviconUrl);

        // Actualizar título dinámicamente
        updatePageTitle(data.general?.title);

        // Actualizar meta tags dinámicamente
        updateMetaTags(data.general);
      } else {
        setSettings(defaultSettings);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateFavicon = (faviconUrl?: string) => {
    if (faviconUrl) {
      const favicon = document.querySelector(
        'link[rel="icon"]',
      ) as HTMLLinkElement;
      if (favicon) {
        favicon.href = faviconUrl;
      } else {
        // Crear favicon si no existe
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.href = faviconUrl;
        document.head.appendChild(newFavicon);
      }
    }
  };

  const updatePageTitle = (title?: string) => {
    if (title) {
      document.title = title;
    }
  };

  const updateMetaTags = (general?: GeneralSettings) => {
    if (general?.tagline) {
      const description = document.querySelector(
        'meta[name="description"]',
      ) as HTMLMetaElement;
      if (description) {
        description.content = general.tagline;
      }

      // Open Graph
      const ogDescription = document.querySelector(
        'meta[property="og:description"]',
      ) as HTMLMetaElement;
      if (ogDescription) {
        ogDescription.content = general.tagline;
      }

      // Twitter
      const twitterDescription = document.querySelector(
        'meta[property="twitter:description"]',
      ) as HTMLMetaElement;
      if (twitterDescription) {
        twitterDescription.content = general.tagline;
      }
    }

    if (general?.title) {
      // Open Graph Title
      const ogTitle = document.querySelector(
        'meta[property="og:title"]',
      ) as HTMLMetaElement;
      if (ogTitle) {
        ogTitle.content = general.title;
      }

      // Twitter Title
      const twitterTitle = document.querySelector(
        'meta[property="twitter:title"]',
      ) as HTMLMetaElement;
      if (twitterTitle) {
        twitterTitle.content = general.title;
      }
    }
  };

  const updateBrandingSettings = async (
    branding: Partial<BrandingSettings>,
  ) => {
    try {
      const newSettings = {
        ...settings,
        branding: { ...settings.branding, ...branding },
      };

      await setDoc(doc(db, "settings", "app"), newSettings, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating branding settings:", error);
      return false;
    }
  };

  const updateGeneralSettings = async (general: Partial<GeneralSettings>) => {
    try {
      const newSettings = {
        ...settings,
        general: { ...settings.general, ...general },
      };

      await setDoc(doc(db, "settings", "app"), newSettings, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating general settings:", error);
      return false;
    }
  };

  const uploadImage = async (
    file: File,
    path: string,
  ): Promise<string | null> => {
    try {
      const timestamp = Date.now();
      const fileName = `${path}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  return {
    settings,
    loading,
    updateBrandingSettings,
    updateGeneralSettings,
    uploadImage,
  };
};
