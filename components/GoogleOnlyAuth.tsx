import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { FiLogIn } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

export const GoogleOnlyAuth: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error en autenticación:', error);
    }
  };

  const logoElement = () => {
    if (settings.branding?.logoUrl) {
      return (
        <img 
          src={settings.branding.logoUrl} 
          alt="MUNDERO Logo" 
          className="w-20 h-20 object-contain rounded-2xl"
        />
      );
    }
    
    return (
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-3xl font-bold text-white">M</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Patrón de fondo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Patrón geométrico */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center space-y-8">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center"
            >
              {logoElement()}
            </motion.div>

            {/* Título y descripción */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-3xl font-bold text-white">
                {settingsLoading ? 'MUNDERO Hub' : (settings.general?.title || 'MUNDERO Hub')}
              </h1>
              
              <p className="text-xl text-blue-100 font-medium">
                {settingsLoading ? 'Conecta. Accede. Evoluciona.' : (settings.general?.welcomePhrase || 'Conecta. Accede. Evoluciona.')}
              </p>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                {settingsLoading ? 'El hub universal de identidad del Grupo Servat.' : (settings.general?.tagline || 'El hub universal de identidad del Grupo Servat.')}
              </p>
            </motion.div>

            {/* Botón de login */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                size="lg"
                className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Iniciar Sesión con Google
                  </div>
                )}
              </Button>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-xs text-gray-400 space-y-2"
            >
              <p>Acceso seguro al ecosistema empresarial</p>
              <div className="flex justify-center space-x-4 text-xs">
                <span>Legalty</span>
                <span>•</span>
                <span>We Consulting</span>
                <span>•</span>
                <span>Más aplicaciones</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};