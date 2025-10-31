import React from 'react';
import logoMunderoAzul from '@/assets/logos/mundero/logo-echado-azul.png';
import munderoNetwork from '@/assets/logos/mundero/ilustraciones/mundero.png';

export const HeroSection: React.FC = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-white">
      {/* Izquierda: logo, texto y botón */}
      <div className="max-w-xl">
        <img
          src={logoMunderoAzul}
          alt="Mundero"
          className="w-52 mb-8"
        />

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Conecta tu <span className="text-blue-600">perfil</span>, tus empresas y tus logros en un solo lugar.
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Tu identidad profesional dentro del ecosistema del <strong>Grupo Servat</strong>.
          Accede con un clic, sin barreras ni contraseñas.
        </p>

        {/* Botón Google */}
        <button
          className="flex items-center justify-center gap-3 border border-gray-300 rounded-md px-6 py-3 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition duration-200"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="font-medium text-gray-700">Entrar con Google</span>
        </button>
      </div>

      {/* Derecha: ilustración */}
      <div className="mt-12 md:mt-0 md:ml-10 flex justify-center w-full md:w-auto">
        <img
          src={munderoNetwork}
          alt="Conexiones Mundero"
          className="w-[400px] max-w-full drop-shadow-md"
        />
      </div>
    </section>
  );
};
