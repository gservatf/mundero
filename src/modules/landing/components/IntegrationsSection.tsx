import React from 'react';
import { motion } from 'framer-motion';

// Importa los logos desde /assets/logos/empresas/
import weConsulting from '@/assets/logos/empresas/logo-echado-we-consulting.png';
import legality from '@/assets/logos/empresas/logo-legality.png';
import studio41 from '@/assets/logos/empresas/logo-s41.png';
import arkadiam from '@/assets/logos/empresas/logo-ak-arquitectos.png';
import swyftassist from '@/assets/logos/empresas/logo-swyftassist.png';
import portales from '@/assets/logos/empresas/logo-portales.png';
import pitahaya from '@/assets/logos/empresas/logo-pithaya.png';
import todoinmueble from '@/assets/logos/empresas/logo-todoinmueble.png';
import escuela from '@/assets/logos/empresas/logo-escuela-angloamericana.png';
import grupoServat from '@/assets/logos/empresas/logo-grupo-servat.png';

export const IntegrationsSection: React.FC = () => {
  const integrations = [
    { name: 'We Consulting', logo: weConsulting },
    { name: 'Legality', logo: legality },
    { name: 'Studio41', logo: studio41 },
    { name: 'Arkadiam Group', logo: arkadiam },
    { name: 'Swyft Assist', logo: swyftassist },
    { name: 'Portales Inmobiliario', logo: portales },
    { name: 'Pitahaya Investments', logo: pitahaya },
    { name: 'Todoinmueble.pe', logo: todoinmueble },
    { name: 'Escuela Angloamericana', logo: escuela },
    { name: 'Grupo Servat', logo: grupoServat },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
        >
          Soluciones integradas del ecosistema{' '}
          <span className="text-blue-600">Servat</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12"
        >
          Mundero conecta tu perfil profesional con las aplicaciones del grupo. 
          Un ecosistema vivo donde cada empresa aporta una solución única.
        </motion.p>

        {/* GRID DE LOGOS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10 items-center justify-items-center">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <img
                src={integration.logo}
                alt={integration.name}
                className="h-20 md:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 drop-shadow-sm hover:drop-shadow-lg"
                loading="lazy"
              />
              <p className="mt-3 text-sm md:text-base font-medium text-slate-700 dark:text-slate-200">
                {integration.name}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mt-14 text-sm text-slate-500 dark:text-slate-400">
          Más soluciones se integrarán próximamente en Mundero. 
          El futuro del trabajo conectado está en expansión.
        </p>
      </div>
    </section>
  );
};

export default IntegrationsSection;
