import React from 'react';
import { motion } from 'framer-motion';

// Importar logos
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
    weConsulting,
    legality,
    studio41,
    arkadiam,
    swyftassist,
    portales,
    pitahaya,
    todoinmueble,
    escuela,
    grupoServat,
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
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
