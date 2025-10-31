// Lista de retos disponibles con grid animado
// Incluye filtros, búsqueda y acciones de participación

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus,
    FiSearch,
    FiFilter,
    FiUsers,
    FiClock,
    FiTrendingUp,
    FiAward,
    FiTarget,
    FiCalendar
} from 'react-icons/fi';
import { Challenge, ChallengeType, DIFFICULTY_CONFIG, CATEGORY_CONFIG } from './types';
import { useChallenges } from './useChallenges';
import { useAuth } from '@/hooks/useAuth';

interface ChallengeListProps {
    onChallengeClick?: (challenge: Challenge) => void;
    onCreateClick?: () => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({
    onChallengeClick,
    onCreateClick
}) => {
    const { user } = useAuth();
    const {
        challenges,
        userChallenges,
        loading,
        error,
        joinChallenge,
        leaveChallenge,
        getUserProgress
    } = useChallenges();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<ChallengeType | 'all'>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showOnlyUserChallenges, setShowOnlyUserChallenges] = useState(false);

    // Filtrar retos según criterios
    const filteredChallenges = useMemo(() => {
        let filtered = showOnlyUserChallenges ? userChallenges : challenges;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(challenge =>
                challenge.title.toLowerCase().includes(term) ||
                challenge.description.toLowerCase().includes(term) ||
                challenge.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(challenge => challenge.type === selectedType);
        }

        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(challenge => challenge.difficulty === selectedDifficulty);
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(challenge => challenge.category === selectedCategory);
        }

        // Ordenar por fecha de creación (más recientes primero)
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }, [
        challenges,
        userChallenges,
        showOnlyUserChallenges,
        searchTerm,
        selectedType,
        selectedDifficulty,
        selectedCategory
    ]);

    const handleJoinChallenge = async (challengeId: string) => {
        const success = await joinChallenge(challengeId);
        if (success) {
            // Toast de éxito manejado por el hook
        }
    };

    const handleLeaveChallenge = async (challengeId: string) => {
        const success = await leaveChallenge(challengeId);
        if (success) {
            // Toast de confirmación
        }
    };

    const isUserParticipating = (challenge: Challenge): boolean => {
        return user ? challenge.participants.includes(user.id) : false;
    };

    const getTimeRemaining = (deadline: number): string => {
        const now = Date.now();
        const remaining = deadline - now;

        if (remaining <= 0) return 'Expirado';

        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    const getCollaborativeProgress = (challenge: Challenge): number => {
        if (challenge.type !== 'collaborative') return 0;

        const totalProgress = Object.values(challenge.progress)
            .reduce((sum, progress) => sum + progress.current, 0);

        return Math.min((totalProgress / challenge.objective.target) * 100, 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                    />
                    <span className="text-gray-600">Cargando retos...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">⚠️ Error cargando retos</div>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con filtros */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            🎯 Retos y Desafíos
                        </h2>
                        <p className="text-gray-600">
                            Participa en retos para ganar puntos y desbloquear logros
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowOnlyUserChallenges(!showOnlyUserChallenges)}
                            className={`px-4 py-2 rounded-lg border transition-colors ${showOnlyUserChallenges
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Mis Retos
                        </button>

                        {onCreateClick && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onCreateClick}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                            >
                                <FiPlus className="w-4 h-4" />
                                <span>Crear Reto</span>
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar retos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Tipo */}
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="individual">Individual</option>
                        <option value="collaborative">Colaborativo</option>
                        <option value="weekly">Semanal</option>
                    </select>

                    {/* Dificultad */}
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todas las dificultades</option>
                        <option value="easy">Fácil</option>
                        <option value="medium">Medio</option>
                        <option value="hard">Difícil</option>
                        <option value="extreme">Extremo</option>
                    </select>

                    {/* Categoría */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todas las categorías</option>
                        <option value="social">Social</option>
                        <option value="content">Contenido</option>
                        <option value="engagement">Participación</option>
                        <option value="networking">Networking</option>
                        <option value="learning">Aprendizaje</option>
                    </select>

                    {/* Estadísticas rápidas */}
                    <div className="flex items-center justify-center text-sm text-gray-600">
                        {filteredChallenges.length} retos encontrados
                    </div>
                </div>
            </div>

            {/* Grid de retos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredChallenges.map((challenge, index) => {
                        const isParticipating = isUserParticipating(challenge);
                        const userProgress = isParticipating ? getUserProgress(challenge.id) : null;
                        const timeRemaining = getTimeRemaining(challenge.deadline);
                        const isExpired = challenge.status === 'expired';
                        const collaborativeProgress = getCollaborativeProgress(challenge);

                        return (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className={`bg-white rounded-lg border shadow-sm overflow-hidden cursor-pointer transition-shadow hover:shadow-lg ${isExpired ? 'opacity-60' : ''
                                    }`}
                                onClick={() => onChallengeClick?.(challenge)}
                            >
                                {/* Header */}
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs rounded-full border ${DIFFICULTY_CONFIG[challenge.difficulty].color
                                                }`}>
                                                {DIFFICULTY_CONFIG[challenge.difficulty].icon} {challenge.difficulty.toUpperCase()}
                                            </span>

                                            <span className={`px-2 py-1 text-xs rounded-full ${CATEGORY_CONFIG[challenge.category].color
                                                }`}>
                                                {CATEGORY_CONFIG[challenge.category].icon} {CATEGORY_CONFIG[challenge.category].name}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-xs text-gray-500">
                                            <FiClock className="w-3 h-3 mr-1" />
                                            {timeRemaining}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {challenge.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {challenge.description}
                                    </p>
                                </div>

                                {/* Información del reto */}
                                <div className="p-4 space-y-3">
                                    {/* Objetivo */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <FiTarget className="w-4 h-4 mr-2" />
                                            Objetivo: {challenge.objective.target}
                                        </div>
                                        <div className="flex items-center text-blue-600 font-medium">
                                            <FiAward className="w-4 h-4 mr-1" />
                                            {challenge.points} pts
                                        </div>
                                    </div>

                                    {/* Participantes */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <FiUsers className="w-4 h-4 mr-2" />
                                            {challenge.participants.length} participante{challenge.participants.length !== 1 ? 's' : ''}
                                        </div>
                                        <div className="text-gray-500">
                                            {challenge.type === 'collaborative' ? 'Colaborativo' :
                                                challenge.type === 'weekly' ? 'Semanal' : 'Individual'}
                                        </div>
                                    </div>

                                    {/* Progreso */}
                                    {isParticipating && userProgress && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs text-gray-600">
                                                <span>Tu progreso</span>
                                                <span>{userProgress.current}/{userProgress.target}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${userProgress.percentage}%` }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                    className={`h-2 rounded-full ${userProgress.completed ? 'bg-green-500' : 'bg-blue-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Progreso colaborativo */}
                                    {challenge.type === 'collaborative' && !isParticipating && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs text-gray-600">
                                                <span>Progreso grupal</span>
                                                <span>{Math.round(collaborativeProgress)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${collaborativeProgress}%` }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                    className="h-2 rounded-full bg-purple-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    {isExpired ? (
                                        <div className="text-center text-sm text-gray-500">
                                            Reto expirado
                                        </div>
                                    ) : isParticipating ? (
                                        <div className="flex items-center justify-between">
                                            {userProgress?.completed ? (
                                                <div className="flex items-center text-green-600 text-sm font-medium">
                                                    <FiAward className="w-4 h-4 mr-2" />
                                                    ¡Completado!
                                                </div>
                                            ) : (
                                                <div className="text-blue-600 text-sm font-medium">
                                                    Participando...
                                                </div>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLeaveChallenge(challenge.id);
                                                }}
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Abandonar
                                            </button>
                                        </div>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleJoinChallenge(challenge.id);
                                            }}
                                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                        >
                                            Unirse al Reto
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Estado vacío */}
            {filteredChallenges.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                >
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay retos disponibles
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {showOnlyUserChallenges
                            ? 'No estás participando en ningún reto actualmente'
                            : 'No se encontraron retos que coincidan con los filtros seleccionados'
                        }
                    </p>
                    {onCreateClick && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onCreateClick}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Crear el Primer Reto
                        </motion.button>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default ChallengeList;