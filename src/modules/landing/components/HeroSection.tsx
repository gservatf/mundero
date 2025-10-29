import React from 'react';
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
    <section className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">M</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">MUNDERO</h2>
                <p className="text-sm text-gray-600">Grupo Servat</p>
              </div>
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Tu identidad profesional,{' '}
                <span className="text-blue-600">conectada al futuro</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                MUNDERO sincroniza tu acceso, tus empresas y tus resultados en un solo lugar. 
                Conecta tu identidad, tus empresas y tus logros.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
                className="!bg-transparent !hover:bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200"
              >
                Explorar el ecosistema
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Confiado por profesionales en:</p>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="text-gray-400 font-medium">Tecnología</div>
                <div className="text-gray-400 font-medium">Finanzas</div>
                <div className="text-gray-400 font-medium">Consultoría</div>
                <div className="text-gray-400 font-medium">Startups</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/assets/mundero-networking.png"
                alt="Networking profesional MUNDERO"
                className="w-full max-w-lg h-auto rounded-2xl shadow-2xl"
              />
              
              {/* Floating elements for visual interest */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">360°</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};