import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  SkipForward,
  Save,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { useQuizStore } from "../state/useQuizStore";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { StreakBar } from "./StreakBar";
import { getQuestionById } from "../services/cepsService";
import { saveSession, updateSessionProgress } from "../engine/session";
import { registerFunnelEvent } from "../services/funnelService";

export const QuizPlay: React.FC = () => {
  const navigate = useNavigate();
  const {
    answers,
    order,
    currentQuestionIndex,
    streak,
    userId,
    answer,
    nextQuestion,
    prevQuestion,
    setStreak,
    markComplete,
    isLoading,
    setLoading,
  } = useQuizStore();

  const [isAnimating, setIsAnimating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  const currentQuestionId = order[currentQuestionIndex];
  const currentQuestion = currentQuestionId
    ? getQuestionById(currentQuestionId)
    : null;
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const progress = Object.keys(answers).length;
  const isComplete = progress === 55;
  const canProceed = currentAnswer !== undefined;

  // Auto-save progress
  useEffect(() => {
    const autoSave = async () => {
      if (userId && Object.keys(answers).length > 0) {
        try {
          await updateSessionProgress(userId, answers);
          setLastSaved(new Date());
          setShowSaveIndicator(true);
          setTimeout(() => setShowSaveIndicator(false), 2000);
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    };

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [answers, userId]);

  // Register funnel events
  useEffect(() => {
    if (userId) {
      registerFunnelEvent(userId, "solution", "interest", {
        solution: "ceps",
        progress: (progress / 55) * 100,
        currentQuestion: currentQuestionIndex + 1,
      });
    }
  }, [userId, currentQuestionIndex, progress]);

  const handleAnswer = async (value: number) => {
    if (!currentQuestion || isAnimating) return;

    setIsAnimating(true);

    // Update answer
    answer(currentQuestion.id, value);

    // Calculate streak
    const newProgress = Object.keys(answers).length + 1;
    if (newProgress % 5 === 0) {
      setStreak(streak + 1);
    }

    // Auto-advance after a brief delay
    setTimeout(() => {
      if (currentQuestionIndex < order.length - 1) {
        nextQuestion();
      } else {
        // Quiz completed
        handleQuizComplete();
      }
      setIsAnimating(false);
    }, 800);
  };

  const handleQuizComplete = async () => {
    setLoading(true);

    try {
      markComplete();

      // Register completion event
      if (userId) {
        await registerFunnelEvent(userId, "solution", "action", {
          solution: "ceps",
          completed: true,
          totalAnswers: Object.keys(answers).length,
          timeSpent:
            Date.now() - (useQuizStore.getState().startedAt || Date.now()),
        });
      }

      // Save final session
      if (userId) {
        await saveSession(userId, {
          userId,
          mode: useQuizStore.getState().mode,
          answers,
          order,
          startedAt: useQuizStore.getState().startedAt || Date.now(),
          progress: 100,
        });
      }

      navigate("/solutions/ceps/result");
    } catch (error) {
      console.error("Error completing quiz:", error);
      alert("Error al completar el quiz. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      await updateSessionProgress(userId, answers);
      setLastSaved(new Date());
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 3000);
    } catch (error) {
      console.error("Manual save failed:", error);
      alert("Error al guardar progreso");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < order.length - 1) {
      nextQuestion();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg text-gray-600">Cargando pregunta...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => navigate("/solutions/ceps/start")}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>

            <div className="flex items-center gap-4">
              {/* Save Indicator */}
              <AnimatePresence>
                {showSaveIndicator && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 text-sm text-green-600"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Progreso guardado</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-4">
            <ProgressBar
              current={progress}
              total={55}
              showPercentage={true}
              showNumbers={true}
            />

            <StreakBar
              streak={streak}
              maxStreak={10}
              showAnimation={!isAnimating}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              answer={currentAnswer}
              onAnswer={handleAnswer}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={55}
              isAnimating={isAnimating}
            />
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0 || isAnimating}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {/* Skip Button (only if no answer) */}
            {!currentAnswer && currentQuestionIndex < order.length - 1 && (
              <Button
                variant="outline"
                onClick={handleSkipQuestion}
                disabled={isAnimating}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Saltar
              </Button>
            )}

            {/* Next/Complete Button */}
            {currentQuestionIndex < order.length - 1 ? (
              <Button
                onClick={nextQuestion}
                disabled={!canProceed || isAnimating}
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleQuizComplete}
                disabled={!canProceed || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Procesando..." : "Completar Evaluación"}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{progress}</div>
            <div className="text-sm text-gray-600">Preguntas respondidas</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{streak}</div>
            <div className="text-sm text-gray-600">Racha actual</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((progress / 55) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Progreso total</div>
          </Card>
        </div>

        {/* Last Saved */}
        {lastSaved && (
          <div className="mt-4 text-center text-xs text-gray-500">
            Último guardado: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};
