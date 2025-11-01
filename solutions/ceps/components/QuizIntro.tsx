import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PlayCircle,
  Users,
  Building,
  Clock,
  Target,
  ArrowRight,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useQuizStore } from "../state/useQuizStore";
import { generateQuestionOrder } from "../engine/random";
import { registerFunnelEvent } from "../services/funnelService";
import { loadSession } from "../engine/session";

export const QuizIntro: React.FC = () => {
  const navigate = useNavigate();
  const {
    mode,
    setMode,
    setOrder,
    setCorporateInfo,
    markStart,
    userId,
    setUser,
    setLoading,
    reset,
  } = useQuizStore();

  const [corporateData, setCorporateData] = useState({
    companyName: "",
    area: "",
    position: "",
    userName: "",
    userEmail: "",
  });

  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [showResumeOption, setShowResumeOption] = useState(false);

  useEffect(() => {
    // Simular userId (en producción vendría del auth)
    if (!userId) {
      setUser("demo-user-" + Math.random().toString(36).substr(2, 9));
    }

    // Verificar si hay sesión existente
    checkExistingSession();
  }, [userId, setUser]);

  const checkExistingSession = async () => {
    if (!userId) return;

    try {
      const session = await loadSession(userId);
      if (session && Object.keys(session.answers).length > 0) {
        setHasExistingSession(true);
        setShowResumeOption(true);
      }
    } catch (error) {
      console.error("Error checking existing session:", error);
    }
  };

  const handleStartQuiz = async () => {
    setLoading(true);

    try {
      // Validar datos corporativos si está en modo corporativo
      if (mode === "corporate") {
        if (
          !corporateData.companyName ||
          !corporateData.userName ||
          !corporateData.userEmail
        ) {
          alert("Por favor completa todos los campos requeridos");
          setLoading(false);
          return;
        }

        setCorporateInfo(corporateData);
      }

      // Resetear estado y generar nuevo orden
      reset();
      const questionOrder = generateQuestionOrder();
      setOrder(questionOrder);
      markStart();

      // Registrar evento de funnel
      if (userId) {
        await registerFunnelEvent(userId, "solution", "awareness", {
          solution: "ceps",
          mode,
          timestamp: new Date().toISOString(),
        });
      }

      navigate("/solutions/ceps/play");
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("Error al iniciar el quiz. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeQuiz = () => {
    navigate("/solutions/ceps/play");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Evaluación CEPS
          </h1>
          <p className="text-lg text-gray-600">
            Características Emprendedoras Personales
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>55 preguntas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>15-20 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              <span>Gamificado</span>
            </div>
          </div>
        </motion.div>

        {/* Resume Session Option */}
        {showResumeOption && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Sesión en progreso
                  </h3>
                  <p className="text-yellow-700">
                    Tienes una evaluación iniciada. ¿Deseas continuar donde la
                    dejaste?
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowResumeOption(false)}
                  >
                    Empezar de nuevo
                  </Button>
                  <Button
                    onClick={handleResumeQuiz}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Selecciona el tipo de evaluación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`p-6 cursor-pointer transition-all ${
                mode === "user"
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:shadow-md"
              }`}
              onClick={() => setMode("user")}
            >
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Evaluación Personal
                  </h3>
                  <p className="text-gray-600">
                    Para uso individual y desarrollo personal
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Reporte PDF personal</li>
                    <li>• Recomendaciones personalizadas</li>
                    <li>• Guardado en tu perfil</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card
              className={`p-6 cursor-pointer transition-all ${
                mode === "corporate"
                  ? "ring-2 ring-purple-500 bg-purple-50"
                  : "hover:shadow-md"
              }`}
              onClick={() => setMode("corporate")}
            >
              <div className="flex items-center gap-4">
                <Building className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Evaluación Corporativa
                  </h3>
                  <p className="text-gray-600">
                    Para procesos de selección y RH
                  </p>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>• Integración con Google Drive</li>
                    <li>• Registro automático en Excel</li>
                    <li>• Reporte con logo corporativo</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Corporate Form */}
        {mode === "corporate" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información Corporativa
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">Nombre completo *</Label>
                  <Input
                    id="userName"
                    value={corporateData.userName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCorporateData((prev) => ({
                        ...prev,
                        userName: e.target.value,
                      }))
                    }
                    placeholder="Nombre y apellidos"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="userEmail">Correo electrónico *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={corporateData.userEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCorporateData((prev) => ({
                        ...prev,
                        userEmail: e.target.value,
                      }))
                    }
                    placeholder="correo@empresa.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="companyName">Empresa *</Label>
                  <Input
                    id="companyName"
                    value={corporateData.companyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCorporateData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    placeholder="Nombre de la empresa"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="area">Área/Departamento</Label>
                  <Input
                    id="area"
                    value={corporateData.area}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCorporateData((prev) => ({
                        ...prev,
                        area: e.target.value,
                      }))
                    }
                    placeholder="Ej: Recursos Humanos"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="position">Puesto al que aspira</Label>
                  <Input
                    id="position"
                    value={corporateData.position}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCorporateData((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    placeholder="Ej: Analista de Marketing"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Instrucciones
            </h3>

            <div className="space-y-3 text-gray-700">
              <p>
                • Responde <strong>55 preguntas</strong> sobre tus
                características emprendedoras
              </p>
              <p>
                • Usa la escala de <strong>1 (Nunca)</strong> a{" "}
                <strong>5 (Siempre)</strong>
              </p>
              <p>
                • No hay respuestas correctas o incorrectas, responde con
                honestidad
              </p>
              <p>• Tu progreso se guarda automáticamente</p>
              <p>
                • Al finalizar obtendrás un reporte detallado con
                recomendaciones
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            onClick={handleStartQuiz}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Comenzar Evaluación CEPS
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
