import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAgreement } from '../hooks/useAgreement';
import AgreementModal from '../components/AgreementModal';
import {
  FiPlus,
  FiUsers,
  FiSettings,
  FiExternalLink,
  FiEdit3,
  FiTrash2
} from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';

export const Companies: React.FC = () => {
  const { requiresAgreement } = useAgreement();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Control de acceso - bloquear si requiere acuerdo
  if (requiresAgreement) {
    return <AgreementModal isOpen={true} onClose={() => { }} />;
  }
  const [newCompany, setNewCompany] = useState({
    name: '',
    ruc: '',
    country: 'Perú',
    industry: '',
    description: '',
    logo: '',
    contact: ''
  });

  // Mock data - replace with Firebase data
  const companies = [
    {
      id: 1,
      name: 'Tech Solutions SAC',
      ruc: '20123456789',
      country: 'Perú',
      industry: 'Tecnología',
      role: 'Administrador',
      members: 5,
      integrations: ['LEGALTY', 'WE CONSULTING']
    }
  ];

  const handleCreateCompany = () => {
    // TODO: Implement Firebase creation
    console.log('Creating company:', newCompany);
    setShowCreateForm(false);
    setNewCompany({
      name: '',
      ruc: '',
      country: 'Perú',
      industry: '',
      description: '',
      logo: '',
      contact: ''
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Empresas</h1>
          <p className="text-gray-600 mt-2">Gestiona tus empresas y equipos</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Nueva Empresa</span>
        </button>
      </div>

      {/* Create Company Modal */}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nueva Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Nombre de la empresa"
                value={newCompany.name}
                onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="RUC"
                value={newCompany.ruc}
                onChange={(e) => setNewCompany(prev => ({ ...prev, ruc: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newCompany.country}
                onChange={(e) => setNewCompany(prev => ({ ...prev, country: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Perú">Perú</option>
                <option value="Colombia">Colombia</option>
                <option value="Chile">Chile</option>
              </select>
              <input
                type="text"
                placeholder="Rubro/Industria"
                value={newCompany.industry}
                onChange={(e) => setNewCompany(prev => ({ ...prev, industry: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              placeholder="Descripción de la empresa"
              value={newCompany.description}
              onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCompany}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Empresa
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaBuilding className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.ruc}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <FiEdit3 className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">País:</span>
                <span className="font-medium">{company.country}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Industria:</span>
                <span className="font-medium">{company.industry}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Mi rol:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {company.role}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <FiUsers className="w-4 h-4" />
                <span>{company.members} miembros</span>
              </div>
              <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                <span>Ver detalles</span>
                <FiExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};