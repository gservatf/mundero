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
      {/* LinkedIn-style Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo - LinkedIn style */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">mundero</span>
            </motion.div>

            {/* Navigation - LinkedIn style */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center space-x-4"
            >
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 text-sm font-medium"
              >
                Explorar
              </Button>
              <Button
                onClick={handleGoogleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium rounded-full shadow-sm"
              >
                Iniciar sesión
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section - LinkedIn inspired */}
      <section className="min-h-screen bg-white flex items-center pt-14">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-16">
            
            {/* Left Column - Content (LinkedIn style) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Main Headline - LinkedIn typography */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight">
                  Bienvenido a tu{' '}
                  <span className="text-blue-600 font-normal">identidad profesional</span>{' '}
                  del futuro
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-700 font-light leading-relaxed max-w-lg">
                  MUNDERO conecta tu carrera, empresas y logros en una plataforma única y poderosa.
                </p>
              </motion.div>

              {/* CTA Section - LinkedIn style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-4"
              >
                <Button
                  onClick={handleGoogleSignIn}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Únete ahora con Google
                </Button>
                
                <p className="text-sm text-gray-500">
                  Al hacer clic en "Únete ahora", aceptas nuestros{' '}
                  <a href="#" className="text-blue-600 hover:underline">Términos de servicio</a>{' '}
                  y{' '}
                  <a href="#" className="text-blue-600 hover:underline">Política de privacidad</a>.
                </p>
              </motion.div>

              {/* Stats - LinkedIn style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200"
              >
                <div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Profesionales</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Empresas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">10+</div>
                  <div className="text-sm text-gray-600">Países</div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-md">
                <img
                  src="/assets/mundero-networking.png"
                  alt="Red profesional MUNDERO"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom Section - LinkedIn inspired */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="border-t border-gray-200 pt-12 pb-16"
          >
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-light text-gray-900">
                Únete a profesionales de empresas líderes
              </h2>
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <span className="font-medium">Tecnología</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <span className="font-medium">Finanzas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <span className="font-medium">Consultoría</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <span className="font-medium">Startups</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};