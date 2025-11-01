import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAgreement } from "../hooks/useAgreement";
import AgreementModal from "../components/AgreementModal";
import {
  FiPlus,
  FiUsers,
  FiClock,
  FiCheck,
  FiX,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

export const Referrals: React.FC = () => {
  const { requiresAgreement } = useAgreement();

  // Hooks siempre al nivel superior
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReferral, setNewReferral] = useState({
    companyRuc: "",
    contactName: "",
    contactEmail: "",
    opportunity: "",
    targetApp: "LEGALTY",
  });

  // Control de acceso - bloquear si requiere acuerdo
  if (requiresAgreement) {
    return <AgreementModal isOpen={true} onClose={() => {}} />;
  }

  // Mock contract text
  const contractText = `CONTRATO DE REFERIDOS - MUNDERO

Por el presente documento, yo acepto los términos y condiciones para participar en el programa de referidos de MUNDERO, comprometiéndome a:

1. Proporcionar información veraz y actualizada
2. Respetar las políticas de confidencialidad
3. Cumplir con los estándares éticos profesionales
4. Mantener la calidad en las referencias proporcionadas

Las comisiones se calcularán según la tabla vigente y serán pagadas mensualmente.

Fecha: ${new Date().toLocaleDateString()}
Versión del contrato: 2.1`;

  const referrals = [
    {
      id: 1,
      companyRuc: "20123456789",
      companyName: "Empresa Demo SAC",
      contact: "Juan Pérez",
      targetApp: "LEGALTY",
      status: "Seguimiento",
      createdAt: "2024-01-15",
      expiresAt: "2024-04-15",
    },
  ];

  const handleSignContract = () => {
    // TODO: Save contract signature to Firebase
    setContractSigned(true);
    setShowContractModal(false);
  };

  const handleCreateReferral = () => {
    if (!contractSigned) {
      setShowContractModal(true);
      return;
    }
    // TODO: Create referral in Firebase
    console.log("Creating referral:", newReferral);
    setShowCreateForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nuevo":
        return "bg-blue-100 text-blue-800";
      case "Seguimiento":
        return "bg-yellow-100 text-yellow-800";
      case "Cliente":
        return "bg-green-100 text-green-800";
      case "Vencido":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Referidos y Comisiones
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus referencias y gana comisiones
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Nuevo Referido</span>
        </button>
      </div>

      {/* Contract Modal */}
      {showContractModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contrato Digital de Referidos
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-60 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {contractText}
              </pre>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowContractModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSignContract}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Acepto las condiciones y firmo digitalmente
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Create Referral Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nuevo Referido
            </h2>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="RUC de la empresa"
                value={newReferral.companyRuc}
                onChange={(e) =>
                  setNewReferral((prev) => ({
                    ...prev,
                    companyRuc: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre del contacto"
                  value={newReferral.contactName}
                  onChange={(e) =>
                    setNewReferral((prev) => ({
                      ...prev,
                      contactName: e.target.value,
                    }))
                  }
                  className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email del contacto"
                  value={newReferral.contactEmail}
                  onChange={(e) =>
                    setNewReferral((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                  className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={newReferral.targetApp}
                onChange={(e) =>
                  setNewReferral((prev) => ({
                    ...prev,
                    targetApp: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="LEGALTY">LEGALTY</option>
                <option value="WE CONSULTING">WE CONSULTING</option>
                <option value="STUDIO41">STUDIO41</option>
                <option value="PORTALES">PORTALES</option>
                <option value="PITAHAYA">PITAHAYA</option>
              </select>
              <textarea
                placeholder="Descripción de la oportunidad"
                value={newReferral.opportunity}
                onChange={(e) =>
                  setNewReferral((prev) => ({
                    ...prev,
                    opportunity: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateReferral}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Referido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Referidos</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <FiClock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Convertidos</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Comisiones</p>
              <p className="text-2xl font-bold text-gray-900">$2,450</p>
            </div>
            <FiDollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Mis Referidos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  App Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {referral.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.companyRuc}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {referral.contact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {referral.targetApp}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(referral.status)}`}
                    >
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{referral.expiresAt}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
