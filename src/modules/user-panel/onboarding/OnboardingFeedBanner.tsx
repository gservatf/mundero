// Banner de onboarding para el feed
// Muestra tips y progreso cuando el usuario no ha completado onboarding

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  Rocket,
  Target,
  CheckCircle,
  ChevronRight,
  X,
  Lightbulb,
  Zap,
  Sparkles,
  Play,
} from "lucide-react";
import { OnboardingProgress } from "./types";
import { useOnboardingProgress } from "./useOnboardingProgress";

interface OnboardingFeedBannerProps {
  onOpenOnboarding?: () => void;
  className?: string;
}

export const OnboardingFeedBanner: React.FC<OnboardingFeedBannerProps> = ({
  onOpenOnboarding,
  className = "",
}) => {
  const { progress, needsOnboarding, currentStep, completionPercentage } =
    useOnboardingProgress();
  const [isDismissed, setIsDismissed] = useState(false);

  // No mostrar si no necesita onboarding o está completado
  if (!needsOnboarding || !progress || isDismissed) {
    return null;
  }

  const getTipMessage = () => {
    if (completionPercentage >= 66) {
      return "¡Ya casi terminas tu aventura! 🏁 Completa los últimos pasos y desbloquea todas las funciones.";
    }
    if (completionPercentage >= 33) {
      return "¡Excelente progreso! 🚀 Sigue completando misiones para ganar más puntos y badges.";
    }
    return "🔥 Tip: Completa tu perfil y únete a una comunidad para ganar puntos extra y conectar con otros profesionales.";
  };

  const getProgressColor = () => {
    if (completionPercentage >= 75) return "from-green-500 to-emerald-500";
    if (completionPercentage >= 50) return "from-blue-500 to-cyan-500";
    if (completionPercentage >= 25) return "from-yellow-500 to-orange-500";
    return "from-purple-500 to-pink-500";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={className}
      >
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20">
          <div className="relative p-6">
            {/* Botón cerrar */}
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Efecto de brillo animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  >
                    <Rocket className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      ¡Continúa tu aventura!
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Tu progreso: {Math.round(completionPercentage)}%
                      completado
                    </p>
                  </div>
                </div>

                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                  <Zap className="h-3 w-3 mr-1" />
                  {progress.totalPoints} pts
                </Badge>
              </div>

              {/* Barra de progreso */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progreso de Onboarding
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {progress.steps.filter((s) => s.done).length} /{" "}
                    {progress.steps.length} pasos
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${getProgressColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Tip message */}
              <div className="flex items-start space-x-3 mb-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {getTipMessage()}
                </p>
              </div>

              {/* Próximo paso */}
              {currentStep && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Próximo paso:
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {currentStep.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
                    <Sparkles className="h-3 w-3" />
                    <span>+{currentStep.points} pts</span>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>
                      {progress.steps.filter((s) => s.done).length} completadas
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>
                      {progress.steps.length -
                        progress.steps.filter((s) => s.done).length}{" "}
                      pendientes
                    </span>
                  </div>
                </div>

                <Button
                  onClick={onOpenOnboarding}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Continuar
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

// Mini card para tareas pendientes
interface OnboardingTasksCardProps {
  onOpenOnboarding?: () => void;
  className?: string;
}

export const OnboardingTasksCard: React.FC<OnboardingTasksCardProps> = ({
  onOpenOnboarding,
  className = "",
}) => {
  const { progress, needsOnboarding, currentStep } = useOnboardingProgress();

  if (!needsOnboarding || !progress) {
    return null;
  }

  const pendingTasks = progress.steps.filter((s) => !s.done);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Tareas Pendientes
            </h4>
          </div>
          <Badge
            variant="outline"
            className="text-orange-700 border-orange-300 dark:text-orange-300 dark:border-orange-700"
          >
            {pendingTasks.length}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {pendingTasks.slice(0, 2).map((task) => (
            <div key={task.id} className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                {task.title}
              </span>
              <span className="text-xs text-orange-600 dark:text-orange-400">
                +{task.points}pts
              </span>
            </div>
          ))}
          {pendingTasks.length > 2 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
              +{pendingTasks.length - 2} más...
            </div>
          )}
        </div>

        <Button
          onClick={onOpenOnboarding}
          size="sm"
          variant="outline"
          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30"
        >
          Ver todas las misiones
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </Card>
    </motion.div>
  );
};
