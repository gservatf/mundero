import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';

export const ValueSection: React.FC = () => {
  const benefits = [
    {
      icon: FiUsers,
      title: 'Red Profesional',
      description: 'Conecta con profesionales de todo el ecosistema Grupo Servat'
    },
    {
      icon: FiShield,
      title: 'Seguridad Total',
      description: 'Autenticación segura y protección de datos empresariales'
    },
    {
      icon: FiTrendingUp,
      title: 'Crecimiento',
      description: 'Accede a oportunidades de desarrollo y expansión'
    },
    {
      icon: FiZap,
      title: 'Integración',
      description: 'Sincronización automática con todas las plataformas'
    }
  ];

  const companies = [
    { name: 'LEGALTY', position: { x: 20, y: 30 }, color: 'bg-green-500' },
    { name: 'WE CONSULTING', position: { x: 70, y: 20 }, color: 'bg-purple-500' },
    { name: 'PITAHAYA', position: { x: 80, y: 70 }, color: 'bg-orange-500' },
    { name: 'PORTALES', position: { x: 30, y: 80 }, color: 'bg-blue-500' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            El ecosistema que potencia tu{' '}
            <span className="text-blue-600">crecimiento profesional</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una constelación de empresas y servicios diseñados para impulsar tu carrera
          </p>
        </motion.div>

        {/* Constellation Interactive */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-80 mb-20 bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Central Hub - MUNDERO */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-2xl"
            >
              <span className="text-white font-bold text-2xl">M</span>
            </motion.div>
          </div>

          {/* Satellite Companies */}
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.1 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${company.position.x}%`,
                top: `${company.position.y}%`
              }}
            >
              <div className={`w-16 h-16 ${company.color} rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-xs text-center leading-tight">
                  {company.name.split(' ')[0]}
                </span>
              </div>
              
              {/* Connection line to center */}
              <svg
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  width: `${Math.abs(50 - company.position.x) * 6}px`,
                  height: `${Math.abs(50 - company.position.y) * 6}px`
                }}
              >
                <line
                  x1="0"
                  y1="0"
                  x2={`${(50 - company.position.x) * 6}`}
                  y2={`${(50 - company.position.y) * 6}`}
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                  strokeDasharray="5,5"
                />
              </svg>
            </motion.div>
          ))}

          {/* Background particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <benefit.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};