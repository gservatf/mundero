import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiExternalLink, FiLock, FiUnlock, FiUsers, FiBarChart, FiMessageSquare, FiCalendar, FiDollarSign } from 'react-icons/fi';

export const IntegrationsSection: React.FC = () => {
  const integrations = [
    {
      name: "Legalty",
      description: "Plataforma legal integral para gestión de casos y documentos jurídicos",
      icon: <FiLock className="w-8 h-8" />,
      color: "from-blue-600 to-blue-800",
      features: ["Gestión de casos", "Documentos legales", "Seguimiento judicial"],
      status: "active"
    },
    {
      name: "We Consulting",
      description: "Consultoría empresarial y estratégica para el crecimiento de tu negocio",
      icon: <FiUsers className="w-8 h-8" />,
      color: "from-green-600 to-green-800",
      features: ["Consultoría estratégica", "Análisis de mercado", "Optimización de procesos"],
      status: "active"
    },
    {
      name: "Pitahaya",
      description: "Sistema de comisiones y referidos para maximizar tus ingresos",
      icon: <FiDollarSign className="w-8 h-8" />,
      color: "from-amber-600 to-amber-800",
      features: ["Gestión de comisiones", "Programa de referidos", "Reportes financieros"],
      status: "active"
    },
    {
      name: "CRM Avanzado",
      description: "Gestión completa de relaciones con clientes y pipeline de ventas",
      icon: <FiBarChart className="w-8 h-8" />,
      color: "from-purple-600 to-purple-800",
      features: ["Seguimiento de leads", "Automatización", "Analytics avanzados"],
      status: "coming-soon"
    },
    {
      name: "Comunicaciones",
      description: "Centro unificado de mensajería y comunicación empresarial",
      icon: <FiMessageSquare className="w-8 h-8" />,
      color: "from-red-600 to-red-800",
      features: ["Chat empresarial", "Videollamadas", "Integración con email"],
      status: "coming-soon"
    },
    {
      name: "Agenda Inteligente",
      description: "Programación y gestión de citas con IA integrada",
      icon: <FiCalendar className="w-8 h-8" />,
      color: "from-indigo-600 to-indigo-800",
      features: ["Scheduling automático", "Recordatorios", "Sincronización"],
      status: "coming-soon"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Un ecosistema{' '}
            <span className="bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
              completo e integrado
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Accede a todas las herramientas del Grupo Servat desde una sola plataforma. 
            Tu identidad profesional conecta con cada aplicación del ecosistema.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-blue-200 relative overflow-hidden group">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${integration.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-white shadow-lg`}>
                      {integration.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.status === 'active' ? (
                        <>
                          <FiUnlock className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            Disponible
                          </span>
                        </>
                      ) : (
                        <>
                          <FiLock className="w-5 h-5 text-amber-500" />
                          <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                            Próximamente
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                    {integration.name}
                  </CardTitle>
                  
                  <CardDescription className="text-slate-600 leading-relaxed">
                    {integration.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="space-y-3 mb-6">
                    {integration.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${integration.color}`}></div>
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant={integration.status === 'active' ? 'default' : 'outline'}
                    className={`w-full ${
                      integration.status === 'active'
                        ? `bg-gradient-to-r ${integration.color} hover:opacity-90 text-white`
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    } transition-all duration-300`}
                    disabled={integration.status !== 'active'}
                  >
                    {integration.status === 'active' ? (
                      <>
                        Acceder ahora
                        <FiExternalLink className="ml-2 w-4 h-4" />
                      </>
                    ) : (
                      'Próximamente'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Integration Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
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
              Una sola identidad, infinitas posibilidades
            </h3>
            
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Con MUNDERO, tu perfil profesional se sincroniza automáticamente en todas las aplicaciones. 
              Datos unificados, experiencia perfecta, resultados extraordinarios.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Perfil Unificado</h4>
                <p className="text-blue-100">Tu información profesional sincronizada en tiempo real</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiBarChart className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Métricas Centralizadas</h4>
                <p className="text-blue-100">Todos tus KPIs y resultados en un solo dashboard</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiUnlock className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Acceso Instantáneo</h4>
                <p className="text-blue-100">Un solo login para todo el ecosistema empresarial</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};