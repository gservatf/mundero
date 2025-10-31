import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAgreement } from '../hooks/useAgreement';
import AgreementModal from '../components/AgreementModal';
import {
  FiPlus,
  FiTarget,
  FiClock,
  FiCheck,
  FiX,
  FiEdit3,
  FiCalendar,
  FiPhone,
  FiMail
} from 'react-icons/fi';

export const LeadCenter: React.FC = () => {
  const { requiresAgreement } = useAgreement();

  // Control de acceso - bloquear si requiere acuerdo
  if (requiresAgreement) {
    return <AgreementModal isOpen={true} onClose={() => { }} />;
  }

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLead, setNewLead] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    status: 'Nuevo',
    notes: '',
    followUpDate: ''
  });

  const leads = [
    {
      id: 1,
      company: 'TechCorp SAC',
      contact: 'María González',
      email: 'maria@techcorp.com',
      phone: '+51 999 888 777',
      status: 'Seguimiento',
      notes: 'Interesada en servicios de LEGALTY',
      createdAt: '2024-01-15',
      followUpDate: '2024-01-25',
      lastActivity: '2024-01-20'
    },
    {
      id: 2,
      company: 'StartupXYZ',
      contact: 'Carlos Mendoza',
      email: 'carlos@startupxyz.com',
      phone: '+51 888 777 666',
      status: 'Nuevo',
      notes: 'Necesita consultoría empresarial',
      createdAt: '2024-01-18',
      followUpDate: '2024-01-22',
      lastActivity: '2024-01-18'
    }
  ];

  const handleCreateLead = () => {
    // TODO: Create lead in Firebase
    console.log('Creating lead:', newLead);
    setShowCreateForm(false);
    setNewLead({
      company: '',
      contact: '',
      email: '',
      phone: '',
      status: 'Nuevo',
      notes: '',
      followUpDate: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nuevo': return 'bg-blue-100 text-blue-800';
      case 'Seguimiento': return 'bg-yellow-100 text-yellow-800';
      case 'Calificado': return 'bg-green-100 text-green-800';
      case 'Cliente': return 'bg-purple-100 text-purple-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Nuevo': return <FiTarget className="w-4 h-4" />;
      case 'Seguimiento': return <FiClock className="w-4 h-4" />;
      case 'Calificado': return <FiCheck className="w-4 h-4" />;
      case 'Cliente': return <FiCheck className="w-4 h-4" />;
      case 'Vencido': return <FiX className="w-4 h-4" />;
      default: return <FiTarget className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Leads</h1>
          <p className="text-gray-600 mt-2">Gestiona tus oportunidades de negocio</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Nuevo Lead</span>
        </button>
      </div>

      {/* Create Lead Modal */}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Lead</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Nombre de la empresa"
                value={newLead.company}
                onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Persona de contacto"
                value={newLead.contact}
                onChange={(e) => setNewLead(prev => ({ ...prev, contact: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={newLead.email}
                onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={newLead.phone}
                onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newLead.status}
                onChange={(e) => setNewLead(prev => ({ ...prev, status: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Seguimiento">Seguimiento</option>
                <option value="Calificado">Calificado</option>
              </select>
              <input
                type="date"
                placeholder="Fecha de seguimiento"
                value={newLead.followUpDate}
                onChange={(e) => setNewLead(prev => ({ ...prev, followUpDate: e.target.value }))}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              placeholder="Notas adicionales"
              value={newLead.notes}
              onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-6"
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
                onClick={handleCreateLead}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Lead
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
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            </div>
            <FiTarget className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Seguimiento</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(lead => lead.status === 'Seguimiento').length}
              </p>
            </div>
            <FiClock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Calificados</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(lead => lead.status === 'Calificado').length}
              </p>
            </div>
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Convertidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(lead => lead.status === 'Cliente').length}
              </p>
            </div>
            <FiCheck className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leads.map((lead, index) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Lead Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{lead.company}</h3>
                <p className="text-gray-600">{lead.contact}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                  {getStatusIcon(lead.status)}
                  <span>{lead.status}</span>
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <FiEdit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiMail className="w-4 h-4" />
                <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiPhone className="w-4 h-4" />
                <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                  {lead.phone}
                </a>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <p className="text-sm text-gray-700">{lead.notes}</p>
            </div>

            {/* Timeline */}
            <div className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span>Creado:</span>
                <span>{lead.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Última actividad:</span>
                <span>{lead.lastActivity}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <FiCalendar className="w-3 h-3" />
                  <span>Próximo seguimiento:</span>
                </div>
                <span className="font-medium text-blue-600">{lead.followUpDate}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};