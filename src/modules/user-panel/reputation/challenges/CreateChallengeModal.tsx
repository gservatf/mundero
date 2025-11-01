// Modal para crear nuevos retos usando plantillas predefinidas
// Permite personalización y configuración avanzada

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiTarget,
  FiUsers,
  FiClock,
  FiAward,
  FiCalendar,
  FiTag,
  FiInfo,
} from "react-icons/fi";
import {
  ChallengeTemplate,
  CHALLENGE_TEMPLATES,
  DIFFICULTY_CONFIG,
  CATEGORY_CONFIG,
  ChallengeType,
} from "./types";
import { useChallenges } from "./useChallenges";

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated?: (challengeId: string) => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
  onChallengeCreated,
}) => {
  const { createChallenge } = useChallenges();

  const [step, setStep] = useState<"template" | "customize" | "confirm">(
    "template",
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<ChallengeTemplate | null>(null);
  const [customTemplate, setCustomTemplate] = useState<
    Partial<ChallengeTemplate>
  >({});
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateSelect = (template: ChallengeTemplate) => {
    setSelectedTemplate(template);
    setCustomTemplate(template);
    setStep("customize");
  };

  const handleCustomizationChange = (
    field: keyof ChallengeTemplate,
    value: any,
  ) => {
    setCustomTemplate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateChallenge = async () => {
    if (!customTemplate.title || !customTemplate.description) {
      setError("Título y descripción son requeridos");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const finalTemplate: ChallengeTemplate = {
        title: customTemplate.title!,
        description: customTemplate.description!,
        type: customTemplate.type || "individual",
        points: customTemplate.points || 100,
        objective: customTemplate.objective || {
          type: "posts_create",
          target: 1,
          timeframe: "total",
        },
        difficulty: customTemplate.difficulty || "easy",
        category: customTemplate.category || "social",
        duration: customTemplate.duration || 7,
        tags: customTemplate.tags || [],
      };

      const challenge = await createChallenge(finalTemplate);

      if (challenge) {
        onChallengeCreated?.(challenge.id);
        handleClose();
      } else {
        setError("Error al crear el reto");
      }
    } catch (err) {
      setError("Error inesperado al crear el reto");
      console.error("Error creating challenge:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep("template");
    setSelectedTemplate(null);
    setCustomTemplate({});
    setError(null);
    setIsCreating(false);
    onClose();
  };

  const addTag = (tag: string) => {
    if (tag && !customTemplate.tags?.includes(tag)) {
      setCustomTemplate((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCustomTemplate((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🎯 Crear Nuevo Reto
              </h2>
              <p className="text-gray-600">
                {step === "template" &&
                  "Selecciona una plantilla para comenzar"}
                {step === "customize" && "Personaliza tu reto"}
                {step === "confirm" && "Confirma los detalles"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {[
                {
                  id: "template",
                  label: "Plantilla",
                  active: step === "template",
                },
                {
                  id: "customize",
                  label: "Personalizar",
                  active: step === "customize",
                },
                {
                  id: "confirm",
                  label: "Confirmar",
                  active: step === "confirm",
                },
              ].map((stepItem, index) => (
                <div key={stepItem.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      stepItem.active
                        ? "bg-blue-600 text-white"
                        : (step === "customize" &&
                              stepItem.id === "template") ||
                            (step === "confirm" && stepItem.id !== "confirm")
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      stepItem.active ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {stepItem.label}
                  </span>
                  {index < 2 && <div className="w-8 h-0.5 bg-gray-300 mx-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Template Selection */}
              {step === "template" && (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CHALLENGE_TEMPLATES.map((template, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleTemplateSelect(template)}
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full border ${
                                DIFFICULTY_CONFIG[template.difficulty].color
                              }`}
                            >
                              {DIFFICULTY_CONFIG[template.difficulty].icon}{" "}
                              {template.difficulty.toUpperCase()}
                            </span>

                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                CATEGORY_CONFIG[template.category].color
                              }`}
                            >
                              {CATEGORY_CONFIG[template.category].icon}
                            </span>
                          </div>

                          <div className="flex items-center text-blue-600 text-sm font-medium">
                            <FiAward className="w-4 h-4 mr-1" />
                            {template.points}
                          </div>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2">
                          {template.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {template.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Objetivo: {template.objective.target}</span>
                          <span>{template.duration} días</span>
                          <span className="capitalize">{template.type}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          ¿No encuentras lo que buscas?
                        </h4>
                        <p className="text-sm text-blue-700">
                          Selecciona cualquier plantilla y podrás personalizarla
                          completamente en el siguiente paso.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Customization */}
              {step === "customize" && customTemplate && (
                <motion.div
                  key="customize"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiTarget className="w-5 h-5 mr-2" />
                      Información Básica
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título del Reto *
                        </label>
                        <input
                          type="text"
                          value={customTemplate.title || ""}
                          onChange={(e) =>
                            handleCustomizationChange("title", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nombre descriptivo del reto"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción *
                        </label>
                        <textarea
                          value={customTemplate.description || ""}
                          onChange={(e) =>
                            handleCustomizationChange(
                              "description",
                              e.target.value,
                            )
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe qué deben hacer los participantes para completar el reto"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Reto
                        </label>
                        <select
                          value={customTemplate.type || "individual"}
                          onChange={(e) =>
                            handleCustomizationChange(
                              "type",
                              e.target.value as ChallengeType,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="individual">Individual</option>
                          <option value="collaborative">Colaborativo</option>
                          <option value="weekly">Semanal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duración (días)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={customTemplate.duration || 7}
                          onChange={(e) =>
                            handleCustomizationChange(
                              "duration",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dificultad
                        </label>
                        <select
                          value={customTemplate.difficulty || "easy"}
                          onChange={(e) =>
                            handleCustomizationChange(
                              "difficulty",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="easy">Fácil</option>
                          <option value="medium">Medio</option>
                          <option value="hard">Difícil</option>
                          <option value="extreme">Extremo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría
                        </label>
                        <select
                          value={customTemplate.category || "social"}
                          onChange={(e) =>
                            handleCustomizationChange(
                              "category",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="social">Social</option>
                          <option value="content">Contenido</option>
                          <option value="engagement">Participación</option>
                          <option value="networking">Networking</option>
                          <option value="learning">Aprendizaje</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Objective */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiTarget className="w-5 h-5 mr-2" />
                      Objetivo del Reto
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Objetivo
                        </label>
                        <select
                          value={
                            customTemplate.objective?.type || "posts_create"
                          }
                          onChange={(e) =>
                            handleCustomizationChange("objective", {
                              ...customTemplate.objective,
                              type: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="posts_create">
                            Crear publicaciones
                          </option>
                          <option value="likes_receive">Recibir likes</option>
                          <option value="comments_make">
                            Hacer comentarios
                          </option>
                          <option value="events_attend">
                            Asistir a eventos
                          </option>
                          <option value="connections_make">
                            Hacer conexiones
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Numérica
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={customTemplate.objective?.target || 1}
                          onChange={(e) =>
                            handleCustomizationChange("objective", {
                              ...customTemplate.objective,
                              target: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeframe
                        </label>
                        <select
                          value={customTemplate.objective?.timeframe || "total"}
                          onChange={(e) =>
                            handleCustomizationChange("objective", {
                              ...customTemplate.objective,
                              timeframe: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="total">Durante todo el reto</option>
                          <option value="daily">Por día</option>
                          <option value="weekly">Por semana</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Points and Tags */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiAward className="w-5 h-5 mr-2" />
                      Recompensas y Tags
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Puntos de Recompensa
                        </label>
                        <input
                          type="number"
                          min="10"
                          step="10"
                          value={customTemplate.points || 100}
                          onChange={(e) =>
                            handleCustomizationChange(
                              "points",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agregar Tag
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Escribe un tag..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                addTag((e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector(
                                'input[placeholder="Escribe un tag..."]',
                              ) as HTMLInputElement;
                              if (input?.value) {
                                addTag(input.value);
                                input.value = "";
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <FiTag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {customTemplate.tags && customTemplate.tags.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags del Reto
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {customTemplate.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              #{tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === "confirm" && customTemplate && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar Detalles del Reto
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {customTemplate.title}
                      </h4>
                      <p className="text-gray-600 mt-1">
                        {customTemplate.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Tipo:</span>
                        <div className="font-medium capitalize">
                          {customTemplate.type}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duración:</span>
                        <div className="font-medium">
                          {customTemplate.duration} días
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Objetivo:</span>
                        <div className="font-medium">
                          {customTemplate.objective?.target}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Puntos:</span>
                        <div className="font-medium">
                          {customTemplate.points}
                        </div>
                      </div>
                    </div>

                    {customTemplate.tags && customTemplate.tags.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-sm">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {customTemplate.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-3">
              {step !== "template" && (
                <button
                  onClick={() => {
                    if (step === "customize") setStep("template");
                    if (step === "confirm") setStep("customize");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Atrás
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>

              {step === "customize" && (
                <button
                  onClick={() => setStep("confirm")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continuar
                </button>
              )}

              {step === "confirm" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateChallenge}
                  disabled={isCreating}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isCreating && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  )}
                  <span>{isCreating ? "Creando..." : "Crear Reto"}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateChallengeModal;
