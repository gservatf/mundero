import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useAgreement } from '../hooks/useAgreement';
import AgreementModal from '../components/AgreementModal';
import { useReputation } from '../reputation/useReputation';
import { LevelChip } from '../reputation/components/LevelChip';
import { ReputationBar } from '../reputation/components/ReputationBar';
import { BadgesList } from '../reputation/components/BadgesList';
import { REPUTATION_ENABLED } from '../reputation/reputationService';
import { DEFAULT_LEVELS } from '../reputation/types';

// Gamification imports
import { UserLevelDisplay } from '../reputation/UserLevelDisplay';
import { LevelSystemIntegration } from '../reputation/LevelSystemIntegration';
import { useChallenges } from '../reputation/challenges/useChallenges';
import { useDuels } from '../reputation/duels/useDuels';
import { useRewards } from '../reputation/rewards/useRewards';

// Onboarding integration
import { OnboardingProfileSection } from '../onboarding/OnboardingProfileSection';
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiEdit3,
  FiCheck,
  FiX,
  FiPlus,
  FiTrash2,
  FiExternalLink,
  FiAward,
  FiShield,
  FiLock,
  FiFileText,
  FiAlertTriangle,
  FiTrendingUp,
  FiTarget,
  FiZap,
  FiGift,
  FiClock,
  FiUsers,
  FiArrowRight
} from 'react-icons/fi';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { userProfile, updateProfile, loading: profileLoading, error: profileError } = useProfile();
  const {
    requiresAgreement,
    hasSignedAgreement,
    agreementStatus,
    loading: agreementLoading,
    error: agreementError
  } = useAgreement();

  // Hooks siempre al nivel superior - usar ID condicional
  const reputationData = useReputation(REPUTATION_ENABLED && user?.id ? user.id : undefined);
  const userReputation = reputationData?.data || null;
  const reputationLoading = reputationData?.loading || false;

  // Gamification hooks
  const { userChallenges: activeChallenges, loading: challengesLoading } = useChallenges();
  const { userDuels: activeDuels, loading: duelsLoading } = useDuels();
  const { rewards, userStats: rewardsStats, loading: rewardsLoading } = useRewards(user?.id || '');

  const [isEditing, setIsEditing] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [currentAgreementType, setCurrentAgreementType] = useState<'terms_of_service' | 'privacy_policy' | 'data_processing' | 'marketing'>('terms_of_service');

  // Check if agreement is required on mount and when agreement status changes
  useEffect(() => {
    if (requiresAgreement && !agreementLoading) {
      setShowAgreementModal(true);
      setCurrentAgreementType('terms_of_service'); // Start with terms
    }
  }, [requiresAgreement, agreementLoading]);

  const [profileData, setProfileData] = useState({
    displayName: user?.display_name || userProfile?.displayName || '',
    email: user?.email || userProfile?.email || '',
    jobTitle: 'Desarrollador Senior',
    country: 'Perú',
    description: userProfile?.bio || 'Profesional apasionado por la tecnología y la innovación en el ecosistema Grupo Servat.',
    skills: ['React', 'TypeScript', 'Node.js', 'Firebase'],
    experience: [
      {
        id: 1,
        company: 'Grupo Servat',
        position: 'Desarrollador Senior',
        period: '2023 - Presente',
        description: 'Desarrollo de aplicaciones web y móviles'
      }
    ],
    education: [
      {
        id: 1,
        institution: 'Universidad Nacional',
        degree: 'Ingeniería de Sistemas',
        period: '2018 - 2022'
      }
    ],
    certifications: []
  });

  // Update profile data when profile loads
  useEffect(() => {
    if (userProfile) {
      setProfileData(prev => ({
        ...prev,
        displayName: userProfile.displayName || prev.displayName,
        email: userProfile.email || prev.email,
        description: userProfile.bio || prev.description,
      }));
    }
  }, [userProfile]);

  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    period: '',
    description: ''
  });

  const profileCompleteness = () => {
    const fields = [
      profileData.displayName,
      profileData.jobTitle,
      profileData.country,
      profileData.description,
      profileData.skills.length > 0,
      profileData.experience.length > 0
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName: profileData.displayName,
        bio: profileData.description,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_: string, i: number) => i !== index)
    }));
  };

  const handleAgreementModalClose = () => {
    // Only close if all required agreements are signed
    if (!requiresAgreement) {
      setShowAgreementModal(false);
    }
  };

  const completeness = profileCompleteness();

  // Show loading state while checking agreements
  if (agreementLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Show agreement modal if required
  if (requiresAgreement) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acuerdos Requeridos
            </h2>
            <p className="text-gray-600 mb-6">
              Para acceder a tu perfil, necesitas aceptar nuestros términos y condiciones.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-between">
                <span>Términos de Servicio</span>
                {hasSignedAgreement('terms_of_service') ? (
                  <FiCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <FiAlertTriangle className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Política de Privacidad</span>
                {hasSignedAgreement('privacy_policy') ? (
                  <FiCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <FiAlertTriangle className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Procesamiento de Datos</span>
                {hasSignedAgreement('data_processing') ? (
                  <FiCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <FiAlertTriangle className="w-4 h-4 text-amber-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        <AgreementModal
          isOpen={showAgreementModal}
          onClose={handleAgreementModalClose}
          agreementType={currentAgreementType}
        />
      </>
    );
  }

  // Show error state if there are errors
  if (profileError || agreementError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md mx-auto text-center p-8 bg-red-50 rounded-xl border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Error al cargar el perfil
          </h2>
          <p className="text-red-700 mb-4">
            {profileError || agreementError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil Profesional</h1>
          <p className="text-gray-600 mt-2">Gestiona tu identidad profesional en el ecosistema</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiEdit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancelar' : 'Editar Perfil'}</span>
        </button>
      </div>

      {/* Profile Completeness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Completitud del Perfil</h3>
          <span className="text-2xl font-bold text-blue-600">{completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {completeness === 100
            ? '¡Perfil completo! Tienes acceso a todas las funcionalidades.'
            : 'Completa tu perfil para acceder a más funcionalidades.'
          }
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start space-x-6">
              <div className="relative">
                <img
                  src={user?.photo_url || '/default-avatar.png'}
                  alt={profileData.displayName}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre completo"
                    />
                    <input
                      type="text"
                      value={profileData.jobTitle}
                      onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Cargo principal"
                    />
                    <input
                      type="text"
                      value={profileData.country}
                      onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="País"
                    />
                    <textarea
                      value={profileData.description}
                      onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Descripción profesional"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FiCheck className="w-4 h-4" />
                        <span>Guardar</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profileData.displayName}</h2>
                    <p className="text-lg text-gray-600 mt-1">{profileData.jobTitle}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiMail className="w-4 h-4" />
                        <span>{profileData.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiMapPin className="w-4 h-4" />
                        <span>{profileData.country}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-4">{profileData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Habilidades y Competencias</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {profileData.skills.map((skill: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Nueva habilidad"
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <button
                  onClick={handleAddSkill}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Experiencia Laboral</h3>
            <div className="space-y-4">
              {profileData.experience.map((exp) => (
                <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900">{exp.position}</h4>
                  <p className="text-blue-600 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.period}</p>
                  <p className="text-gray-700 mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reputation Widget - Solo si está habilitado */}
          {REPUTATION_ENABLED && userReputation && !reputationLoading && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <FiTrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Reputación</h3>
              </div>

              <div className="space-y-4">
                {/* Nivel actual */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nivel actual</span>
                  <LevelChip
                    level={userReputation.level}
                    name={DEFAULT_LEVELS.find(l => l.id === userReputation.level)?.name || 'Explorador'}
                    size="small"
                  />
                </div>

                {/* Barra de progreso */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progreso</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userReputation.totalPoints} pts
                    </span>
                  </div>
                  <ReputationBar
                    points={userReputation.totalPoints}
                    level={userReputation.level}
                    nextLevelPoints={DEFAULT_LEVELS.find(l => l.id === userReputation.level + 1)?.minPoints}
                    currentLevelPoints={DEFAULT_LEVELS.find(l => l.id === userReputation.level)?.minPoints}
                  />
                </div>

                {/* Badges ganados */}
                {userReputation.badges && userReputation.badges.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Distintivos ganados</span>
                    <BadgesList badges={userReputation.badges} />
                  </div>
                )}

                {/* Estadísticas adicionales */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {userReputation.totalPoints}
                    </div>
                    <div className="text-xs text-gray-500">Puntos totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {userReputation.badges?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Badges</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Onboarding Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <OnboardingProfileSection
              onStartOnboarding={() => {
                // TODO: Implementar navegación al onboarding
                console.log('Starting onboarding...');
              }}
            />
          </motion.div>

          {/* Gamification Dashboard */}
          {REPUTATION_ENABLED && user?.id && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-sm border border-purple-200 p-6 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-700"
            >
              <div className="flex items-center space-x-2 mb-6">
                <FiZap className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-gray-900 text-lg">Gamificación</h3>
              </div>

              {/* Nivel y Experiencia */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FiAward className="w-4 h-4 mr-2 text-yellow-600" />
                  Nivel y Experiencia
                </h4>
                {userReputation && (
                  <UserLevelDisplay
                    totalPoints={userReputation.totalPoints}
                    size="medium"
                    showProgress={true}
                    animated={true}
                  />
                )}
              </div>

              {/* Retos Activos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <FiTarget className="w-4 h-4 mr-2 text-green-600" />
                    Retos Activos
                  </h4>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    {activeChallenges?.filter(c => c.status === 'active').length || 0}
                  </span>
                </div>

                {!challengesLoading && activeChallenges?.length > 0 ? (
                  <div className="space-y-2">
                    {activeChallenges.filter(c => c.status === 'active').slice(0, 2).map((challenge) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 rounded-lg p-3 border border-green-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {challenge.title}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            {challenge.points} pts
                          </span>
                        </div>
                        <div className="w-full bg-green-100 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${challenge.progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                          />
                        </div>
                        <div className="text-xs text-green-700 mt-1">
                          {user?.id && challenge.progress[user.id] ?
                            Math.round((challenge.progress[user.id].current / challenge.objective.target) * 100)
                            : 0}% completado
                        </div>
                      </motion.div>
                    ))}
                    {activeChallenges.filter(c => c.status === 'active').length > 2 && (
                      <p className="text-xs text-gray-600 text-center">
                        +{activeChallenges.filter(c => c.status === 'active').length - 2} retos más
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <FiTarget className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Sin retos activos</p>
                  </div>
                )}
              </div>

              {/* Duelo en Curso */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <FiUsers className="w-4 h-4 mr-2 text-red-600" />
                    Duelo en Curso
                  </h4>
                  {activeDuels?.filter(d => d.status === 'active').length > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      Activo
                    </span>
                  )}
                </div>

                {!duelsLoading && activeDuels?.length > 0 ? (
                  <div className="space-y-3">
                    {activeDuels.filter(d => d.status === 'active').slice(0, 1).map((duel) => (
                      <motion.div
                        key={duel.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 rounded-lg p-3 border border-red-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-900">
                            vs Oponente {duel.opponentId.slice(-6)}
                          </span>
                          <span className="text-xs text-red-600 font-medium">
                            {duel.category}
                          </span>
                        </div>

                        {/* Barras de progreso comparativas */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Tú</span>
                              <span>{user?.id && duel.progress[user.id] ? Math.round((duel.progress[user.id].current / (duel.targetValue || 100)) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${user?.id && duel.progress[user.id] ? Math.round((duel.progress[user.id].current / (duel.targetValue || 100)) * 100) : 0}%` }}
                                transition={{ duration: 1 }}
                                className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Oponente {duel.opponentId.slice(-6)}</span>
                              <span>{duel.opponentId && duel.progress[duel.opponentId] ? Math.round((duel.progress[duel.opponentId].current / (duel.targetValue || 100)) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${duel.opponentId && duel.progress[duel.opponentId] ? Math.round((duel.progress[duel.opponentId].current / (duel.targetValue || 100)) * 100) : 0}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 mt-2 text-center">
                          <FiClock className="w-3 h-3 inline mr-1" />
                          {duel.durationHours ? Math.ceil(duel.durationHours / 24) : 'N/A'} días restantes
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <FiUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Sin duelos activos</p>
                  </div>
                )}
              </div>

              {/* Recompensas Disponibles */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <FiGift className="w-4 h-4 mr-2 text-orange-600" />
                    Recompensas
                  </h4>
                  {rewardsStats && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                      {rewardsStats.availablePoints.toLocaleString()} pts
                    </span>
                  )}
                </div>

                {!rewardsLoading && rewardsStats ? (
                  <div className="space-y-3">
                    <div className="bg-white/80 rounded-lg p-3 border border-orange-200">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-lg font-bold text-orange-600">
                            {rewardsStats.totalRedemptions}
                          </div>
                          <div className="text-xs text-gray-600">Canjeados</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {rewards?.filter(r => r.pointsCost <= rewardsStats.availablePoints).length || 0}
                          </div>
                          <div className="text-xs text-gray-600">Disponibles</div>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 hover:from-orange-600 hover:to-red-600 transition-colors"
                    >
                      <FiGift className="w-4 h-4" />
                      <span>Centro de Recompensas</span>
                      <FiArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <FiGift className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Cargando recompensas...</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white/50 rounded-lg p-3 border border-purple-200">
                <h5 className="text-xs font-semibold text-gray-700 mb-2 text-center">Estadísticas Rápidas</h5>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm font-bold text-purple-600">
                      {activeChallenges?.filter(c => c.status === 'completed').length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Retos</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {activeDuels?.filter(d => d.status === 'finished' && d.winnerId === user?.id).length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Duelos</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-600">
                      {userReputation?.level || 0}
                    </div>
                    <div className="text-xs text-gray-600">Nivel</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Level System Integration Component (for level-up modals) */}
          {REPUTATION_ENABLED && user?.id && (
            <LevelSystemIntegration userId={user.id}>
              {/* This component handles level-up events automatically */}
            </LevelSystemIntegration>
          )}

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Distintivos</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <FiShield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Usuario Verificado</p>
                  <p className="text-xs text-green-600">Email verificado</p>
                </div>
              </div>
              {completeness === 100 && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <FiAward className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Perfil Completo</p>
                    <p className="text-xs text-blue-600">100% completado</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Enlaces Rápidos</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FiExternalLink className="w-4 h-4" />
                <span>Ver perfil público</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FiUser className="w-4 h-4" />
                <span>Configurar privacidad</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};