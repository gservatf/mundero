// Modal de subida de nivel con animaciones 3D y efectos especiales
// Celebra el progreso del usuario con animaciones espectaculares

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAward,
  FiStar,
  FiTrendingUp,
  FiUnlock,
  FiX,
  FiShare2,
  FiDownload,
} from "react-icons/fi";
import { LevelUpEvent, Level, levelSystem } from "./levelSystem";

interface LevelUpModalProps {
  isOpen: boolean;
  levelUpEvent: LevelUpEvent | null;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  levelUpEvent,
  onClose,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "celebration" | "details" | "sharing"
  >("celebration");
  const [audioEnabled, setAudioEnabled] = useState(true);

  const newLevelInfo = levelUpEvent
    ? levelSystem.getLevelInfo(levelUpEvent.newLevel)
    : null;
  const oldLevelInfo = levelUpEvent
    ? levelSystem.getLevelInfo(levelUpEvent.oldLevel)
    : null;

  useEffect(() => {
    if (isOpen && levelUpEvent) {
      setShowConfetti(true);
      setCurrentStep("celebration");

      // Reproducir sonido de celebración (simulado)
      if (audioEnabled) {
        console.log("🎵 Playing level up sound effect");
      }

      // Ocultar confetti después de 3 segundos
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      // Auto-transición a detalles después de 4 segundos
      const detailsTimer = setTimeout(() => {
        setCurrentStep("details");
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(detailsTimer);
      };
    }
  }, [isOpen, levelUpEvent, audioEnabled]);

  const handleShare = () => {
    if (!newLevelInfo || !levelUpEvent) return;

    const shareText = `🎉 ¡Acabo de alcanzar el nivel ${levelUpEvent.newLevel} (${newLevelInfo.title}) en Mundero! ${newLevelInfo.icon}\n\n${levelUpEvent.totalPoints} puntos totales 💎`;

    if (navigator.share) {
      navigator.share({
        title: "Level Up en Mundero!",
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // Toast notification would go here
    }
  };

  const downloadCertificate = () => {
    // En un sistema real, esto generaría un certificado PDF
    console.log("📜 Generating level achievement certificate...");
  };

  if (!isOpen || !levelUpEvent || !newLevelInfo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    y: -100,
                    x: Math.random() * window.innerWidth,
                    rotate: 0,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    opacity: 0,
                    y: window.innerHeight + 100,
                    rotate: Math.random() * 360,
                    transition: {
                      duration: Math.random() * 3 + 2,
                      delay: Math.random() * 2,
                    },
                  }}
                  className={`absolute w-3 h-3 ${
                    [
                      "bg-yellow-400",
                      "bg-blue-400",
                      "bg-green-400",
                      "bg-purple-400",
                      "bg-pink-400",
                      "bg-red-400",
                    ][Math.floor(Math.random() * 6)]
                  } rounded-full`}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotateY: 180 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 200,
            duration: 0.8,
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>

          <AnimatePresence mode="wait">
            {/* Step 1: Celebration */}
            {currentStep === "celebration" && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-center text-white p-12"
              >
                {/* Level Icon with 3D Effect */}
                <motion.div
                  initial={{ scale: 0, rotateY: -180 }}
                  animate={{
                    scale: 1,
                    rotateY: 0,
                    rotateZ: [0, 10, -10, 0],
                  }}
                  transition={{
                    scale: { delay: 0.2, type: "spring", stiffness: 200 },
                    rotateY: { delay: 0.2, duration: 0.8 },
                    rotateZ: {
                      delay: 1,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    },
                  }}
                  className="text-8xl mb-6 drop-shadow-2xl"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))",
                    transform: "perspective(1000px) rotateX(15deg)",
                  }}
                >
                  {newLevelInfo.icon}
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-bold mb-4"
                >
                  ¡LEVEL UP!
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <div className="text-xl">
                    Nivel {levelUpEvent.oldLevel} →{" "}
                    <span className="font-bold text-yellow-300">
                      Nivel {levelUpEvent.newLevel}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{newLevelInfo.title}</div>
                  <div className="text-lg opacity-90">
                    {newLevelInfo.description}
                  </div>
                </motion.div>

                {/* Floating Points Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-8 flex items-center justify-center space-x-4"
                >
                  <div className="bg-white/20 backdrop-blur rounded-full px-6 py-3 flex items-center space-x-2">
                    <FiAward className="w-5 h-5" />
                    <span className="font-medium">
                      +{levelUpEvent.pointsEarned} puntos
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-full px-6 py-3 flex items-center space-x-2">
                    <FiStar className="w-5 h-5" />
                    <span className="font-medium">
                      {levelUpEvent.totalPoints} total
                    </span>
                  </div>
                </motion.div>

                {/* Progress to next level */}
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="mt-8"
                >
                  <div className="text-sm mb-2">
                    Progreso al siguiente nivel
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "15%" }} // Simulated progress
                      transition={{ delay: 2, duration: 0.8 }}
                      className="h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="p-8"
              >
                <div className="bg-white rounded-xl p-6 space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{newLevelInfo.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {newLevelInfo.title}
                    </h2>
                    <p className="text-gray-600">{newLevelInfo.description}</p>
                  </div>

                  {/* Benefits Unlocked */}
                  {newLevelInfo.benefits.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiUnlock className="w-5 h-5 mr-2 text-green-600" />
                        Beneficios Desbloqueados
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {newLevelInfo.benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm text-green-800">
                              {benefit}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Features Unlocked */}
                  {levelUpEvent.unlockedFeatures.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiStar className="w-5 h-5 mr-2 text-purple-600" />
                        Funciones Desbloqueadas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {levelUpEvent.unlockedFeatures.map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                            <span className="text-sm text-purple-800">
                              {feature}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Level Comparison */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FiTrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      Progreso del Nivel
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-3xl mb-1">
                          {oldLevelInfo?.icon}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          Nivel {levelUpEvent.oldLevel}
                        </div>
                        <div className="text-xs text-gray-600">
                          {oldLevelInfo?.title}
                        </div>
                      </div>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="flex-1 mx-6"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2" />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.7, duration: 1 }}
                            className="bg-gradient-to-r from-green-500 to-yellow-500 rounded-full h-2"
                          />
                        </div>
                        <div className="text-center mt-2 text-sm text-gray-600">
                          +{levelUpEvent.pointsEarned} puntos
                        </div>
                      </motion.div>

                      <div className="text-center">
                        <motion.div
                          className="text-3xl mb-1"
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                          }}
                        >
                          {newLevelInfo.icon}
                        </motion.div>
                        <div className="text-sm font-medium text-gray-900">
                          Nivel {levelUpEvent.newLevel}
                        </div>
                        <div className="text-xs text-gray-600">
                          {newLevelInfo.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentStep("celebration")}
                    className="px-4 py-2 text-white/80 hover:text-white"
                  >
                    ← Volver
                  </button>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentStep("sharing")}
                      className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Compartir →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Sharing */}
            {currentStep === "sharing" && (
              <motion.div
                key="sharing"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="p-8"
              >
                <div className="bg-white rounded-xl p-6 text-center space-y-6">
                  <div>
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      ¡Comparte tu Logro!
                    </h2>
                    <p className="text-gray-600">
                      Deja que todos sepan sobre tu progreso en Mundero
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Vista previa:
                    </div>
                    <div className="bg-white border rounded-lg p-4 text-left">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">{newLevelInfo.icon}</div>
                        <div>
                          <div className="font-medium">
                            ¡Level Up en Mundero!
                          </div>
                          <div className="text-sm text-gray-600">
                            Nivel {levelUpEvent.newLevel} - {newLevelInfo.title}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        Acabo de alcanzar {levelUpEvent.totalPoints} puntos
                        totales 💎
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      <FiShare2 className="w-5 h-5" />
                      <span>Compartir</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadCertificate}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
                      <FiDownload className="w-5 h-5" />
                      <span>Certificado</span>
                    </motion.button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentStep("details")}
                    className="px-4 py-2 text-white/80 hover:text-white"
                  >
                    ← Volver
                  </button>

                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LevelUpModal;
