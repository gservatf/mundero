// FASE 6.3 — usePaymentStatus Hook
import { useState, useEffect } from "react";
import { getPaymentStatus, PaymentStatus } from "./paymentMockService";

export function usePaymentStatus(userId: string) {
  const [status, setStatus] = useState<PaymentStatus>({
    currentPlan: "free",
    expiresAt: null,
    isActive: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const paymentStatus = await getPaymentStatus(userId);
        setStatus(paymentStatus);
      } catch (err) {
        console.error("Error fetching payment status:", err);
        setError("Error al cargar el estado de la suscripción");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [userId]);

  return {
    status,
    loading,
    error,
    refresh: () => {
      if (userId) {
        setLoading(true);
        getPaymentStatus(userId)
          .then(setStatus)
          .finally(() => setLoading(false));
      }
    },
  };
}
