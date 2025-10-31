// FASE 6.3 — Payment Mock Service (Simulación sin pagos reales)
import { PAYMENT_ENABLED, getPlanById } from './paymentConfig';

export interface PaymentStatus {
    currentPlan: string;
    expiresAt: Date | null;
    isActive: boolean;
    paymentMethod?: string;
}

export interface UpgradeResult {
    success: boolean;
    planId: string;
    paymentMock: boolean;
    error?: string;
}

// Simular upgrade de plan
export async function simulateUpgrade(userId: string, planId: string): Promise<UpgradeResult> {
    try {
        console.log(`Simulando upgrade de usuario ${userId} a plan ${planId}`);

        if (!PAYMENT_ENABLED) {
            console.log('Sistema de pagos deshabilitado - solo simulación');
            return {
                success: true,
                planId,
                paymentMock: true
            };
        }

        // Aquí iría la lógica real de pago cuando se active
        const plan = getPlanById(planId);
        if (!plan) {
            return {
                success: false,
                planId,
                paymentMock: true,
                error: 'Plan no encontrado'
            };
        }

        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular éxito
        return {
            success: true,
            planId,
            paymentMock: true
        };

    } catch (error) {
        console.error('Error en simulateUpgrade:', error);
        return {
            success: false,
            planId,
            paymentMock: true,
            error: 'Error en el procesamiento'
        };
    }
}

// Obtener estado de pago actual
export async function getPaymentStatus(userId: string): Promise<PaymentStatus> {
    try {
        // Simular carga desde base de datos
        await new Promise(resolve => setTimeout(resolve, 500));

        // Por ahora todos los usuarios son 'free'
        return {
            currentPlan: 'free',
            expiresAt: null,
            isActive: true
        };

    } catch (error) {
        console.error('Error getting payment status:', error);
        return {
            currentPlan: 'free',
            expiresAt: null,
            isActive: false
        };
    }
}

// Simular cancelación de suscripción
export async function simulateCancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        console.log(`Simulando cancelación de suscripción para ${userId}`);

        if (!PAYMENT_ENABLED) {
            return { success: true };
        }

        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return { success: true };

    } catch (error) {
        console.error('Error canceling subscription:', error);
        return { success: false, error: 'Error en la cancelación' };
    }
}

// Simular historial de pagos
export async function getPaymentHistory(userId: string): Promise<any[]> {
    try {
        // Simular historial vacío para todos los usuarios
        await new Promise(resolve => setTimeout(resolve, 300));

        return [];

    } catch (error) {
        console.error('Error getting payment history:', error);
        return [];
    }
}

// Simular generación de factura
export async function generateInvoice(userId: string, paymentId: string): Promise<{ url: string } | null> {
    try {
        if (!PAYMENT_ENABLED) {
            return null;
        }

        // Simular generación
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            url: `https://example.com/invoices/${paymentId}.pdf`
        };

    } catch (error) {
        console.error('Error generating invoice:', error);
        return null;
    }
}

// Hook para analytics de pagos simulados
export function logPaymentAnalytics(event: string, data: any): void {
    try {
        // Integración con analytics service
        console.log('Payment Analytics:', event, data);

        // TODO: integrar con analyticsService cuando esté disponible
        // analyticsService.logEvent(`payment_${event}`, { ...data, mock: true });

    } catch (error) {
        console.error('Error logging payment analytics:', error);
    }
}