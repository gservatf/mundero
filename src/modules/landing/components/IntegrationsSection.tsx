import React from 'react';
import { motion } from 'framer-motion';

export const IntegrationsSection: React.FC = () => {
  const integrations = [
    '/images/empresas/logo-echado-we-consulting.png',
    '/images/empresas/logo-legality.png',
    '/images/empresas/logo-s41.png',
    '/images/empresas/logo-ak-arquitectos.png',
    '/images/empresas/logo-swyftassist.png',
    '/images/empresas/logo-portales.png',
    '/images/empresas/logo-pithaya.png',
    '/images/empresas/logo-todoinmueble.png',
    '/images/empresas/logo-escuela-angloamericana.png',
    '/images/empresas/logo-grupo-servat.png',
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-slate-900 mb-12"
        >
          Soluciones integradas del ecosistema{' '}
          <span className="text-blue-600">Servat</span>
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10 items-center justify-items-center">
          {integrations.map((logo, index) => (
            <motion.img
              key={index}
              src={logo}
              alt="Logo empresa integrada"
              className="h-24 md:h-28 w-auto object-contain transition-transform duration-300 hover:scale-105"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              loading="lazy"
              onError={(e) => {
                console.error('Failed to load integration logo:', logo);
                e.currentTarget.style.display = 'none';
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
