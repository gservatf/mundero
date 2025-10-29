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
      {/* Header modernizado */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-14">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">mundero</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Explorar
            </Button>
            <Button
              onClick={handleGoogleSignIn}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-full"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Hero principal */}
      <section className="min-h-[85vh] bg-white flex items-center justify-center py-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Columna izquierda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 leading-tight">
              Tu <span className="text-blue-600">identidad profesional</span>, conectada al futuro
            </h1>

            <p className="text-lg text-gray-600 max-w-md leading-relaxed">
              MUNDERO sincroniza tu acceso, tus empresas y tus logros en una sola plataforma.  
              Conecta tu identidad, tu crecimiento y tu red profesional.
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 max-w-xs"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar con Google
              </Button>

              <p className="text-sm text-gray-500">
                Al hacer clic en “Entrar con Google”, aceptas nuestros{" "}
                <a href="#" className="text-blue-600 hover:underline">Términos de servicio</a> y{" "}
                <a href="#" className="text-blue-600 hover:underline">Política de privacidad</a>.
              </p>
            </div>

            {/* Métricas */}
            <div className="flex space-x-8 pt-6 border-t border-gray-100">
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
            </div>
          </motion.div>

          {/* Columna derecha */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-40 scale-75"></div>
            <img
              src="/assets/mundero-networking.png"
              alt="Red profesional MUNDERO"
              className="relative z-10 w-[85%] max-w-md drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
};
