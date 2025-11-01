import { useEffect } from "react";
import { onSnapshot, Query } from "firebase/firestore";
import { useAuth } from "./useAuth";

export function useRealtimeGuard<T>(
  queryRef: Query<T> | null,
  onData: (data: any[]) => void,
  onError?: (err: any) => void,
  deps: any[] = [],
) {
  const { user, firebaseUser } = useAuth();

  useEffect(() => {
    const uid = firebaseUser?.uid || user?.id;
    if (!uid || !queryRef) {
      console.warn(
        "[useRealtimeGuard] UID o query aún no disponibles. Omitiendo listener.",
      );
      return;
    }

    try {
      const unsubscribe = onSnapshot(
        queryRef,
        (snap) => {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          onData(data);
        },
        (error) => {
          console.error("[useRealtimeGuard] Error Firestore:", error.message);
          if (onError) onError(error);
        },
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("[useRealtimeGuard] Error inicializando listener:", err);
    }
  }, [firebaseUser?.uid, user?.id, queryRef, ...deps]);
}
