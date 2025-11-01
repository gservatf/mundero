import React from "react";
import { FiUsers, FiShield, FiTrendingUp, FiZap } from "react-icons/fi";

export const ValueSection: React.FC = () => {
  const benefits = [
    {
      icon: <FiUsers className="w-8 h-8 text-blue-600" />,
      title: "Red Profesional",
      description:
        "Conecta con profesionales, empresas y aliados del ecosistema Grupo Servat.",
    },
    {
      icon: <FiShield className="w-8 h-8 text-blue-600" />,
      title: "Seguridad Total",
      description:
        "Autenticación protegida con Google y control de datos empresariales en la nube.",
    },
    {
      icon: <FiTrendingUp className="w-8 h-8 text-blue-600" />,
      title: "Crecimiento Real",
      description:
        "Accede a oportunidades laborales, alianzas y expansión de tu marca personal.",
    },
    {
      icon: <FiZap className="w-8 h-8 text-blue-600" />,
      title: "Integración Inteligente",
      description:
        "Sincroniza tus datos en todas las plataformas del grupo, sin procesos manuales.",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Tu perfil conectado,{" "}
          <span className="text-blue-600">más poderoso que nunca</span>
        </h2>
        <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">
          Mundero une lo mejor de la tecnología, la identidad profesional y la
          colaboración empresarial en un solo lugar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-center mb-6">{benefit.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
