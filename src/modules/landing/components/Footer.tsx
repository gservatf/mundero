import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Main Footer Content - LinkedIn style */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          
          {/* General */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">General</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Registrarse</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Centro de ayuda</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Acerca de</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Blog</a></li>
            </ul>
          </div>

          {/* Explorar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Explorar</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Empresas</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Profesionales</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Aplicaciones</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Integraciones</a></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Grupo Servat</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Carreras</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Prensa</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Inversionistas</a></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">API</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Documentación</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Soporte</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Estado</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Privacidad</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Términos</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Cookies</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Accesibilidad</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-sm text-gray-600">
              © {currentYear} MUNDERO Corporation
            </span>
          </div>

          {/* Language and Region */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <button className="hover:text-blue-600">Español (España)</button>
            <span>•</span>
            <span>Grupo Servat</span>
          </div>
        </div>
      </div>
    </footer>
  );
};