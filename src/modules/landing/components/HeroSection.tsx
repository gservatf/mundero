import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Assets (según estructura que ya dejamos)
import munderoLogo from '@/assets/logos/mundero/logo-echado-azul.png';
import heroIllustration from '@/assets/logos/mundero/ilustraciones/mundero.png';

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
    <section className="bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
        {/* Top brand bar */}
        <div className="flex items-center justify-between mb-10">
          <img
            src={munderoLogo}
            alt="Mundero"
            className="h-8 w-auto"
            loading="eager"
          />
        </div>

        {/* HERO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Col izquierda: copy + CTA */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight text-slate-900 dark:text-white tracking-tight">
              Conecta tu <span className="text-blue-600">perfil</span>, tus
              empresas y tus logros en un solo lugar.
            </h1>

            <p className="mt-5 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
              Tu identidad profesional dentro del ecosistema del{' '}
              <span className="font-semibold text-slate-800 dark:text-white">
                Grupo Servat
              </span>
              . Accede con un clic, sin barreras ni contraseñas.
            </p>

            <div className="mt-8">
              <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white px-6 py-5 rounded-full shadow-sm hover:shadow transition"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar con Google
              </Button>
            </div>
          </motion.div>

          {/* Col derecha: ilustración */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <img
              src={heroIllustration}
              alt="Red profesional conectada en Mundero"
              className="w-full max-w-[560px] h-auto drop-shadow-xl"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
