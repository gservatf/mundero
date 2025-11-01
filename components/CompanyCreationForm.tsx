import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiHome,
  FiCheck,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";

interface CompanyFormData {
  nombre: string;
  razonSocial: string;
  ruc: string;
  sector: string;
  direccion: string;
  telefono: string;
  email: string;
  representanteLegal: string;
  empleados: number;
  descripcion: string;
  sitioWeb: string;
  notasContexto: string;
  empresaInteres: string;
}

interface CompanyCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => void;
}

const CompanyCreationForm: React.FC<CompanyCreationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    nombre: "",
    razonSocial: "",
    ruc: "",
    sector: "",
    direccion: "",
    telefono: "",
    email: "",
    representanteLegal: "",
    empleados: 1,
    descripcion: "",
    sitioWeb: "",
    notasContexto: "",
    empresaInteres: "",
  });

  const validateRUC = (ruc: string): boolean => {
    if (!/^\d{11}$/.test(ruc)) return false;
    const validPrefixes = ["10", "15", "17", "20"];
    const prefix = ruc.substring(0, 2);
    return validPrefixes.includes(prefix);
  };

  const handleInputChange = (field: keyof CompanyFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!validateRUC(formData.ruc)) {
      toast.error(
        "RUC inválido. Debe tener 11 dígitos y comenzar con 10, 15, 17 o 20",
      );
      return;
    }

    if (!formData.nombre || !formData.ruc || !formData.telefono) {
      toast.error(
        "Por favor completa los campos obligatorios: Nombre, RUC y Teléfono",
      );
      return;
    }

    onSubmit(formData);
    toast.success(
      "Empresa registrada exitosamente. Estado: En Proceso - Pendiente de validación por MUNDERO.",
    );
    onClose();

    // Reset form
    setFormData({
      nombre: "",
      razonSocial: "",
      ruc: "",
      sector: "",
      direccion: "",
      telefono: "",
      email: "",
      representanteLegal: "",
      empleados: 1,
      descripcion: "",
      sitioWeb: "",
      notasContexto: "",
      empresaInteres: "",
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Registrar Nueva Empresa</h2>
              <p className="text-blue-100">
                Completa la información básica de tu empresa
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FiHome className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Registro Simplificado
                  </h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Solo necesitas completar la información básica. Los
                    documentos se subirán posteriormente a través del panel de
                    administración de MUNDERO.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Comercial *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ej: TechSolutions SAC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RUC *
                </label>
                <input
                  type="text"
                  value={formData.ruc}
                  onChange={(e) => handleInputChange("ruc", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="20123456789"
                  maxLength={11}
                />
                {formData.ruc && !validateRUC(formData.ruc) && (
                  <p className="text-red-600 text-sm mt-1">RUC inválido</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón Social
                </label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) =>
                    handleInputChange("razonSocial", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Technology Solutions Sociedad Anónima Cerrada"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleInputChange("sector", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Seleccionar sector</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Construcción">Construcción</option>
                  <option value="Consultoría">Consultoría</option>
                  <option value="Manufactura">Manufactura</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Comercio">Comercio</option>
                  <option value="Salud">Salud</option>
                  <option value="Educación">Educación</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Empleados
                </label>
                <input
                  type="number"
                  value={formData.empleados}
                  onChange={(e) =>
                    handleInputChange(
                      "empleados",
                      parseInt(e.target.value) || 1,
                    )
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) =>
                      handleInputChange("direccion", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Av. Javier Prado Este 4200, San Isidro, Lima"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      handleInputChange("telefono", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="+51 1 234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Corporativo
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Representante Legal
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.representanteLegal}
                    onChange={(e) =>
                      handleInputChange("representanteLegal", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Nombre completo del representante"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={formData.sitioWeb}
                  onChange={(e) =>
                    handleInputChange("sitioWeb", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="https://www.empresa.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de la Empresa
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    handleInputChange("descripcion", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Describe brevemente las actividades principales de tu empresa..."
                />
              </div>

              {/* Nueva sección de contexto e interés */}
              <div className="md:col-span-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <FiFileText className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">
                        Información de Contexto
                      </h4>
                      <p className="text-green-700 text-sm mt-1">
                        Ayúdanos a entender mejor tu situación y necesidades
                        empresariales.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿En qué empresa estás interesado/a trabajar o colaborar?
                </label>
                <input
                  type="text"
                  value={formData.empresaInteres}
                  onChange={(e) =>
                    handleInputChange("empresaInteres", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ej: Legalty, We Consulting, Portales, Pitahaya, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas de Contexto
                </label>
                <textarea
                  value={formData.notasContexto}
                  onChange={(e) =>
                    handleInputChange("notasContexto", e.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Comparte cualquier información adicional que consideres relevante: objetivos, necesidades específicas, proyectos en mente, expectativas, etc."
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">
                Proceso de Validación
              </h4>
              <div className="space-y-2 text-sm text-yellow-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>
                    <strong>Paso 1:</strong> Registro inicial (Estado: En
                    Proceso)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>
                    <strong>Paso 2:</strong> El equipo MUNDERO revisará tu
                    información y contexto
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    <strong>Paso 3:</strong> Validación final (Estado: Validada
                    o Rechazada)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between">
            <div className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Campos obligatorios
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Registrar Empresa
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CompanyCreationForm;
