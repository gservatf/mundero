import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Network, Sparkles } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useHybridAuth } from "../hooks/useHybridAuth";

const Register = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, loading, error } = useHybridAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsRegistering(true);
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al registrarse con Google:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Network className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Únete a MUNDERO
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Accede con tu cuenta de Google y conecta con el ecosistema
              profesional.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading || isRegistering}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 group"
            >
              {loading || isRegistering ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <FcGoogle className="w-5 h-5 mr-3" />
                  Continuar con Google
                  <Sparkles className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                </>
              )}
            </Button>

            {/* Benefits Section */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <h3 className="text-white font-semibold mb-3 text-center">
                ¿Qué obtienes al unirte?
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Acceso a aplicaciones profesionales
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Red de contactos especializada
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Herramientas de productividad
                </li>
              </ul>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-slate-500 text-xs mt-6 leading-relaxed">
          Al registrarte, aceptas nuestros términos de servicio y política de
          privacidad.
          <br />
          Los datos adicionales se completarán en cada aplicación según sea
          necesario.
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
