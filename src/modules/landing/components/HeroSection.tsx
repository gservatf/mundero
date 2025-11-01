import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';

export const HeroSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // El redirect se maneja automáticamente en App.tsx
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
      // Opcional: mostrar toast de error
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        {/* Texto principal */}
        <div className="flex flex-col items-start text-left">
          <img
            src="/images/logo-echado-azul.png"
            alt="Mundero"
            className="h-12 md:h-16 w-auto mt-4 mb-8"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              console.error('Failed to load logo image:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Conecta tu <span className="text-blue-600">perfil</span>, tus empresas y tus logros en un solo lugar.
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-lg">
            Tu identidad profesional dentro del ecosistema del{' '}
            <span className="font-semibold">Grupo Servat</span>.  
            Accede con un clic, sin barreras ni contraseñas.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center gap-3 bg-white border border-gray-300 rounded-md px-5 py-3 text-slate-700 hover:bg-gray-50 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Conectando...
              </>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                Entrar con Google
              </>
            )}
          </button>
        </div>

        {/* Imagen */}
        <div className="flex justify-center md:justify-end">
          <img
            src="/images/mundero.png"
            alt="Red de conexiones Mundero"
            className="w-full max-w-md md:max-w-lg object-contain"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              console.error('Failed to load hero image:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
