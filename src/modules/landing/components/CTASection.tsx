import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import munderoLogo from '@/assets/logos/mundero/logo-echado-blanco.png';

export const CTASection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-700 to-blue-500 py-24 text-center text-white">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <img
          src={munderoLogo}
          alt="Mundero Logo"
          className="w-48 mx-auto mb-8 opacity-90"
        />
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Conecta tu perfil, tu negocio y tu futuro en <span className="text-amber-300">un solo click</span>
        </h2>
        <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
          Únete al ecosistema Servat y accede a soluciones que impulsan tu crecimiento profesional.
        </p>

        <button className="inline-flex items-center justify-center gap-3 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition duration-300 shadow-lg">
          Entrar con Google
          <FiArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Fondo decorativo */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
        }}
      ></div>
    </section>
  );
};
