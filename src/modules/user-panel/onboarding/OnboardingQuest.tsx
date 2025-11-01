// Componente principal del sistema de onboarding gamificado
// Gestiona el flujo completo de misiones y progreso

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  Sparkles,
  Trophy,
  Target,
  ChevronRight,
  CheckCircle,
  Clock,
  Gift,
  Star,
  X,
  Minimize2,
} from "lucide-react";
import { QuestStepCard } from "./QuestStepCard";
import { useOnboardingProgress } from "./useOnboardingProgress";
import { WelcomeRewardModal } from "./WelcomeRewardModal";

interface OnboardingQuestProps {
  onClose?: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
  showHeader?: boolean;
  className?: string;
}

export const OnboardingQuest: React.FC<OnboardingQuestProps> = ({
  onClose,
  isMinimized = false,
  onMinimize,
  showHeader = true,
  className = "",
}) => {
  const {
    progress,
    loading,
    error,
    needsOnboarding,
    currentStep,
    completionPercentage,
    initializeOnboarding,
    completeStep,
    skipStep,
  } = useOnboardingProgress();

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // Detectar cuando se completa el onboarding
  useEffect(() => {
    if (progress?.isCompleted && !justCompleted) {
      setJustCompleted(true);
      setShowRewardModal(true);
    }
  }, [progress?.isCompleted, justCompleted]);

  // Inicializar onboarding si es necesario
  useEffect(() => {
    if (needsOnboarding && !progress && !loading) {
      initializeOnboarding();
    }
  }, [needsOnboarding, progress, loading, initializeOnboarding]);

  const handleCompleteStep = async (stepId: string | number) => {
    const success = await completeStep(stepId);
    if (success) {
      // Animación de éxito se maneja automáticamente por el estado
    }
  };

  const handleSkipStep = async (stepId: string | number) => {
    const success = await skipStep(stepId);
    if (success) {
      // El progreso se actualiza automáticamente
    }
  };

  const getProgressColor = () => {
    if (completionPercentage === 100) return "bg-green-500";
    if (completionPercentage >= 66) return "bg-blue-500";
    if (completionPercentage >= 33) return "bg-yellow-500";
    return "bg-purple-500";
  };

  const getMotivationalMessage = () => {
    if (completionPercentage === 100) {
      return "¡Felicidades! Has completado tu aventura inicial 🎉";
    }
    if (completionPercentage >= 75) {
      return "¡Ya casi terminas! Solo un paso más 💪";
    }
    if (completionPercentage >= 50) {
      return "¡Vas muy bien! Estás a mitad del camino 🚀";
    }
    if (completionPercentage >= 25) {
      return "¡Excelente progreso! Sigue así 🌟";
    }
    return "¡Comencemos tu aventura en Mundero! ✨";
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Cargando tu progreso...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 border-red-200 bg-red-50 ${className}`}>
        <div className="flex items-center space-x-3 text-red-700">
          <X className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (!needsOnboarding || progress?.isCompleted) {
    return (
      <>
        {/* Vista completada */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={className}
        >
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <Trophy className="h-8 w-8 text-green-600" />
                </div>
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¡Onboarding Completado!
              </h3>
              <p className="text-gray-600 mb-4">
                Has completado exitosamente tu aventura inicial en Mundero
              </p>

              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{progress?.totalPoints || 0} puntos ganados</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift className="h-4 w-4 text-purple-500" />
                  <span>
                    {progress?.badgesEarned?.length || 0} badges obtenidos
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowRewardModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Ver Recompensas
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Modal de recompensas */}
        <WelcomeRewardModal
          isOpen={showRewardModal}
          onClose={() => setShowRewardModal(false)}
          progress={progress}
        />
      </>
    );
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className={`fixed bottom-6 right-6 z-50 ${className}`}
      >
        <Card
          className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg cursor-pointer"
          onClick={onMinimize}
        >
          <div className="flex items-center space-x-3">
            <Target className="h-5 w-5" />
            <div>
              <div className="text-sm font-medium">Misiones</div>
              <div className="text-xs opacity-90">
                {Math.round(completionPercentage)}% completado
              </div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Card className="overflow-hidden">
          {/* Header */}
          {showHeader && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      Tu Aventura en Mundero
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Completa las misiones para desbloquear todo el potencial
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {onMinimize && (
                    <Button
                      onClick={onMinimize}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onClose && (
                    <Button
                      onClick={onClose}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Barra de progreso global */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-100">
                    Progreso General
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full ${getProgressColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Mensaje motivacional */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 text-center"
              >
                <p className="text-blue-100 text-sm font-medium">
                  {getMotivationalMessage()}
                </p>
              </motion.div>
            </div>
          )}

          {/* Estadísticas rápidas */}
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {progress?.steps.filter((s) => s.done).length || 0}
                </div>
                <div className="text-xs text-gray-600">Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-600">
                  {progress?.totalPoints || 0}
                </div>
                <div className="text-xs text-gray-600">Puntos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {progress?.badgesEarned?.length || 0}
                </div>
                <div className="text-xs text-gray-600">Badges</div>
              </div>
            </div>
          </div>

          {/* Lista de pasos */}
          <div className="p-6 space-y-4">
            <AnimatePresence>
              {progress?.steps.map((step, index) => {
                const isActive = step.id === progress.currentStepId;
                const isCompleted = step.done;
                const isLocked =
                  !isCompleted && step.id !== progress.currentStepId;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <QuestStepCard
                      step={step}
                      isActive={isActive}
                      isCompleted={isCompleted || false}
                      isLocked={isLocked}
                      onComplete={() => handleCompleteStep(step.id)}
                      onSkip={() => handleSkipStep(step.id)}
                      showSkipOption={true}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Footer con próximo paso */}
          {currentStep && !progress?.isCompleted && (
            <div className="p-6 bg-blue-50 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Próximo paso:
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentStep.title}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleCompleteStep(currentStep.id)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continuar
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modal de recompensas */}
      <WelcomeRewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        progress={progress}
      />
    </>
  );
};
