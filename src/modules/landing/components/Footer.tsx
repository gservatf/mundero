import React from 'react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white border-t border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="text-gray-600 text-sm font-medium">
            © {currentYear} MUNDERO · Grupo Servat
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-8">
            <a 
              href="#privacy" 
              className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
            >
              Política de privacidad
            </a>
            <a 
              href="#terms" 
              className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
            >
              Términos
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};