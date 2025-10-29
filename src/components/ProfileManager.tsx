import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLinkedin, FiGlobe, FiEdit3, FiSave, FiX, FiCamera, FiHome, FiAward, FiBook } from 'react-icons/fi';
import { useMockAuth } from '../hooks/useMockData';
import toast from 'react-hot-toast';

const ProfileManager = () => {
  const { user } = useMockAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    personal: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      phone: '+51 999 888 777',
      location: 'Lima, Perú',
      bio: 'Profesional especializado en desarrollo de negocios y consultoría estratégica con más de 5 años de experiencia en el sector.',
      website: 'https://miportfolio.com',
      linkedin: 'https://linkedin.com/in/usuario-demo'
    },
    professional: {
      title: 'Consultor Senior de Negocios',
      company: user?.empresa?.nombre || '',
      experience: '5+ años',
      skills: ['Consultoría Estratégica', 'Desarrollo de Negocios', 'Gestión de Proyectos', 'Análisis Financiero'],
      certifications: ['PMP Certified', 'Lean Six Sigma Green Belt', 'Scrum Master'],
      education: 'MBA en Administración de Empresas - Universidad del Pacífico'
    },
    visibility: {
      profilePublic: true,
      showEmail: false,
      showPhone: false,
      showCompany: true,
      allowMessages: true
    }
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Perfil actualizado correctamente');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    toast('Cambios cancelados');
  };

  const tabs = [
    { id: 'personal', label: 'Información Personal', icon: FiUser },
    { id: 'professional', label: 'Perfil Profesional', icon: FiHome },
    { id: 'visibility', label: 'Privacidad', icon: FiGlobe }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Perfil</h3>
          <p className="text-sm text-gray-600">Administra tu información personal y profesional</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiX className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSave className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiEdit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Preview Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.personal.displayName)}&background=6366f1&color=fff&size=128`}
              alt={profileData.personal.displayName}
              className="w-24 h-24 rounded-full"
            />
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <FiCamera className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{profileData.personal.displayName}</h2>
            <p className="text-blue-600 font-medium">{profileData.professional.title}</p>
            <p className="text-gray-600">{profileData.professional.company}</p>
            <p className="text-sm text-gray-500 mt-2">{profileData.personal.bio}</p>
            
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center">
                <FiMapPin className="w-4 h-4 mr-1" />
                {profileData.personal.location}
              </span>
              <span className="flex items-center">
                <FiHome className="w-4 h-4 mr-1" />
                {profileData.professional.experience}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'personal' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={profileData.personal.displayName}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      personal: { ...profileData.personal, displayName: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={profileData.personal.email}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      personal: { ...profileData.personal, email: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={profileData.personal.phone}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      personal: { ...profileData.personal, phone: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={profileData.personal.location}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      personal: { ...profileData.personal, location: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografía profesional
                </label>
                <textarea
                  value={profileData.personal.bio}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    personal: { ...profileData.personal, bio: e.target.value }
                  })}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Describe tu experiencia y especialidades profesionales..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sitio web
                </label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="url"
                    value={profileData.personal.website}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      personal: { ...profileData.personal, website: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <div className="relative">
                  <FiLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="url"
                    value={profileData.personal.linkedin}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      personal: { ...profileData.personal, linkedin: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Perfil Profesional</h4>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título profesional
                  </label>
                  <input
                    type="text"
                    value={profileData.professional.title}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      professional: { ...profileData.professional, title: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Años de experiencia
                  </label>
                  <input
                    type="text"
                    value={profileData.professional.experience}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      professional: { ...profileData.professional, experience: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Educación
                </label>
                <div className="relative">
                  <FiBook className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    value={profileData.professional.education}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      professional: { ...profileData.professional, education: e.target.value }
                    })}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habilidades principales
                </label>
                <div className="flex flex-wrap gap-2">
                  {profileData.professional.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {isEditing && (
                    <button className="px-3 py-1 border-2 border-dashed border-gray-300 text-gray-500 text-sm rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors">
                      + Agregar habilidad
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificaciones
                </label>
                <div className="space-y-2">
                  {profileData.professional.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FiAward className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-900">{cert}</span>
                    </div>
                  ))}
                  {isEditing && (
                    <button className="w-full p-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                      + Agregar certificación
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visibility' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Configuración de Privacidad</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Perfil público</h5>
                  <p className="text-sm text-gray-600">Permite que otros usuarios vean tu perfil completo</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.visibility.profilePublic}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      visibility: { ...profileData.visibility, profilePublic: e.target.checked }
                    })}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Mostrar email</h5>
                  <p className="text-sm text-gray-600">Permite que otros usuarios vean tu correo electrónico</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.visibility.showEmail}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      visibility: { ...profileData.visibility, showEmail: e.target.checked }
                    })}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Mostrar teléfono</h5>
                  <p className="text-sm text-gray-600">Permite que otros usuarios vean tu número de teléfono</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.visibility.showPhone}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      visibility: { ...profileData.visibility, showPhone: e.target.checked }
                    })}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Permitir mensajes</h5>
                  <p className="text-sm text-gray-600">Permite que otros usuarios te envíen mensajes directos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.visibility.allowMessages}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      visibility: { ...profileData.visibility, allowMessages: e.target.checked }
                    })}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileManager;