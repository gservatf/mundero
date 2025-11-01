// FASE 6.4 — EventReminderButton Component
import React, { useState, useEffect } from "react";
import { Button } from "../../../../../components/ui/button";
import { Bell, BellOff, Clock } from "lucide-react";
import { CommunityEvent } from "../services/eventService";

interface EventReminder {
  eventId: string;
  userId: string;
  eventTitle: string;
  reminderTime: number;
  eventStartTime: number;
  createdAt: number;
}

interface EventReminderButtonProps {
  event: CommunityEvent;
  userId?: string;
  onReminderToggle?: (eventId: string, enabled: boolean) => Promise<void>;
  disabled?: boolean;
}

export function EventReminderButton({
  event,
  userId,
  onReminderToggle,
  disabled = false,
}: EventReminderButtonProps) {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Verificar permisos de notificaciones
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Verificar si el usuario tiene recordatorio activo para este evento
    checkExistingReminder();
  }, [event.id, userId]);

  const checkExistingReminder = () => {
    if (!userId) return;

    // Verificar en localStorage si hay recordatorio programado
    const reminders = getStoredReminders();
    const hasReminder = reminders.some(
      (r) => r.eventId === event.id && r.userId === userId,
    );
    setReminderEnabled(hasReminder);
  };

  const getStoredReminders = (): EventReminder[] => {
    try {
      const stored = localStorage.getItem("eventReminders");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setStoredReminders = (reminders: EventReminder[]) => {
    try {
      localStorage.setItem("eventReminders", JSON.stringify(reminders));
    } catch (error) {
      console.error("Error storing reminders:", error);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      alert("Este navegador no soporta notificaciones");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      alert(
        "Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.",
      );
      return false;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission === "granted";
  };

  const scheduleReminder = (reminderTime: number) => {
    const timeUntilReminder = reminderTime - Date.now();

    if (timeUntilReminder <= 0) {
      console.log(
        "El evento ya ha comenzado o el recordatorio es para el pasado",
      );
      return;
    }

    // Programar notificación
    setTimeout(() => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`¡Recordatorio de evento!`, {
          body: `${event.title} comenzará en 15 minutos`,
          icon: "/images/notification-icon.png",
          tag: `event-reminder-${event.id}`,
          requireInteraction: true,
        });
      }

      // Remover recordatorio después de mostrar
      removeReminder();
    }, timeUntilReminder);
  };

  const addReminder = () => {
    if (!userId) return;

    const reminders = getStoredReminders();
    const reminderTime = event.startAt - 15 * 60 * 1000; // 15 minutos antes

    const newReminder = {
      eventId: event.id,
      userId: userId,
      eventTitle: event.title,
      reminderTime: reminderTime,
      eventStartTime: event.startAt,
      createdAt: Date.now(),
    };

    const updatedReminders = reminders.filter(
      (r) => !(r.eventId === event.id && r.userId === userId),
    );
    updatedReminders.push(newReminder);

    setStoredReminders(updatedReminders);
    scheduleReminder(reminderTime);
  };

  const removeReminder = () => {
    if (!userId) return;

    const reminders = getStoredReminders();
    const updatedReminders = reminders.filter(
      (r) => !(r.eventId === event.id && r.userId === userId),
    );
    setStoredReminders(updatedReminders);
  };

  const handleToggleReminder = async () => {
    if (!userId || disabled) return;

    setLoading(true);

    try {
      if (!reminderEnabled) {
        // Activar recordatorio
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
          setLoading(false);
          return;
        }

        addReminder();
        setReminderEnabled(true);

        if (onReminderToggle) {
          await onReminderToggle(event.id, true);
        }
      } else {
        // Desactivar recordatorio
        removeReminder();
        setReminderEnabled(false);

        if (onReminderToggle) {
          await onReminderToggle(event.id, false);
        }
      }
    } catch (error) {
      console.error("Error toggling reminder:", error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el evento ya ha comenzado
  const eventHasStarted = event.startAt <= Date.now();
  const isEventSoon = event.startAt - Date.now() < 15 * 60 * 1000; // Menos de 15 minutos

  // No mostrar botón si el evento ya comenzó
  if (eventHasStarted) {
    return null;
  }

  // No mostrar si no hay usuario
  if (!userId) {
    return null;
  }

  return (
    <Button
      onClick={handleToggleReminder}
      disabled={disabled || loading || isEventSoon}
      variant={reminderEnabled ? "default" : "outline"}
      size="sm"
      className={`transition-all duration-200 ${
        reminderEnabled
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
      }`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      ) : reminderEnabled ? (
        <Bell className="h-4 w-4 mr-2" />
      ) : (
        <BellOff className="h-4 w-4 mr-2" />
      )}

      {loading
        ? "Guardando..."
        : reminderEnabled
          ? "Recordatorio activo"
          : "Activar recordatorio"}

      {!loading && !reminderEnabled && isEventSoon && (
        <Clock className="h-3 w-3 ml-1 text-orange-500" />
      )}
    </Button>
  );
}

// Hook para gestionar recordatorios globalmente
export function useEventReminders() {
  const [reminders, setReminders] = useState<EventReminder[]>([]);

  useEffect(() => {
    // Cargar recordatorios almacenados
    const stored = getStoredReminders();
    setReminders(stored);

    // Programar recordatorios existentes
    stored.forEach((reminder: EventReminder) => {
      const timeUntilReminder = reminder.reminderTime - Date.now();
      if (timeUntilReminder > 0) {
        scheduleReminderNotification(reminder, timeUntilReminder);
      }
    });
  }, []);

  const getStoredReminders = (): EventReminder[] => {
    try {
      const stored = localStorage.getItem("eventReminders");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const scheduleReminderNotification = (
    reminder: EventReminder,
    timeUntil: number,
  ) => {
    setTimeout(() => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`¡Recordatorio de evento!`, {
          body: `${reminder.eventTitle} comenzará en 15 minutos`,
          icon: "/images/notification-icon.png",
          tag: `event-reminder-${reminder.eventId}`,
          requireInteraction: true,
        });
      }
    }, timeUntil);
  };

  const clearExpiredReminders = () => {
    const stored = getStoredReminders();
    const now = Date.now();
    const validReminders = stored.filter(
      (reminder: EventReminder) => reminder.eventStartTime > now,
    );

    try {
      localStorage.setItem("eventReminders", JSON.stringify(validReminders));
      setReminders(validReminders);
    } catch (error) {
      console.error("Error clearing expired reminders:", error);
    }
  };

  return {
    reminders,
    clearExpiredReminders,
  };
}
