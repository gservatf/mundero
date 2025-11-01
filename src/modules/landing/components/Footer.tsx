import React from "react";
import munderoLogo from "@/assets/logos/mundero/logo-echado-azul.png";
import grupoServatLogo from "@/assets/logos/empresas/logo-grupo-servat.png";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Columna izquierda: logos */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={munderoLogo}
            alt="Mundero Logo"
            className="w-40 opacity-90 hover:opacity-100 transition"
          />
          <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
          <img
            src={grupoServatLogo}
            alt="Grupo Servat"
            className="w-36 opacity-80 hover:opacity-100 transition"
          />
        </div>

        {/* Columna central: info corporativa */}
        <div className="text-center md:text-left">
          <p className="text-gray-700 font-medium">
            Grupo Servat – Ecosistema Empresarial Integrado
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Av. San Luis 2792, San Borja, Lima – Perú
          </p>
          <p className="text-gray-600 text-sm mt-1">
            <a
              href="mailto:contacto@mundero.net"
              className="hover:text-blue-600"
            >
              contacto@mundero.net
            </a>
          </p>
        </div>

        {/* Columna derecha: enlace */}
        <div className="text-center md:text-right">
          <a
            href="https://servat.work"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-blue-600 font-semibold hover:text-blue-700 transition"
          >
            servat.work
          </a>
          <p className="text-gray-500 text-xs mt-1">
            © {new Date().getFullYear()} Grupo Servat. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
