// FASE 6.3 — SubscriptionPreview Component
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Check, Star, Crown } from 'lucide-react';
import { PAYMENT_ENABLED, AVAILABLE_PLANS, formatPrice } from './paymentConfig';
import { usePaymentStatus } from './usePaymentStatus';

interface SubscriptionPreviewProps {
    userId: string;
    onUpgradeClick: (planId: string) => void;
}

const PlanIcons = {
    free: null,
    pro: Star,
    elite: Crown
};

export function SubscriptionPreview({ userId, onUpgradeClick }: SubscriptionPreviewProps) {
    const { status, loading } = usePaymentStatus(userId);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Planes de Membresía</h3>
                <p className="text-gray-600">
                    {PAYMENT_ENABLED
                        ? 'Elige el plan que mejor se adapte a tus necesidades'
                        : 'Las membresías premium estarán disponibles próximamente'
                    }
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AVAILABLE_PLANS.map((plan) => {
                    const Icon = PlanIcons[plan.id as keyof typeof PlanIcons];
                    const isCurrentPlan = status.currentPlan === plan.id;
                    const canUpgrade = status.currentPlan !== plan.id && plan.id !== 'free';

                    return (
                        <Card
                            key={plan.id}
                            className={`relative transition-all duration-200 hover:shadow-lg ${plan.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                                } ${isCurrentPlan ? 'bg-blue-50 border-blue-200' : ''}`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-blue-600 text-white px-3 py-1">
                                        {plan.badge}
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="text-center pb-4">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    {Icon && <Icon className="h-6 w-6 text-blue-600" />}
                                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {formatPrice(plan.price, plan.currency)}
                                    </div>
                                    {plan.price > 0 && (
                                        <div className="text-sm text-gray-500">por {plan.interval === 'month' ? 'mes' : 'año'}</div>
                                    )}
                                </div>

                                {isCurrentPlan && (
                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                        Plan Actual
                                    </Badge>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start space-x-3">
                                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-4">
                                    {isCurrentPlan ? (
                                        <Button disabled className="w-full" variant="outline">
                                            Plan Actual
                                        </Button>
                                    ) : plan.id === 'free' ? (
                                        <Button
                                            disabled
                                            className="w-full"
                                            variant="outline"
                                        >
                                            Plan Gratuito
                                        </Button>
                                    ) : PAYMENT_ENABLED ? (
                                        <Button
                                            onClick={() => onUpgradeClick(plan.id)}
                                            className="w-full"
                                            variant={plan.popular ? "default" : "outline"}
                                        >
                                            {canUpgrade ? 'Actualizar Plan' : 'Cambiar a este Plan'}
                                        </Button>
                                    ) : (
                                        <Button disabled className="w-full" variant="outline">
                                            Próximamente
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {!PAYMENT_ENABLED && (
                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-blue-900">¡Próximamente!</h4>
                        <p className="text-sm text-blue-700">
                            Estamos trabajando en traerte planes premium con funciones avanzadas.
                            Mientras tanto, disfruta de todas las funciones gratuitas.
                        </p>
                    </div>
                </div>
            )}

            {PAYMENT_ENABLED && status.currentPlan !== 'free' && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        ¿Necesitas ayuda? Contáctanos en{' '}
                        <a href="mailto:support@mundero.net" className="text-blue-600 hover:underline">
                            support@mundero.net
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
}