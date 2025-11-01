import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiDollarSign,
  FiCheck,
  FiClock,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { useMockData, useMockAuth } from "../hooks/useMockData";
import toast from "react-hot-toast";

const ReferralSystem = () => {
  const { referrals } = useMockData();
  const { user } = useMockAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    servicio: "legalty",
    notas: "",
  });

  // Verificar si el usuario está registrado
  const isUserRegistered = user && user.displayName && user.email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUserRegistered) {
      toast.error(
        "Debes estar registrado y tener un perfil completo para hacer referidos",
      );
      return;
    }

    toast.success("Referido registrado correctamente");
    setShowForm(false);
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      empresa: "",
      servicio: "legalty",
      notas: "",
    });
  };

  const handleNewReferralClick = () => {
    if (!isUserRegistered) {
      toast.error(
        "Debes estar registrado y tener un perfil completo para hacer referidos",
      );
      return;
    }
    setShowForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "converted":
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case "pending":
        return <FiClock className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <FiX className="w-4 h-4 text-red-500" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "converted":
        return "Convertido";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return "En proceso";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sistema de Referidos
          </h3>
          <p className="text-sm text-gray-600">
            Gestiona tus referidos y comisiones
          </p>
        </div>
        <button
          onClick={handleNewReferralClick}
          disabled={!isUserRegistered}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isUserRegistered
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <FiPlus className="w-4 h-4" />
          <span>Nuevo Referido</span>
        </button>
      </div>

      {/* Registration Warning */}
      {!isUserRegistered && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">
                Registro Requerido
              </h4>
              <p className="text-yellow-800 text-sm mt-1">
                Para poder hacer referidos, debes estar registrado en la
                plataforma y tener un perfil completo.
                {!user
                  ? " Por favor inicia sesión primero."
                  : ' Completa tu perfil en la sección "Mi Perfil".'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Referidos</p>
              <p className="text-xl font-bold text-gray-900">
                {isUserRegistered ? referrals.length : 0}
              </p>
            </div>
            <FiUser className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Convertidos</p>
              <p className="text-xl font-bold text-green-600">
                {isUserRegistered
                  ? referrals.filter((r) => r.status === "converted").length
                  : 0}
              </p>
            </div>
            <FiCheck className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-xl font-bold text-yellow-600">
                {isUserRegistered
                  ? referrals.filter((r) => r.status === "pending").length
                  : 0}
              </p>
            </div>
            <FiClock className="w-6 h-6 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Comisiones</p>
              <p className="text-xl font-bold text-purple-600">
                {isUserRegistered ? "$2,450" : "$0"}
              </p>
            </div>
            <FiDollarSign className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Mis Referidos</h4>
        </div>
        <div className="divide-y">
          {isUserRegistered ? (
            referrals.length > 0 ? (
              referrals.map((referral) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {referral.nombre.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {referral.nombre}
                        </h5>
                        <p className="text-sm text-gray-500">
                          {referral.email}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400 flex items-center">
                            <FiHome className="w-3 h-3 mr-1" />
                            {referral.empresa}
                          </span>
                          <span className="text-xs text-gray-400">
                            {referral.servicio}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${referral.comisionPotencial}
                        </p>
                        <p className="text-xs text-gray-500">
                          Comisión potencial
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getStatusIcon(referral.status)}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(referral.status)}`}
                        >
                          {getStatusText(referral.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {referral.notas && (
                    <div className="mt-3 pl-14">
                      <p className="text-sm text-gray-600 italic">
                        "{referral.notas}"
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes referidos aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Comienza a referir clientes y gana comisiones por cada
                  conversión exitosa.
                </p>
                <button
                  onClick={handleNewReferralClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hacer mi primer referido
                </button>
              </div>
            )
          ) : (
            <div className="p-8 text-center">
              <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Registro Requerido
              </h3>
              <p className="text-gray-600">
                Debes estar registrado para ver y gestionar tus referidos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Referral Modal */}
      {showForm && isUserRegistered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nuevo Referido
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Referrer Info */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Referidor:</strong> {user?.displayName} ({user?.email})
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Nombre del referido"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="email@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa *
                </label>
                <div className="relative">
                  <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.empresa}
                    onChange={(e) =>
                      setFormData({ ...formData, empresa: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Nombre de la empresa"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio de interés *
                </label>
                <select
                  value={formData.servicio}
                  onChange={(e) =>
                    setFormData({ ...formData, servicio: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  <option value="legalty">Legalty</option>
                  <option value="we_consulting">We Consulting</option>
                  <option value="portales">Portales</option>
                  <option value="pitahaya">Pitahaya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) =>
                    setFormData({ ...formData, notas: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Información adicional sobre el referido..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrar Referido
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReferralSystem;
