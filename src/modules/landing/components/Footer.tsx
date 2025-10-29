import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          
          {/* General */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">General</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Registrarse</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Centro de ayuda</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Acerca de</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Blog</a></li>
            </ul>
          </div>

          {/* Explorar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Explorar</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Empresas</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Profesionales</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Aplicaciones</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Integraciones</a></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Grupo Servat</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Carreras</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Prensa</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Inversionistas</a></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">API</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Documentación</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Soporte</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Estado</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Privacidad</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Términos</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Cookies</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">Accesibilidad</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          
          {/* Logo + Copyright */}
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} MUNDERO · Grupo Servat
            </span>
          </div>

          {/* Language / Region */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <button className="hover:text-blue-600 dark:hover:text-blue-400">
              Español (Latinoamérica)
            </button>
            <span>•</span>
            <span>Versión 2.1</span>
          </div>
        </div>

      </div>
    </footer>
  );
};