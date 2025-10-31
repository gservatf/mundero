// Componente para mostrar el progreso de onboarding en el perfil del usuario
// Incluye medalla de progreso, estadísticas y logros desbloqueados

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { useOnboardingProgress } from './useOnboardingProgress';
import { OnboardingProgress } from './types';
import {
    Award,
    Trophy,
    Star,
    CheckCircle,
    Clock,
    Target,
    Zap,
    Calendar,
    TrendingUp,
    Medal,
    Crown,
    Sparkles,
    ArrowRight,
    Play
} from 'lucide-react';

interface OnboardingProfileSectionProps {
    className?: string;
    onStartOnboarding?: () => void;
}

export const OnboardingProfileSection: React.FC<OnboardingProfileSectionProps> = ({
    className = '',
    onStartOnboarding
}) => {
    const { progress, loading, needsOnboarding } = useOnboardingProgress();

    // Si no hay progreso y no está cargando, no mostrar nada
    if (!loading && !progress && !needsOnboarding) {
        return null;
    }

    // Si necesita onboarding pero no ha empezado
    if (needsOnboarding && !progress) {
        return (
            <div className={`space-y-4 ${className}`}>
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            ¡Comienza tu aventura en Mundero!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Completa tu onboarding para desbloquear todas las funcionalidades y obtener recompensas exclusivas.
                        </p>
                        <Button
                            onClick={onStartOnboarding}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            <Star className="h-4 w-4 mr-2" />
                            Iniciar Onboarding
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <Card className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-16 bg-gray-200 rounded"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (!progress) return null;

    const getMedalIcon = () => {
        const completionPercentage = progress.completionPercentage || progress.progress || 0;
        if (completionPercentage === 100) {
            return <Crown className="h-8 w-8 text-yellow-500" />;
        } else if (completionPercentage >= 75) {
            return <Trophy className="h-8 w-8 text-yellow-500" />;
        } else if (completionPercentage >= 50) {
            return <Medal className="h-8 w-8 text-gray-400" />;
        } else {
            return <Target className="h-8 w-8 text-gray-300" />;
        }
    };

    const getMedalColor = () => {
        const completionPercentage = progress.completionPercentage || progress.progress || 0;
        if (completionPercentage === 100) {
            return 'from-yellow-400 to-yellow-600';
        } else if (completionPercentage >= 75) {
            return 'from-yellow-300 to-yellow-500';
        } else if (completionPercentage >= 50) {
            return 'from-gray-300 to-gray-500';
        } else {
            return 'from-gray-200 to-gray-400';
        }
    };

    const getStatusText = () => {
        const completionPercentage = progress.completionPercentage || progress.progress || 0;
        if (completionPercentage === 100) {
            return 'Maestro de Mundero';
        } else if (completionPercentage >= 75) {
            return 'Explorador Avanzado';
        } else if (completionPercentage >= 50) {
            return 'Aventurero';
        } else {
            return 'Novato';
        }
    };

    const completedSteps = progress.steps?.filter(step => step.isCompleted || step.done).length || 0;
    const totalSteps = progress.steps?.length || 0;
    const startedAt = typeof progress.startedAt === 'number' ? new Date(progress.startedAt) : progress.startedAt;
    const daysActive = startedAt ?
        Math.ceil((new Date().getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const completionPercentage = progress.completionPercentage || progress.progress || 0;
    const totalPointsEarned = progress.totalPointsEarned || progress.totalPoints || 0; return (
        <div className={`space-y-4 ${className}`}>
            {/* Medalla de Progreso Principal */}
            <Card className="overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-center space-x-4">
                        {/* Medalla */}
                        <div className="relative">
                            <div className={`w-20 h-20 bg-gradient-to-br ${getMedalColor()} rounded-full flex items-center justify-center shadow-lg`}>
                                {getMedalIcon()}
                            </div>
                            {completionPercentage === 100 && (
                                <motion.div
                                    className="absolute -top-1 -right-1"
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Sparkles className="h-6 w-6 text-yellow-400" />
                                </motion.div>
                            )}
                        </div>

                        {/* Información */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {getStatusText()}
                                </h3>
                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                    Onboarding
                                </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                {completionPercentage === 100
                                    ? '¡Has completado tu onboarding! Eres oficialmente un experto en Mundero.'
                                    : `${completedSteps} de ${totalSteps} pasos completados. ¡Sigue así!`
                                }
                            </p>                            {/* Barra de Progreso */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <motion.div
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full relative overflow-hidden"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionPercentage}%` }}
                                    transition={{ duration: 1, ease: "easeInOut" }}
                                >
                                    {completionPercentage > 20 && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                    )}
                                </motion.div>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-500">
                                    {Math.round(completionPercentage)}% completado
                                </span>
                                <span className="text-xs text-gray-500">
                                    {totalPointsEarned} puntos ganados
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Estadísticas Detalladas */}
            <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    Estadísticas de Onboarding
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Pasos Completados */}
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {completedSteps}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Pasos completados
                        </div>
                    </div>

                    {/* Puntos Ganados */}
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {totalPointsEarned}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Puntos ganados
                        </div>
                    </div>

                    {/* Tiempo Activo */}
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {daysActive}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Días en Mundero
                        </div>
                    </div>
                </div>
            </Card>

            {/* Próximos Pasos */}
            {completionPercentage < 100 && (
                <Card className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-orange-600" />
                        Próximo Paso
                    </h4>

                    {progress.steps && (progress.currentStepIndex || 0) < progress.steps.length && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                        {(progress.currentStepIndex || 0) + 1}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                                        {progress.steps[progress.currentStepIndex || 0]?.title}
                                    </h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {progress.steps[progress.currentStepIndex || 0]?.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs">
                                            {progress.steps[progress.currentStepIndex || 0]?.points} puntos
                                        </Badge>
                                        <Button
                                            size="sm"
                                            onClick={onStartOnboarding}
                                            className="bg-orange-600 hover:bg-orange-700 text-white"
                                        >
                                            Continuar
                                            <ArrowRight className="h-3 w-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}            {/* Mensaje de Finalización */}
            {completionPercentage === 100 && (
                <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            ¡Felicidades, Maestro de Mundero!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Has completado exitosamente tu onboarding. Ahora dominas todas las herramientas para hacer networking profesional efectivo.
                        </p>
                        {progress.completedAt && (
                            <div className="flex items-center justify-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                Completado el {
                                    typeof progress.completedAt === 'number'
                                        ? new Date(progress.completedAt).toLocaleDateString()
                                        : progress.completedAt.toLocaleDateString()
                                }
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};