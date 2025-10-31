// Componente para mostrar un paso individual del onboarding
// Incluye progreso visual, iconos y acciones

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import {
    CheckCircle,
    Circle,
    ArrowRight,
    SkipForward,
    Trophy,
    Zap,
    Clock,
    Target
} from 'lucide-react';
import { OnboardingStep } from './types';

interface QuestStepCardProps {
    step: OnboardingStep;
    isActive: boolean;
    isCompleted: boolean;
    isLocked: boolean;
    onComplete?: () => void;
    onSkip?: () => void;
    showSkipOption?: boolean;
    className?: string;
}

export const QuestStepCard: React.FC<QuestStepCardProps> = ({
    step,
    isActive,
    isCompleted,
    isLocked,
    onComplete,
    onSkip,
    showSkipOption = true,
    className = ''
}) => {
    const progressPercentage = step.targetValue ?
        Math.min((step.currentValue || 0) / step.targetValue * 100, 100) :
        (step.done ? 100 : 0);

    const getStepIcon = () => {
        if (isCompleted) {
            return <CheckCircle className="h-6 w-6 text-green-500" />;
        }

        if (isLocked) {
            return <Circle className="h-6 w-6 text-gray-300" />;
        }

        return <Circle className="h-6 w-6 text-blue-500" />;
    };

    const getCardVariants = () => {
        if (isCompleted) {
            return {
                scale: 1,
                opacity: 1,
                backgroundColor: 'rgb(240, 253, 244)', // green-50
                borderColor: 'rgb(34, 197, 94)' // green-500
            };
        }

        if (isActive) {
            return {
                scale: 1.02,
                opacity: 1,
                backgroundColor: 'rgb(239, 246, 255)', // blue-50
                borderColor: 'rgb(59, 130, 246)' // blue-500
            };
        }

        if (isLocked) {
            return {
                scale: 0.98,
                opacity: 0.6,
                backgroundColor: 'rgb(249, 250, 251)', // gray-50
                borderColor: 'rgb(209, 213, 219)' // gray-300
            };
        }

        return {
            scale: 1,
            opacity: 1,
            backgroundColor: 'rgb(255, 255, 255)',
            borderColor: 'rgb(229, 231, 235)' // gray-200
        };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                y: 0,
                ...getCardVariants()
            }}
            transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30
            }}
            className={className}
        >
            <Card className={`
                relative overflow-hidden border-2 transition-all duration-300
                ${isActive ? 'border-blue-500 shadow-lg' : ''}
                ${isCompleted ? 'border-green-500 shadow-md' : ''}
                ${isLocked ? 'border-gray-300' : ''}
            `}>
                {/* Glow effect para paso activo */}
                {isActive && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}

                <div className="relative p-6">
                    {/* Header con icono y estado */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {getStepIcon()}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">{step.icon}</span>
                                <div>
                                    <Badge
                                        variant={isCompleted ? "default" : isActive ? "secondary" : "outline"}
                                        className="text-xs"
                                    >
                                        Paso {step.id}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Puntos y badge */}
                        <div className="flex flex-col items-end space-y-1">
                            <div className="flex items-center space-x-1 text-sm text-amber-600">
                                <Trophy className="h-4 w-4" />
                                <span>{step.points} pts</span>
                            </div>
                            {step.badge && (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                    🏅 {step.badge}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Título y descripción */}
                    <div className="mb-4">
                        <h3 className={`text-lg font-semibold mb-2 ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                            {step.title}
                        </h3>
                        <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                            {step.description}
                        </p>
                    </div>

                    {/* Barra de progreso */}
                    {step.targetValue && step.targetValue > 1 && (
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">
                                    Progreso: {step.currentValue || 0} / {step.targetValue}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {Math.round(progressPercentage)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${isCompleted
                                        ? 'bg-green-500'
                                        : isActive
                                            ? 'bg-blue-500'
                                            : 'bg-gray-400'
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Información adicional */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>{step.actionType?.replace(/_/g, ' ') || ''}</span>
                            </div>
                            {step.targetValue && (
                                <div className="flex items-center space-x-1">
                                    <Zap className="h-3 w-3" />
                                    <span>Meta: {step.targetValue}</span>
                                </div>
                            )}
                        </div>

                        {isActive && (
                            <div className="flex items-center space-x-1 text-blue-600">
                                <Clock className="h-3 w-3" />
                                <span>En progreso</span>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    {!isLocked && !isCompleted && (
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                                {isActive && onComplete && (
                                    <Button
                                        onClick={onComplete}
                                        size="sm"
                                        className="px-4"
                                        disabled={step.targetValue ? (step.currentValue || 0) < step.targetValue : false}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Completar
                                    </Button>
                                )}

                                {isActive && showSkipOption && onSkip && (
                                    <Button
                                        onClick={onSkip}
                                        variant="outline"
                                        size="sm"
                                        className="px-4 text-gray-600"
                                    >
                                        <SkipForward className="h-4 w-4 mr-2" />
                                        Saltar
                                    </Button>
                                )}
                            </div>

                            {!isActive && (
                                <div className="flex items-center text-sm text-gray-500">
                                    <span>Completa el paso anterior</span>
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Estado completado */}
                    {isCompleted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center py-2"
                        >
                            <div className="flex items-center space-x-2 text-green-600 font-medium">
                                <CheckCircle className="h-5 w-5" />
                                <span>¡Completado!</span>
                                {step.currentValue === 0 && (
                                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                        Saltado
                                    </Badge>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Efecto de celebración para completado */}
                {isCompleted && (
                    <motion.div
                        className="absolute top-0 right-0 p-2"
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <div className="text-2xl">🎉</div>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
};