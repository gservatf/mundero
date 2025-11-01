// FASE 6.3 — UpgradePlanModal Component
import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Check, AlertCircle, Crown, Star, Loader2, X } from "lucide-react";
import {
  PAYMENT_ENABLED,
  getPlanById,
  formatPrice,
  canUpgradeTo,
} from "./paymentConfig";
import { simulateUpgrade, logPaymentAnalytics } from "./paymentMockService";
import { usePaymentStatus } from "./usePaymentStatus";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  targetPlanId?: string;
}

export function UpgradePlanModal({
  isOpen,
  onClose,
  userId,
  targetPlanId,
}: UpgradePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(targetPlanId || "pro");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = usePaymentStatus(userId);

  const plan = getPlanById(selectedPlan);
  const canUpgradeToSelected = canUpgradeTo(status.currentPlan, selectedPlan);

  const handleUpgrade = async () => {
    if (!plan || !canUpgradeToSelected) return;

    setIsUpgrading(true);
    setError(null);

    try {
      logPaymentAnalytics("upgrade_attempt", {
        userId,
        fromPlan: status.currentPlan,
        toPlan: selectedPlan,
        planPrice: plan.price,
      });

      const result = await simulateUpgrade(userId, selectedPlan);

      if (result.success) {
        logPaymentAnalytics("upgrade_success", {
          userId,
          planId: selectedPlan,
          mock: result.paymentMock,
        });
        onClose();
      } else {
        setError(result.error || "Error en el procesamiento del pago");
        logPaymentAnalytics("upgrade_failed", {
          userId,
          planId: selectedPlan,
          error: result.error,
        });
      }
    } catch (err) {
      console.error("Error during upgrade:", err);
      setError("Error inesperado durante el procesamiento");
      logPaymentAnalytics("upgrade_error", {
        userId,
        planId: selectedPlan,
        error: "unexpected_error",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!isOpen) return null;

  if (!PAYMENT_ENABLED) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Membresías Premium</h2>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              Funciones premium próximamente disponibles
            </p>
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-blue-900">
                  ¡Las membresías estarán disponibles próximamente!
                </h4>
                <p className="text-sm text-blue-700">
                  Estamos trabajando en traerte planes premium.
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={onClose}>Entendido</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Actualizar Plan</h2>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600 mb-6">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["pro", "elite"].map((planId) => {
                const planOption = getPlanById(planId);
                if (!planOption) return null;
                const isSelected = selectedPlan === planId;
                const canUpgrade = canUpgradeTo(status.currentPlan, planId);
                return (
                  <Card
                    key={planId}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:shadow-md"
                    } ${!canUpgrade ? "opacity-50" : ""}`}
                    onClick={() => canUpgrade && setSelectedPlan(planId)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {planOption.name}
                        </CardTitle>
                        {planOption.popular && (
                          <Badge className="bg-blue-600 text-white">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(planOption.price, planOption.currency)}
                        <span className="text-sm font-normal text-gray-500">
                          /{planOption.interval === "month" ? "mes" : "año"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {planOption.features
                          .slice(0, 4)
                          .map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {feature}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {plan && canUpgradeToSelected && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Resumen del Plan
                </h4>
                <div className="flex justify-between items-center">
                  <span>Plan {plan.name}</span>
                  <span className="font-semibold">
                    {formatPrice(plan.price, plan.currency)}/
                    {plan.interval === "month" ? "mes" : "año"}
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isUpgrading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpgrade}
                disabled={!canUpgradeToSelected || isUpgrading}
                className="min-w-[120px]"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  "Actualizar Plan"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
