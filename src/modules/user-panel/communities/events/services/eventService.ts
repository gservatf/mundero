// FASE 6.4 — Event Service para Eventos & Lives de Comunidades
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
// Integración de reputación (opcional, no intrusiva)
import {
  reputationService,
  REPUTATION_ENABLED,
} from "../../../reputation/reputationService";

// Tipos de datos para eventos
export interface CommunityEvent {
  id: string;
  communityId: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  startAt: number;
  endAt?: number;
  location?: string;
  embedUrl?: string; // YouTube, Meet, Zoom, etc.
  coverImage?: string;
  tags?: string[];
  isLive?: boolean;
  attendees?: string[]; // UIDs
  maxAttendees?: number;
  isRecurring?: boolean;
  recurringPattern?: "daily" | "weekly" | "monthly";
  status: "scheduled" | "live" | "ended" | "cancelled";
}

export interface CreateEventData {
  title: string;
  description: string;
  startAt: number;
  endAt?: number;
  location?: string;
  embedUrl?: string;
  coverImage?: string;
  tags?: string[];
  maxAttendees?: number;
  isRecurring?: boolean;
  recurringPattern?: "daily" | "weekly" | "monthly";
}

export interface EventReminder {
  id: string;
  userId: string;
  eventId: string;
  communityId: string;
  createdAt: number;
  reminderSent?: boolean;
}

class EventService {
  private eventsCollection = "communityEvents";
  private remindersCollection = "eventReminders";

  // Crear evento
  async createEvent(
    communityId: string,
    data: CreateEventData & { createdBy: string; createdByName?: string },
  ): Promise<string> {
    try {
      const eventData: Omit<CommunityEvent, "id"> = {
        communityId,
        createdBy: data.createdBy,
        createdByName: data.createdByName || "Usuario",
        title: data.title,
        description: data.description,
        startAt: data.startAt,
        endAt: data.endAt,
        location: data.location,
        embedUrl: data.embedUrl
          ? this.validateEmbedUrl(data.embedUrl)
          : undefined,
        coverImage: data.coverImage,
        tags: data.tags || [],
        isLive: false,
        attendees: [data.createdBy], // El creador se agrega automáticamente
        maxAttendees: data.maxAttendees,
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern,
        status: "scheduled",
        createdAt: Date.now(),
      };

      const docRef = await addDoc(
        collection(db, this.eventsCollection),
        eventData,
      );

      // Log analytics
      this.logAnalytics("community_event_created", {
        communityId,
        eventId: docRef.id,
        createdBy: data.createdBy,
        hasEmbed: !!data.embedUrl,
        isRecurring: data.isRecurring || false,
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  // Obtener evento por ID
  async getEvent(eventId: string): Promise<CommunityEvent | null> {
    try {
      const eventDoc = await getDoc(doc(db, this.eventsCollection, eventId));
      if (eventDoc.exists()) {
        return { id: eventDoc.id, ...eventDoc.data() } as CommunityEvent;
      }
      return null;
    } catch (error) {
      console.error("Error getting event:", error);
      return null;
    }
  }

  // Obtener eventos de una comunidad
  async getEventsByCommunity(
    communityId: string,
    limitCount: number = 20,
  ): Promise<CommunityEvent[]> {
    try {
      const q = query(
        collection(db, this.eventsCollection),
        where("communityId", "==", communityId),
        orderBy("startAt", "asc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const events: CommunityEvent[] = [];

      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() } as CommunityEvent);
      });

      return events;
    } catch (error) {
      console.error("Error getting community events:", error);
      return [];
    }
  }

  // Listener en tiempo real para eventos de comunidad
  listenToEvents(
    communityId: string,
    callback: (events: CommunityEvent[]) => void,
  ): () => void {
    const q = query(
      collection(db, this.eventsCollection),
      where("communityId", "==", communityId),
      orderBy("startAt", "asc"),
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const events: CommunityEvent[] = [];
        querySnapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() } as CommunityEvent);
        });
        callback(events);
      },
      (error) => {
        console.error("Error listening to events:", error);
        callback([]);
      },
    );
  }

  // Actualizar evento
  async updateEvent(
    communityId: string,
    eventId: string,
    updateData: Partial<CommunityEvent>,
  ): Promise<void> {
    try {
      const eventRef = doc(db, this.eventsCollection, eventId);
      await updateDoc(eventRef, {
        ...updateData,
        updatedAt: Date.now(),
      });

      // Log analytics
      this.logAnalytics("event_updated", {
        communityId,
        eventId,
        hasEmbedUrl: Boolean(updateData.embedUrl),
        hasMaxAttendees: Boolean(updateData.maxAttendees),
      });
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  // Unirse a evento
  async joinEvent(
    communityId: string,
    eventId: string,
    userId: string,
  ): Promise<void> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error("Evento no encontrado");
      }

      // Verificar si ya está inscrito
      if (event.attendees?.includes(userId)) {
        throw new Error("Ya estás inscrito en este evento");
      }

      // Verificar límite de asistentes
      if (
        event.maxAttendees &&
        event.attendees &&
        event.attendees.length >= event.maxAttendees
      ) {
        throw new Error("El evento ha alcanzado el límite de asistentes");
      }

      await updateDoc(doc(db, this.eventsCollection, eventId), {
        attendees: arrayUnion(userId),
      });

      // Log analytics
      this.logAnalytics("community_event_joined", {
        eventId,
        userId,
        communityId: event.communityId,
      });

      // Hook de reputación opcional (no bloquea unirse al evento)
      if (REPUTATION_ENABLED) {
        try {
          await reputationService.logAction(userId, "event_attend", {
            eventId,
            eventTitle: event.title,
            communityId: event.communityId,
            eventType: "community_event",
          });
        } catch (error) {
          console.log("Reputation tracking failed (non-blocking):", error);
        }
      }
    } catch (error) {
      console.error("Error joining event:", error);
      throw error;
    }
  }

  // Salir de evento
  async leaveEvent(
    communityId: string,
    eventId: string,
    userId: string,
  ): Promise<void> {
    try {
      await updateDoc(doc(db, this.eventsCollection, eventId), {
        attendees: arrayRemove(userId),
      });

      // Log analytics
      this.logAnalytics("community_event_left", {
        eventId,
        userId,
      });
    } catch (error) {
      console.error("Error leaving event:", error);
      throw error;
    }
  }

  // Eliminar evento (solo creador o admin)
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error("Evento no encontrado");
      }

      // Verificar permisos (por simplicidad, solo el creador puede eliminar)
      // TODO: integrar con membershipService para verificar roles de admin
      if (event.createdBy !== userId) {
        throw new Error("No tienes permisos para eliminar este evento");
      }

      await deleteDoc(doc(db, this.eventsCollection, eventId));

      // Log analytics
      this.logAnalytics("community_event_deleted", {
        eventId,
        userId,
        communityId: event.communityId,
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }

  // Actualizar estado del evento (live, ended, etc.)
  async updateEventStatus(
    eventId: string,
    status: CommunityEvent["status"],
    isLive?: boolean,
  ): Promise<void> {
    try {
      const updateData: any = { status };
      if (isLive !== undefined) {
        updateData.isLive = isLive;
      }

      await updateDoc(doc(db, this.eventsCollection, eventId), updateData);

      // Log analytics
      this.logAnalytics("community_event_status_updated", {
        eventId,
        status,
        isLive,
      });
    } catch (error) {
      console.error("Error updating event status:", error);
      throw error;
    }
  }

  // Agregar recordatorio
  async addReminder(eventId: string, userId: string): Promise<void> {
    try {
      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error("Evento no encontrado");
      }

      const reminderData: Omit<EventReminder, "id"> = {
        userId,
        eventId,
        communityId: event.communityId,
        createdAt: Date.now(),
        reminderSent: false,
      };

      await addDoc(collection(db, this.remindersCollection), reminderData);

      // Log analytics
      this.logAnalytics("community_event_reminder_added", {
        eventId,
        userId,
        communityId: event.communityId,
      });
    } catch (error) {
      console.error("Error adding reminder:", error);
      throw error;
    }
  }

  // Verificar si el usuario tiene recordatorio activo
  async hasReminder(eventId: string, userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.remindersCollection),
        where("eventId", "==", eventId),
        where("userId", "==", userId),
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking reminder:", error);
      return false;
    }
  }

  // Obtener eventos próximos (para notificaciones)
  async getUpcomingEvents(userId: string): Promise<CommunityEvent[]> {
    try {
      const now = Date.now();
      const inOneHour = now + 60 * 60 * 1000;

      const q = query(
        collection(db, this.eventsCollection),
        where("attendees", "array-contains", userId),
        where("startAt", ">=", now),
        where("startAt", "<=", inOneHour),
        orderBy("startAt", "asc"),
      );

      const querySnapshot = await getDocs(q);
      const events: CommunityEvent[] = [];

      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() } as CommunityEvent);
      });

      return events;
    } catch (error) {
      console.error("Error getting upcoming events:", error);
      return [];
    }
  }

  // Validar URL embebible
  private validateEmbedUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // YouTube
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        if (url.includes("/embed/")) {
          return url;
        }
        // Convertir URL normal a embed
        const videoId = this.extractYouTubeId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }

      // Google Drive
      if (hostname.includes("drive.google.com")) {
        return url;
      }

      // Meet, Zoom, Twitch (permitir como están)
      if (
        hostname.includes("meet.google.com") ||
        hostname.includes("zoom.us") ||
        hostname.includes("twitch.tv")
      ) {
        return url;
      }

      // Para otras URLs, devolver como están pero log warning
      console.warn("URL embed no reconocida:", url);
      return url;
    } catch (error) {
      console.error("Invalid embed URL:", url);
      throw new Error("URL de embed inválida");
    }
  }

  // Extraer ID de video de YouTube
  private extractYouTubeId(url: string): string | null {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  // Log analytics
  private logAnalytics(event: string, data: any): void {
    try {
      // Integración con sistema de analytics
      console.log("Event Analytics:", event, data);
      // TODO: integrar con analyticsService cuando esté disponible
    } catch (error) {
      console.error("Error logging analytics:", error);
    }
  }

  // Filtrar eventos por estado
  filterEventsByStatus(
    events: CommunityEvent[],
    status: CommunityEvent["status"][],
  ): CommunityEvent[] {
    return events.filter((event) => status.includes(event.status));
  }

  // Filtrar eventos por fecha
  filterEventsByDate(
    events: CommunityEvent[],
    startDate?: number,
    endDate?: number,
  ): CommunityEvent[] {
    return events.filter((event) => {
      if (startDate && event.startAt < startDate) return false;
      if (endDate && event.startAt > endDate) return false;
      return true;
    });
  }

  // Verificar si un evento está activo (en vivo)
  isEventLive(event: CommunityEvent): boolean {
    const now = Date.now();
    return (
      event.isLive ||
      event.status === "live" ||
      (event.startAt <= now && (!event.endAt || event.endAt >= now))
    );
  }

  // Obtener duración del evento en minutos
  getEventDuration(event: CommunityEvent): number | null {
    if (!event.endAt) return null;
    return Math.round((event.endAt - event.startAt) / (1000 * 60));
  }
}

// Export singleton instance
export const eventService = new EventService();
