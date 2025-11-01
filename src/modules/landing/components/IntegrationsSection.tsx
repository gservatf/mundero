import React from "react";

// Importa todos los logos desde src/assets/logos/empresas/
import weConsultingLogo from "@/assets/logos/empresas/logo-echado-we-consulting.png";
import legalityLogo from "@/assets/logos/empresas/logo-legality.png";
import studio41Logo from "@/assets/logos/empresas/logo-s41.png";
import arkadiamLogo from "@/assets/logos/empresas/logo-ak-arquitectos.png";
import swyftAssistLogo from "@/assets/logos/empresas/logo-swyftassist.png";
import portalesLogo from "@/assets/logos/empresas/logo-portales.png";
import pitahayaLogo from "@/assets/logos/empresas/logo-pithaya.png";
import todoInmuebleLogo from "@/assets/logos/empresas/logo-todoinmueble.png";
import angloAmericanaLogo from "@/assets/logos/empresas/logo-escuela-angloamericana.png";
import grupoServatLogo from "@/assets/logos/empresas/logo-grupo-servat.png";

export const IntegrationsSection: React.FC = () => {
  const integrations = [
    { name: "We Consulting", logo: weConsultingLogo },
    { name: "Legality", logo: legalityLogo },
    { name: "Studio41", logo: studio41Logo },
    { name: "Arkadiam Group", logo: arkadiamLogo },
    { name: "Swyft Assist", logo: swyftAssistLogo },
    { name: "Portales Inmobiliario", logo: portalesLogo },
    { name: "Pitahaya Investments", logo: pitahayaLogo },
    { name: "TodoInmueble.pe", logo: todoInmuebleLogo },
    { name: "Escuela Angloamericana", logo: angloAmericanaLogo },
    { name: "Grupo Servat", logo: grupoServatLogo },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-center">
      <div className="max-w-6xl mx-auto px-6">
        {/* Título */}
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Soluciones integradas del ecosistema{" "}
          <span className="text-blue-600">Servat</span>
        </h2>
        <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">
          Mundero conecta tu perfil profesional con las aplicaciones del grupo.
          Un ecosistema vivo donde cada empresa aporta una solución única.
        </p>

        {/* Grid de logos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10 justify-items-center items-center">
          {integrations.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center justify-center group transition-transform duration-300 hover:scale-105"
            >
              <div className="w-32 h-20 flex items-center justify-center bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition-shadow duration-300">
                <img
                  src={item.logo}
                  alt={item.name}
                  className="max-h-12 object-contain"
                />
              </div>
              <span className="mt-3 text-sm text-gray-700 font-medium group-hover:text-blue-600 transition-colors duration-300">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* CTA inferior */}
        <div className="mt-16">
          <p className="text-gray-500 text-sm">
            Más soluciones se integrarán próximamente en Mundero. El futuro del
            trabajo conectado está en expansión.
          </p>
        </div>
      </div>
    </section>
  );
};
