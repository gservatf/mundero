// Modal para crear y editar plantillas de quest de onboarding
// Permite definir pasos, configurar puntos, validaciones y opciones avanzadas

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { QuestTemplate, OnboardingStep, ActionType } from "./types";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  AlertCircle,
  Info,
  Users,
  FileText,
  Target,
  Edit2,
  Award,
  Settings,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";

interface QuestEditorModalProps {
  quest?: QuestTemplate | null;
  onClose: () => void;
  onSave: (quest: QuestTemplate) => void;
}

export const QuestEditorModal: React.FC<QuestEditorModalProps> = ({
  quest,
  onClose,
  onSave,
}) => {
  const [questData, setQuestData] = useState<Partial<QuestTemplate>>({
    name: "",
    description: "",
    isActive: true,
    steps: [],
  });
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (quest) {
      setQuestData(quest);
    }
  }, [quest]);

  const stepTypes: Array<{
    type: ActionType;
    label: string;
    description: string;
    icon: React.ReactNode;
    defaultPoints: number;
  }> = [
    {
      type: "profile_completion",
      label: "Completar Perfil",
      description: "Usuario debe completar información de perfil",
      icon: <Users className="h-4 w-4" />,
      defaultPoints: 100,
    },
    {
      type: "tutorial_view",
      label: "Ver Tutorial",
      description: "Usuario debe ver contenido educativo",
      icon: <FileText className="h-4 w-4" />,
      defaultPoints: 50,
    },
    {
      type: "community_join",
      label: "Unirse a Comunidad",
      description: "Usuario debe unirse a una comunidad",
      icon: <Users className="h-4 w-4" />,
      defaultPoints: 75,
    },
    {
      type: "first_post",
      label: "Primera Publicación",
      description: "Usuario debe crear su primera publicación",
      icon: <Edit2 className="h-4 w-4" />,
      defaultPoints: 150,
    },
    {
      type: "first_connection",
      label: "Primera Conexión",
      description: "Usuario debe conectar con otro usuario",
      icon: <Users className="h-4 w-4" />,
      defaultPoints: 100,
    },
    {
      type: "explore_features",
      label: "Explorar Funciones",
      description: "Usuario debe explorar funcionalidades",
      icon: <Target className="h-4 w-4" />,
      defaultPoints: 25,
    },
  ];

  const addStep = () => {
    const newStep: OnboardingStep = {
      id: `step_${Date.now()}`,
      title: "Nuevo paso",
      description: "Descripción del paso",
      type: "profile_completion",
      order: (questData.steps?.length || 0) + 1,
      points: 50,
      isRequired: true,
      validationRules: {},
      motivationalMessage: "¡Excelente trabajo! Sigue así.",
      category: "setup",
    };

    setQuestData((prev) => ({
      ...prev,
      steps: [...(prev.steps || []), newStep],
    }));
    setActiveStepIndex(questData.steps?.length || 0);
  };

  const removeStep = (index: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este paso?")) {
      setQuestData((prev) => ({
        ...prev,
        steps: prev.steps?.filter((_, i) => i !== index) || [],
      }));
      if (activeStepIndex === index) {
        setActiveStepIndex(null);
      }
    }
  };

  const updateStep = (index: number, updatedStep: Partial<OnboardingStep>) => {
    setQuestData((prev) => ({
      ...prev,
      steps:
        prev.steps?.map((step, i) =>
          i === index ? { ...step, ...updatedStep } : step,
        ) || [],
    }));
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= (questData.steps?.length || 0)) return;

    const steps = [...(questData.steps || [])];
    const [movedStep] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, movedStep);

    // Reordenar los números de orden
    steps.forEach((step, index) => {
      step.order = index + 1;
    });

    setQuestData((prev) => ({ ...prev, steps }));
  };

  const validateQuest = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!questData.name?.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!questData.description?.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!questData.steps?.length) {
      newErrors.steps = "Debe haber al menos un paso";
    }

    questData.steps?.forEach((step, index) => {
      if (!step.title?.trim()) {
        newErrors[`step_${index}_title`] =
          `El título del paso ${index + 1} es requerido`;
      }
      if (!step.description?.trim()) {
        newErrors[`step_${index}_description`] =
          `La descripción del paso ${index + 1} es requerida`;
      }
      if (step.points < 0) {
        newErrors[`step_${index}_points`] =
          `Los puntos del paso ${index + 1} deben ser positivos`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateQuest()) return;

    const completeQuest: QuestTemplate = {
      id: quest?.id || `quest_${Date.now()}`,
      name: questData.name!,
      description: questData.description!,
      steps: questData.steps!,
      isActive: questData.isActive !== false,
      createdAt: quest?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(completeQuest);
  };

  const getStepTypeData = (type: ActionType) => {
    return stepTypes.find((st) => st.type === type) || stepTypes[0];
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {quest ? "Editar Quest" : "Nueva Quest"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configura los pasos y recompensas del onboarding
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Editor" : "Vista Previa"}
                </Button>
                <Button onClick={onClose} variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {!showPreview ? (
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Información Básica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre de la Quest *
                      </label>
                      <input
                        type="text"
                        value={questData.name || ""}
                        onChange={(e) =>
                          setQuestData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="ej. Bienvenida Básica"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={questData.isActive !== false}
                        onChange={(e) =>
                          setQuestData((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <label
                        htmlFor="isActive"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Quest activa
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción *
                    </label>
                    <textarea
                      value={questData.description || ""}
                      onChange={(e) =>
                        setQuestData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Describe el propósito de esta quest..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </Card>

                {/* Steps */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Pasos de la Quest
                    </h3>
                    <Button onClick={addStep} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Paso
                    </Button>
                  </div>

                  {errors.steps && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{errors.steps}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {questData.steps?.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                      >
                        {/* Step Header */}
                        <div
                          className={`p-4 cursor-pointer transition-colors ${
                            activeStepIndex === index
                              ? "bg-purple-50 dark:bg-purple-900/20"
                              : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          onClick={() =>
                            setActiveStepIndex(
                              activeStepIndex === index ? null : index,
                            )
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveStep(index, index - 1);
                                }}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                <GripVertical className="h-4 w-4" />
                              </button>
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {step.title}
                                </h4>
                                <Badge className="text-xs">
                                  {getStepTypeData(step.type).icon}
                                  <span className="ml-1">
                                    {getStepTypeData(step.type).label}
                                  </span>
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {step.points} pts
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {step.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStep(index);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              {activeStepIndex === index ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Step Details */}
                        <AnimatePresence>
                          {activeStepIndex === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-200 dark:border-gray-700"
                            >
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Título *
                                    </label>
                                    <input
                                      type="text"
                                      value={step.title}
                                      onChange={(e) =>
                                        updateStep(index, {
                                          title: e.target.value,
                                        })
                                      }
                                      className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 ${
                                        errors[`step_${index}_title`]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      }`}
                                    />
                                    {errors[`step_${index}_title`] && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {errors[`step_${index}_title`]}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Tipo de Paso
                                    </label>
                                    <select
                                      value={step.type}
                                      onChange={(e) => {
                                        const stepType = getStepTypeData(
                                          e.target.value as ActionType,
                                        );
                                        updateStep(index, {
                                          type: e.target.value as ActionType,
                                          points: stepType.defaultPoints,
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                                    >
                                      {stepTypes.map((st) => (
                                        <option key={st.type} value={st.type}>
                                          {st.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción *
                                  </label>
                                  <textarea
                                    value={step.description}
                                    onChange={(e) =>
                                      updateStep(index, {
                                        description: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 ${
                                      errors[`step_${index}_description`]
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                  />
                                  {errors[`step_${index}_description`] && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {errors[`step_${index}_description`]}
                                    </p>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Puntos de Recompensa
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={step.points}
                                      onChange={(e) =>
                                        updateStep(index, {
                                          points: parseInt(e.target.value) || 0,
                                        })
                                      }
                                      className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 ${
                                        errors[`step_${index}_points`]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      }`}
                                    />
                                    {errors[`step_${index}_points`] && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {errors[`step_${index}_points`]}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`required_${index}`}
                                      checked={step.isRequired}
                                      onChange={(e) =>
                                        updateStep(index, {
                                          isRequired: e.target.checked,
                                        })
                                      }
                                      className="rounded"
                                    />
                                    <label
                                      htmlFor={`required_${index}`}
                                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                      Paso obligatorio
                                    </label>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mensaje Motivacional
                                  </label>
                                  <input
                                    type="text"
                                    value={step.motivationalMessage || ""}
                                    onChange={(e) =>
                                      updateStep(index, {
                                        motivationalMessage: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                                    placeholder="Mensaje que se muestra al completar el paso"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}

                    {(!questData.steps || questData.steps.length === 0) && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          No hay pasos configurados
                        </p>
                        <Button onClick={addStep} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar primer paso
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Vista Previa de la Quest
                  </h3>
                  {/* TODO: Implementar vista previa */}
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Play className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Vista previa en desarrollo
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Info className="h-4 w-4 mr-1" />
                <span>
                  {questData.steps?.length || 0} pasos configurados •
                  {questData.steps?.reduce(
                    (acc, step) => acc + step.points,
                    0,
                  ) || 0}{" "}
                  puntos totales
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {quest ? "Actualizar" : "Crear"} Quest
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
