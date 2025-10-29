import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const HeroSection: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">MUNDERO</span>
            </motion.div>

            {/* Header Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <Button
                variant="outline"
                className="!bg-transparent !hover:bg-gray-50 border border-gray-300 text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              >
                Explorar el ecosistema
              </Button>
              <Button
                onClick={handleGoogleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar con Google
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              {/* Main Title */}
              <div className="space-y-6">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  Tu identidad profesional,{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                    conectada al futuro
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl font-light"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  MUNDERO sincroniza tu acceso, tus empresas y tus resultados en un solo lugar.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button
                  onClick={handleGoogleSignIn}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Entrar con Google
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="!bg-transparent !hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-10 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Explorar el ecosistema
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="pt-12 border-t border-gray-200"
              >
                <p className="text-sm text-gray-500 mb-6 font-medium tracking-wide uppercase">
                  Confiado por profesionales en:
                </p>
                <div className="flex flex-wrap gap-8 items-center">
                  <div className="text-gray-600 font-semibold text-lg">Tecnología</div>
                  <div className="text-gray-600 font-semibold text-lg">Finanzas</div>
                  <div className="text-gray-600 font-semibold text-lg">Consultoría</div>
                  <div className="text-gray-600 font-semibold text-lg">Startups</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative max-w-md lg:max-w-lg">
                <div className="relative">
                  <img
                    src="/assets/mundero-networking.png"
                    alt="Networking profesional MUNDERO"
                    className="w-full h-auto rounded-3xl shadow-2xl"
                  />
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent rounded-3xl"></div>
                </div>
                
                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-700">Conectado</span>
                  </div>
                </motion.div>
                
                {/* Bottom floating element */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute -bottom-6 -left-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-4 text-white"
                >
                  <div className="text-2xl font-bold">360°</div>
                  <div className="text-xs opacity-90">Ecosistema</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};