import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { FiHeart, FiUsers, FiArrowRight, FiStar } from 'react-icons/fi';

export const CTASection: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const testimonials = [
    {
      quote: "MUNDERO transformó la forma en que accedo a todas las herramientas del grupo. Ahora todo está conectado.",
      author: "María González",
      role: "Directora Comercial",
      company: "Legalty"
    },
    {
      quote: "La integración es perfecta. Un solo login para todo el ecosistema empresarial que necesito.",
      author: "Carlos Mendoza",
      role: "Consultor Senior",
      company: "We Consulting"
    },
    {
      quote: "Mis comisiones, referidos y métricas en tiempo real. MUNDERO es el centro de mi actividad profesional.",
      author: "Ana Vargas",
      role: "Ejecutiva de Ventas",
      company: "Pitahaya"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emotional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
              className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <FiHeart className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            No trabajes{' '}
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              aislado
            </span>
            <br />
            Conecta con tu ecosistema y{' '}
            <span className="bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
              crece dentro de él
            </span>
          </h2>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Únete a miles de profesionales que ya forman parte del ecosistema más conectado 
            del sector empresarial. Tu crecimiento profesional comienza aquí.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Button
              onClick={handleGoogleSignIn}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <FiUsers className="mr-3 w-6 h-6" />
              Unirme al ecosistema
              <FiArrowRight className="ml-3 w-6 h-6" />
            </Button>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              size="lg"
              className="border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <FiStar className="mr-3 w-6 h-6" />
              Soy parte del Grupo Servat
            </Button>
          </motion.div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Lo que dicen nuestros usuarios
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-slate-700 mb-6 leading-relaxed italic">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                
                <div className="border-t border-slate-100 pt-4">
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  <p className="text-sm text-blue-600 font-medium">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fillOpacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
            }}></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para conectar tu futuro profesional?
            </h3>
            
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete hoy y descubre cómo MUNDERO puede transformar tu forma de trabajar 
              dentro del ecosistema empresarial más innovador.
            </p>

            <Button
              onClick={handleGoogleSignIn}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 px-12 py-6 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Comenzar ahora con Google
              <FiArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};