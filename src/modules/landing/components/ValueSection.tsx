import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';

export const ValueSection: React.FC = () => {
  const features = [
    {
      icon: FiUsers,
      title: "Identidad Unificada",
      description: "Un solo perfil para acceder a todo el ecosistema del Grupo Servat"
    },
    {
      icon: FiShield,
      title: "Seguridad Empresarial",
      description: "Autenticación robusta y gestión de permisos centralizada"
    },
    {
      icon: FiTrendingUp,
      title: "Crecimiento Conectado",
      description: "Métricas, comisiones y resultados sincronizados en tiempo real"
    },
    {
      icon: FiZap,
      title: "Acceso Instantáneo",
      description: "Conecta con todas las plataformas sin múltiples inicios de sesión"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            MUNDERO es el núcleo digital del{' '}
            <span className="bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
              Grupo Servat
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Desde aquí gestionas tus accesos, proyectos, referidos, comisiones y conexiones entre empresas.
            <br />
            <span className="font-semibold text-slate-800">Todo integrado. Todo conectado. Todo bajo control.</span>
          </p>
        </motion.div>

        {/* Constellation Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex justify-center mb-20"
        >
          <div className="relative w-96 h-96">
            {/* Central MUNDERO Hub */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-2xl z-10"
            >
              <span className="text-white font-bold text-2xl">M</span>
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
            </motion.div>

            {/* Satellite Companies */}
            {[
              { name: 'LEGALTY', color: 'from-emerald-500 to-emerald-700', position: { x: -120, y: -80 } },
              { name: 'WE CONSULTING', color: 'from-purple-500 to-purple-700', position: { x: 120, y: -80 } },
              { name: 'PITAHAYA', color: 'from-orange-500 to-orange-700', position: { x: -120, y: 80 } },
              { name: 'PORTALES', color: 'from-pink-500 to-pink-700', position: { x: 120, y: 80 } }
            ].map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
                className={`absolute w-16 h-16 bg-gradient-to-br ${company.color} rounded-xl flex items-center justify-center shadow-lg`}
                style={{
                  left: `calc(50% + ${company.position.x}px)`,
                  top: `calc(50% + ${company.position.y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span className="text-white font-bold text-sm">
                  {company.name.charAt(0)}
                </span>
              </motion.div>
            ))}

            {/* Connection Lines */}
            {[
              { from: { x: 0, y: 0 }, to: { x: -120, y: -80 } },
              { from: { x: 0, y: 0 }, to: { x: 120, y: -80 } },
              { from: { x: 0, y: 0 }, to: { x: -120, y: 80 } },
              { from: { x: 0, y: 0 }, to: { x: 120, y: 80 } }
            ].map((line, index) => {
              const angle = Math.atan2(line.to.y - line.from.y, line.to.x - line.from.x) * (180 / Math.PI);
              const length = Math.sqrt(Math.pow(line.to.x - line.from.x, 2) + Math.pow(line.to.y - line.from.y, 2));

              return (
                <motion.div
                  key={`line-${index}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                  className="absolute h-0.5 bg-gradient-to-r from-blue-400 to-amber-400 opacity-60"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${length - 48}px`,
                    transformOrigin: 'left center',
                    transform: `rotate(${angle}deg) translateY(-50%)`
                  }}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 transform group-hover:scale-110">
                <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};