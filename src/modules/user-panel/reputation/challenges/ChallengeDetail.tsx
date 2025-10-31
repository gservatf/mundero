// Vista detallada de un reto específico
// Incluye progreso, participantes, comentarios y acciones

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft,
    FiUsers,
    FiClock,
    FiTarget,
    FiAward,
    FiShare2,
    FiFlag,
    FiTrendingUp,
    FiCalendar,
    FiUser,
    FiCheckCircle
} from 'react-icons/fi';
import { Challenge, DIFFICULTY_CONFIG, CATEGORY_CONFIG } from './types';
import { useChallenges } from './useChallenges';
import { useAuth } from '@/hooks/useAuth';

interface ChallengeDetailProps {
    challengeId: string;
    onBack: () => void;
}

export const ChallengeDetail: React.FC<ChallengeDetailProps> = ({
    challengeId,
    onBack
}) => {
    const { user } = useAuth();
    const {
        challenges,
        joinChallenge,
        leaveChallenge,
        getUserProgress,
        loading
    } = useChallenges();

    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'progress'>('overview');

    useEffect(() => {
        const foundChallenge = challenges.find(c => c.id === challengeId);
        setChallenge(foundChallenge || null);
    }, [challengeId, challenges]);

    if (loading || !challenge) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                    />
                    <span className="text-gray-600">Cargando reto...</span>
                </div>
            </div>
        );
    }

    const isParticipating = user ? challenge.participants.includes(user.id) : false;
    const userProgress = isParticipating ? getUserProgress(challenge.id) : null;
    const isExpired = challenge.status === 'expired';
    const isCompleted = challenge.status === 'completed';

    const getTimeRemaining = (): { text: string; urgent: boolean } => {
        const now = Date.now();
        const remaining = challenge.deadline - now;

        if (remaining <= 0) return { text: 'Expirado', urgent: true };

        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

        if (days > 1) return { text: `${days} días`, urgent: false };
        if (days === 1) return { text: `1 día ${hours}h`, urgent: true };
        if (hours > 0) return { text: `${hours}h ${minutes}m`, urgent: true };
        return { text: `${minutes}m`, urgent: true };
    };

    const getCollaborativeProgress = () => {
        if (challenge.type !== 'collaborative') return { current: 0, percentage: 0 };

        const totalProgress = Object.values(challenge.progress)
            .reduce((sum, progress) => sum + progress.current, 0);

        return {
            current: totalProgress,
            percentage: Math.min((totalProgress / challenge.objective.target) * 100, 100)
        };
    };

    const getTopParticipants = () => {
        return Object.entries(challenge.progress)
            .map(([userId, progress]) => ({
                userId,
                ...progress
            }))
            .sort((a, b) => b.current - a.current)
            .slice(0, 5);
    };

    const handleJoinChallenge = async () => {
        const success = await joinChallenge(challenge.id);
        if (success) {
            // El estado se actualizará automáticamente via hook
        }
    };

    const handleLeaveChallenge = async () => {
        const success = await leaveChallenge(challenge.id);
        if (success) {
            // Opcionalmente volver a la lista
        }
    };

    const timeRemaining = getTimeRemaining();
    const collaborativeProgress = getCollaborativeProgress();
    const topParticipants = getTopParticipants();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {/* Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
                    <button
                        onClick={onBack}
                        className="flex items-center text-white/80 hover:text-white mb-4 transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4 mr-2" />
                        Volver a la lista
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-grow">
                            <div className="flex items-center space-x-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border border-white/20 bg-white/10`}>
                                    {DIFFICULTY_CONFIG[challenge.difficulty].icon} {challenge.difficulty.toUpperCase()}
                                </span>

                                <span className={`px-3 py-1 rounded-full text-xs font-medium border border-white/20 bg-white/10`}>
                                    {CATEGORY_CONFIG[challenge.category].icon} {CATEGORY_CONFIG[challenge.category].name}
                                </span>

                                <span className={`px-3 py-1 rounded-full text-xs font-medium border border-white/20 bg-white/10`}>
                                    {challenge.type === 'collaborative' ? '👥 Colaborativo' :
                                        challenge.type === 'weekly' ? '📅 Semanal' : '👤 Individual'}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold mb-3">
                                {challenge.title}
                            </h1>

                            <p className="text-lg text-white/90 mb-4">
                                {challenge.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center">
                                    <FiUsers className="w-4 h-4 mr-2" />
                                    {challenge.participants.length} participante{challenge.participants.length !== 1 ? 's' : ''}
                                </div>

                                <div className="flex items-center">
                                    <FiAward className="w-4 h-4 mr-2" />
                                    {challenge.points} puntos
                                </div>

                                <div className="flex items-center">
                                    <FiTarget className="w-4 h-4 mr-2" />
                                    Objetivo: {challenge.objective.target}
                                </div>

                                <div className={`flex items-center ${timeRemaining.urgent ? 'text-red-200' : ''}`}>
                                    <FiClock className="w-4 h-4 mr-2" />
                                    {timeRemaining.text}
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {!isExpired && !isCompleted && (
                                isParticipating ? (
                                    <div className="space-y-2">
                                        <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-center">
                                            <div className="text-sm opacity-90">Participando</div>
                                            {userProgress?.completed && (
                                                <div className="flex items-center justify-center text-green-200 text-sm">
                                                    <FiCheckCircle className="w-4 h-4 mr-1" />
                                                    ¡Completado!
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleLeaveChallenge}
                                            className="px-4 py-2 bg-red-500/20 text-white border border-red-300/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                                        >
                                            Abandonar Reto
                                        </button>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleJoinChallenge}
                                        className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Unirse al Reto
                                    </motion.button>
                                )
                            )}

                            <button className="px-4 py-2 bg-white/10 backdrop-blur text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
                                <FiShare2 className="w-4 h-4" />
                                <span>Compartir</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progreso principal */}
                {(isParticipating || challenge.type === 'collaborative') && (
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {challenge.type === 'collaborative' ? 'Progreso Grupal' : 'Tu Progreso'}
                        </h3>

                        {challenge.type === 'collaborative' ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Progreso colaborativo</span>
                                    <span>{collaborativeProgress.current}/{challenge.objective.target}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${collaborativeProgress.percentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    />
                                </div>
                                <div className="text-right text-sm text-gray-600">
                                    {Math.round(collaborativeProgress.percentage)}% completado
                                </div>
                            </div>
                        ) : userProgress && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Tu contribución</span>
                                    <span>{userProgress.current}/{userProgress.target}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${userProgress.percentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-4 rounded-full ${userProgress.completed
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                            }`}
                                    />
                                </div>
                                <div className="text-right text-sm text-gray-600">
                                    {Math.round(userProgress.percentage)}% completado
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Descripción', icon: FiTarget },
                            { id: 'participants', label: 'Participantes', icon: FiUsers },
                            { id: 'progress', label: 'Progreso', icon: FiTrendingUp }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Objetivo del Reto
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {challenge.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Detalles</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tipo de objetivo:</span>
                                                <span className="font-medium">{challenge.objective.type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Meta:</span>
                                                <span className="font-medium">{challenge.objective.target}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duración:</span>
                                                <span className="font-medium">{challenge.objective.timeframe || 'Total'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Creado:</span>
                                                <span className="font-medium">
                                                    {new Date(challenge.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Recompensas</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <FiAward className="w-4 h-4 text-yellow-500" />
                                                <span>{challenge.points} puntos de reputación</span>
                                            </div>

                                            {challenge.rewards && challenge.rewards.map((reward, index) => (
                                                <div key={index} className="flex items-center space-x-2 text-sm">
                                                    <span className="text-blue-500">🎁</span>
                                                    <span>{reward.type}: {reward.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {challenge.tags.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {challenge.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'participants' && (
                            <motion.div
                                key="participants"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Participantes ({challenge.participants.length})
                                    </h3>
                                    {challenge.maxParticipants && (
                                        <span className="text-sm text-gray-600">
                                            Máximo: {challenge.maxParticipants}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {topParticipants.map((participant, index) => (
                                        <motion.div
                                            key={participant.userId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                    {participant.userId.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {participant.userId}
                                                        {participant.userId === user?.id && (
                                                            <span className="ml-2 text-xs text-blue-600">(Tú)</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {participant.completed ? (
                                                            <span className="text-green-600 flex items-center">
                                                                <FiCheckCircle className="w-4 h-4 mr-1" />
                                                                Completado
                                                            </span>
                                                        ) : (
                                                            `Progreso: ${participant.current}/${challenge.objective.target}`
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">
                                                    #{index + 1}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {participant.current} pts
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'progress' && (
                            <motion.div
                                key="progress"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Historial de Progreso
                                </h3>

                                {/* Aquí iría un gráfico de progreso en el tiempo */}
                                <div className="bg-gray-50 rounded-lg p-8 text-center">
                                    <FiTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        Gráfico de progreso en desarrollo
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Aquí se mostrará el progreso histórico del reto
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default ChallengeDetail;