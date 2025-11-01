// Panel administrativo para gestión de onboarding
// Permite crear, editar y administrar plantillas de quest y configuraciones

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { QuestEditorModal } from "./QuestEditorModal";
import {
  useOnboardingProgress,
  useQuestTemplates,
  useOnboardingStats,
} from "./useOnboardingProgress";
import { QuestTemplate, OnboardingStep } from "./types";
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target,
  Award,
  FileText,
  Activity,
  Calendar,
  Eye,
  Copy,
  Download,
  Upload,
} from "lucide-react";

interface OnboardingAdminProps {
  className?: string;
}

export const OnboardingAdmin: React.FC<OnboardingAdminProps> = ({
  className = "",
}) => {
  const [showQuestEditor, setShowQuestEditor] = useState(false);
  const [editingQuest, setEditingQuest] = useState<QuestTemplate | null>(null);
  const [selectedTab, setSelectedTab] = useState("templates");

  const { questTemplates, loading: templatesLoading } = useQuestTemplates();
  const { stats, loading: statsLoading } = useOnboardingStats();

  const handleCreateQuest = () => {
    setEditingQuest(null);
    setShowQuestEditor(true);
  };

  const handleEditQuest = (quest: QuestTemplate) => {
    setEditingQuest(quest);
    setShowQuestEditor(true);
  };

  const handleDeleteQuest = async (questId: string) => {
    if (
      confirm("¿Estás seguro de que quieres eliminar esta plantilla de quest?")
    ) {
      // TODO: Implementar eliminación
      console.log("Eliminando quest:", questId);
    }
  };

  const handleDuplicateQuest = async (quest: QuestTemplate) => {
    const duplicatedQuest: QuestTemplate = {
      ...quest,
      id: `${quest.id}_copy_${Date.now()}`,
      name: `${quest.name} (Copia)`,
      createdAt: new Date(),
    };
    setEditingQuest(duplicatedQuest);
    setShowQuestEditor(true);
  };

  const getStepTypeColor = (type: OnboardingStep["type"]) => {
    switch (type) {
      case "profile_completion":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "tutorial_view":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "community_join":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "first_post":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "first_connection":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      case "explore_features":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStepTypeIcon = (type: OnboardingStep["type"]) => {
    switch (type) {
      case "profile_completion":
        return <Users className="h-4 w-4" />;
      case "tutorial_view":
        return <FileText className="h-4 w-4" />;
      case "community_join":
        return <Users className="h-4 w-4" />;
      case "first_post":
        return <Edit2 className="h-4 w-4" />;
      case "first_connection":
        return <Users className="h-4 w-4" />;
      case "explore_features":
        return <Target className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Panel de Onboarding
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona plantillas de quest y configuraciones del sistema
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreateQuest}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Quest
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="templates"
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Plantillas</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Estadísticas</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {questTemplates?.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {template.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`text-xs ${
                              template.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                            }`}
                          >
                            {template.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.steps.length} pasos
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Steps Preview */}
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      {template.steps.slice(0, 3).map((step, index) => (
                        <div
                          key={step.id}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-300">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white truncate">
                              {step.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`text-xs ${getStepTypeColor(step.type)}`}
                              >
                                {getStepTypeIcon(step.type)}
                                <span className="ml-1 capitalize">
                                  {step.type.replace("_", " ")}
                                </span>
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {step.points} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {template.steps.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{template.steps.length - 3} pasos más
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Creado:{" "}
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-3 w-3" />
                        <span>
                          Total:{" "}
                          {template.steps.reduce(
                            (acc, step) => acc + step.points,
                            0,
                          )}{" "}
                          puntos
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditQuest(template)}
                        className="flex-1"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateQuest(template)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          /* TODO: Preview */
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteQuest(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Create New Template Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer"
                onClick={handleCreateQuest}
              >
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Nueva Plantilla
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Crear una nueva quest de onboarding
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {templatesLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Cargando plantillas...
              </p>
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalUsers}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total usuarios
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.completedUsers}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completaron onboarding
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(stats.averageCompletionRate)}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tasa promedio
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.averageCompletionTime}h
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tiempo promedio
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {statsLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Cargando estadísticas...
              </p>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="p-6">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Gestión de Usuarios
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Panel de usuarios en desarrollo
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Configuración General
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Onboarding automático
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Iniciar automáticamente para nuevos usuarios
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Notificaciones push
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enviar recordatorios de progreso
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Herramientas
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar plantillas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar plantillas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generar reporte
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quest Editor Modal */}
      {showQuestEditor && (
        <QuestEditorModal
          quest={editingQuest}
          onClose={() => {
            setShowQuestEditor(false);
            setEditingQuest(null);
          }}
          onSave={(quest: QuestTemplate) => {
            // TODO: Implementar guardado
            console.log("Guardando quest:", quest);
            setShowQuestEditor(false);
            setEditingQuest(null);
          }}
        />
      )}
    </div>
  );
};
