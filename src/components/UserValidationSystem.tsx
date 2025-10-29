import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiShield, FiCheck, FiX, FiStar, FiAward, FiEye, FiMessageCircle, 
  FiUserPlus, FiUserCheck, FiAlertTriangle, FiFlag, FiThumbsUp, FiThumbsDown
} from 'react-icons/fi';
import { useMockAuth } from '../hooks/useMockData';
import toast from 'react-hot-toast';

interface ValidationRequest {
  id: string;
  requester: {
    name: string;
    title: string;
    company: string;
    avatar: string;
    mutualConnections: number;
  };
  validator: {
    name: string;
    title: string;
    company: string;
    avatar: string;
  };
  type: 'skill' | 'experience' | 'recommendation' | 'endorsement';
  content: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  evidence?: {
    type: 'document' | 'project' | 'certificate';
    title: string;
    url: string;
  }[];
}

interface UserEndorsement {
  id: string;
  endorser: {
    name: string;
    title: string;
    company: string;
    avatar: string;
    verified: boolean;
  };
  skill: string;
  message: string;
  rating: number;
  timestamp: string;
  isPublic: boolean;
}

const UserValidationSystem = () => {
  const { user } = useMockAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [showValidationModal, setShowValidationModal] = useState<ValidationRequest | null>(null);
  const [showEndorseModal, setShowEndorseModal] = useState(false);

  const [validationRequests] = useState<ValidationRequest[]>([
    {
      id: '1',
      requester: {
        name: 'Carlos Mendoza',
        title: 'CEO',
        company: 'Constructora Lima SAC',
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=f59e0b&color=fff',
        mutualConnections: 12
      },
      validator: {
        name: user?.displayName || 'Usuario Demo',
        title: 'Consultor Senior',
        company: user?.empresa?.nombre || 'Empresa Demo',
        avatar: user?.photoURL || 'https://ui-avatars.com/api/?name=Usuario+Demo&background=6366f1&color=fff'
      },
      type: 'experience',
      content: 'Liderazgo de proyecto de transformación digital',
      details: 'Carlos solicita validación de su experiencia liderando el proyecto de transformación digital en el sector construcción, donde trabajamos juntos durante 8 meses implementando soluciones tecnológicas innovadoras.',
      status: 'pending',
      timestamp: 'Hace 2 horas',
      evidence: [
        {
          type: 'project',
          title: 'Proyecto TransformaTech - Constructora Lima',
          url: 'https://drive.google.com/project/123'
        },
        {
          type: 'certificate',
          title: 'Certificado de Finalización del Proyecto',
          url: 'https://drive.google.com/cert/456'
        }
      ]
    },
    {
      id: '2',
      requester: {
        name: 'Ana Rodriguez',
        title: 'Tech Entrepreneur',
        company: 'StartupTech',
        avatar: 'https://ui-avatars.com/api/?name=Ana+Rodriguez&background=8b5cf6&color=fff',
        mutualConnections: 8
      },
      validator: {
        name: user?.displayName || 'Usuario Demo',
        title: 'Consultor Senior',
        company: user?.empresa?.nombre || 'Empresa Demo',
        avatar: user?.photoURL || 'https://ui-avatars.com/api/?name=Usuario+Demo&background=6366f1&color=fff'
      },
      type: 'skill',
      content: 'Estrategia de Negocios Digitales',
      details: 'Ana busca validación de sus habilidades en estrategia de negocios digitales basada en nuestra colaboración en el desarrollo de su startup tecnológica.',
      status: 'pending',
      timestamp: 'Hace 5 horas',
      evidence: [
        {
          type: 'document',
          title: 'Plan Estratégico StartupTech 2024',
          url: 'https://drive.google.com/doc/789'
        }
      ]
    }
  ]);

  const [endorsements] = useState<UserEndorsement[]>([
    {
      id: '1',
      endorser: {
        name: 'María González',
        title: 'Directora de Operaciones',
        company: 'Consulting Pro EIRL',
        avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff',
        verified: true
      },
      skill: 'Consultoría Estratégica',
      message: 'Excelente profesional con gran capacidad analítica y visión estratégica. Su trabajo en nuestro proyecto de optimización de procesos fue excepcional.',
      rating: 5,
      timestamp: 'Hace 1 semana',
      isPublic: true
    },
    {
      id: '2',
      endorser: {
        name: 'Roberto Silva',
        title: 'Gerente General',
        company: 'Innovación Corp',
        avatar: 'https://ui-avatars.com/api/?name=Roberto+Silva&background=6366f1&color=fff',
        verified: true
      },
      skill: 'Gestión de Proyectos',
      message: 'Liderazgo excepcional y capacidad para entregar resultados en tiempo y forma. Altamente recomendado para proyectos complejos.',
      rating: 5,
      timestamp: 'Hace 2 semanas',
      isPublic: true
    }
  ]);

  const handleValidation = (requestId: string, action: 'approve' | 'reject', message?: string) => {
    if (action === 'approve') {
      toast.success('Validación aprobada correctamente');
    } else {
      toast.error('Validación rechazada');
    }
    setShowValidationModal(null);
  };

  const tabs = [
    { id: 'received', label: 'Solicitudes Recibidas', icon: FiUser, count: validationRequests.filter(r => r.status === 'pending').length },
    { id: 'sent', label: 'Solicitudes Enviadas', icon: FiUserPlus, count: 3 },
    { id: 'endorsements', label: 'Mis Validaciones', icon: FiAward, count: endorsements.length },
    { id: 'request', label: 'Solicitar Validación', icon: FiMessageCircle, count: 0 }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill': return <FiStar className="w-4 h-4 text-blue-500" />;
      case 'experience': return <FiUser className="w-4 h-4 text-green-500" />;
      case 'recommendation': return <FiThumbsUp className="w-4 h-4 text-purple-500" />;
      case 'endorsement': return <FiAward className="w-4 h-4 text-yellow-500" />;
      default: return <FiUser className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'skill': return 'Habilidad';
      case 'experience': return 'Experiencia';
      case 'recommendation': return 'Recomendación';
      case 'endorsement': return 'Validación';
      default: return 'Validación';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Sistema de Validaciones</h3>
          <p className="text-gray-600">Valida y obtén validaciones de tu experiencia profesional</p>
        </div>
        <button
          onClick={() => setShowEndorseModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
        >
          <FiUserPlus className="w-5 h-5" />
          <span className="font-medium">Solicitar Validación</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium">Validaciones Recibidas</p>
              <p className="text-2xl font-bold text-blue-900">{endorsements.length}</p>
            </div>
            <FiAward className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Solicitudes Pendientes</p>
              <p className="text-2xl font-bold text-green-900">{validationRequests.filter(r => r.status === 'pending').length}</p>
            </div>
            <FiUser className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-medium">Rating Promedio</p>
              <p className="text-2xl font-bold text-purple-900">4.9</p>
            </div>
            <FiStar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 font-medium">Credibilidad</p>
              <p className="text-2xl font-bold text-orange-900">95%</p>
            </div>
            <FiShield className="w-8 h-8 text-orange-600" />
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
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
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
        {activeTab === 'received' && (
          <div className="space-y-4">
            {validationRequests.filter(r => r.status === 'pending').map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <img
                      src={request.requester.avatar}
                      alt={request.requester.name}
                      className="w-14 h-14 rounded-full ring-2 ring-gray-100"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-gray-900">{request.requester.name}</h4>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{request.timestamp}</span>
                      </div>
                      <p className="text-gray-600 mb-1">{request.requester.title} en {request.requester.company}</p>
                      <p className="text-sm text-gray-500 mb-3">{request.requester.mutualConnections} conexiones en común</p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        {getTypeIcon(request.type)}
                        <span className="font-medium text-gray-900">Solicita validación de {getTypeLabel(request.type).toLowerCase()}: </span>
                        <span className="font-bold text-blue-600">{request.content}</span>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed mb-4">{request.details}</p>
                      
                      {request.evidence && request.evidence.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Evidencia adjunta:</p>
                          <div className="space-y-2">
                            {request.evidence.map((evidence, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <FiEye className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700 flex-1">{evidence.title}</span>
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                  Ver
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-4">
                    <button
                      onClick={() => setShowValidationModal(request)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Revisar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'endorsements' && (
          <div className="space-y-4">
            {endorsements.map((endorsement) => (
              <div key={endorsement.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={endorsement.endorser.avatar}
                      alt={endorsement.endorser.name}
                      className="w-14 h-14 rounded-full ring-2 ring-gray-100"
                    />
                    {endorsement.endorser.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{endorsement.endorser.name}</h4>
                        <p className="text-gray-600">{endorsement.endorser.title} en {endorsement.endorser.company}</p>
                      </div>
                      <span className="text-sm text-gray-500">{endorsement.timestamp}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="font-medium text-gray-900">Validó:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {endorsement.skill}
                      </span>
                      <div className="flex items-center space-x-1">
                        {renderStars(endorsement.rating)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-3">"{endorsement.message}"</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FiEye className="w-4 h-4" />
                          <span>{endorsement.isPublic ? 'Público' : 'Privado'}</span>
                        </span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Compartir validación
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Validation Modal */}
      <AnimatePresence>
        {showValidationModal && (
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
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Revisar Solicitud de Validación</h3>
                <button
                  onClick={() => setShowValidationModal(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Requester Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={showValidationModal.requester.avatar}
                    alt={showValidationModal.requester.name}
                    className="w-16 h-16 rounded-full ring-2 ring-gray-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{showValidationModal.requester.name}</h4>
                    <p className="text-gray-600">{showValidationModal.requester.title}</p>
                    <p className="text-gray-500">{showValidationModal.requester.company}</p>
                  </div>
                </div>

                {/* Validation Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(showValidationModal.type)}
                    <span className="font-medium text-gray-900">Tipo de validación:</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {getTypeLabel(showValidationModal.type)}
                    </span>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Solicita validación de:</h5>
                    <p className="text-lg font-bold text-blue-600">{showValidationModal.content}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Detalles:</h5>
                    <p className="text-gray-700 leading-relaxed">{showValidationModal.details}</p>
                  </div>
                </div>

                {/* Evidence */}
                {showValidationModal.evidence && showValidationModal.evidence.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Evidencia adjunta:</h5>
                    <div className="space-y-3">
                      {showValidationModal.evidence.map((evidence, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <FiEye className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">{evidence.title}</p>
                              <p className="text-sm text-gray-500 capitalize">{evidence.type}</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Ver documento
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Form */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Tu validación:</h5>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">Calificación:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="text-yellow-400 hover:text-yellow-500">
                          <FiStar className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Escribe tu validación detallada sobre la experiencia o habilidad solicitada..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => handleValidation(showValidationModal.id, 'reject')}
                  className="flex items-center space-x-2 px-6 py-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  <span>Rechazar</span>
                </button>
                <button
                  onClick={() => handleValidation(showValidationModal.id, 'approve')}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Validar</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserValidationSystem;