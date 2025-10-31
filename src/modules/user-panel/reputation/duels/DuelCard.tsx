// Tarjeta de duelo con progreso en tiempo real y efectos visuales
// Incluye animaciones de barras duales y efectos de partículas

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiClock,
    FiUsers,
    FiAward,
    FiPlay,
    FiPause,
    FiEye,
    FiTrendingUp,
    FiTarget,
    FiX,
    FiCheck
} from 'react-icons/fi';
import { Duel, METRIC_CONFIG, DUEL_DIFFICULTY_CONFIG, DUEL_CATEGORY_CONFIG } from './types';
import { useDuels } from './useDuels';
import { useAuth } from '@/hooks/useAuth';

interface DuelCardProps {
    duel: Duel;
    onDuelClick?: (duel: Duel) => void;
    showActions?: boolean;
    compact?: boolean;
}

export const DuelCard: React.FC<DuelCardProps> = ({
    duel,
    onDuelClick,
    showActions = true,
    compact = false
}) => {
    const { user } = useAuth();
    const {
        getDuelProgress,
        getTimeRemaining,
        isUserParticipating,
        isUserSpectator,
        joinAsSpectator,
        leaveAsSpectator,
        cancelDuel
    } = useDuels();

    const [showParticles, setShowParticles] = useState(false);
    const [lastWinner, setLastWinner] = useState<string | null>(null);

    const isParticipating = isUserParticipating(duel);
    const isSpectator = isUserSpectator(duel);
    const progress = getDuelProgress(duel);
    const timeRemaining = getTimeRemaining(duel);
    const metric = METRIC_CONFIG[duel.metric];

    // Efecto de partículas cuando hay un cambio en el liderazgo
    useEffect(() => {
        if (duel.status === 'active') {
            const challengerProgress = duel.progress[duel.challengerId]?.current || 0;
            const opponentProgress = duel.progress[duel.opponentId]?.current || 0;

            const currentWinner = challengerProgress > opponentProgress ? duel.challengerId :
                opponentProgress > challengerProgress ? duel.opponentId : null;

            if (currentWinner && currentWinner !== lastWinner) {
                setShowParticles(true);
                setLastWinner(currentWinner);

                setTimeout(() => setShowParticles(false), 2000);
            }
        }
    }, [duel.progress, lastWinner, duel.challengerId, duel.opponentId, duel.status]);

    const getStatusColor = () => {
        switch (duel.status) {
            case 'active': return 'text-green-600 bg-green-50 border-green-200';
            case 'finished': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusText = () => {
        switch (duel.status) {
            case 'active': return '🔥 Activo';
            case 'finished': return '✅ Finalizado';
            case 'pending': return '⏳ Pendiente';
            case 'cancelled': return '❌ Cancelado';
            default: return duel.status;
        }
    };

    const getWinnerIndicator = () => {
        if (duel.status !== 'finished') return null;

        if (duel.isDraw) {
            return (
                <div className="flex items-center text-yellow-600 text-sm font-medium">
                    ⚖️ Empate
                </div>
            );
        }

        if (duel.winnerId) {
            const isUserWinner = duel.winnerId === user?.id;
            return (
                <div className={`flex items-center text-sm font-medium ${isUserWinner ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {isUserWinner ? '🏆 Ganaste' : '💪 Participaste'}
                </div>
            );
        }

        return null;
    };

    const handleSpectatorToggle = async () => {
        if (isSpectator) {
            await leaveAsSpectator(duel.id);
        } else {
            await joinAsSpectator(duel.id);
        }
    };

    const handleCancelDuel = async () => {
        if (confirm('¿Estás seguro de que quieres cancelar este duelo?')) {
            await cancelDuel(duel.id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            onClick={() => onDuelClick?.(duel)}
            className="bg-white rounded-lg border shadow-sm overflow-hidden cursor-pointer relative"
        >
            {/* Partículas de victoria */}
            <AnimatePresence>
                {showParticles && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 1,
                                    scale: 0,
                                    x: '50%',
                                    y: '50%'
                                }}
                                animate={{
                                    opacity: 0,
                                    scale: 1,
                                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                                    y: `${50 + (Math.random() - 0.5) * 200}%`
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor()}`}>
                            {getStatusText()}
                        </span>

                        <span className={`px-2 py-1 text-xs rounded-full border ${DUEL_DIFFICULTY_CONFIG[duel.difficulty].color
                            }`}>
                            {DUEL_DIFFICULTY_CONFIG[duel.difficulty].icon} {DUEL_DIFFICULTY_CONFIG[duel.difficulty].name}
                        </span>

                        <span className={`px-2 py-1 text-xs rounded-full ${DUEL_CATEGORY_CONFIG[duel.category].color
                            }`}>
                            {DUEL_CATEGORY_CONFIG[duel.category].icon}
                        </span>
                    </div>

                    {duel.status === 'finished' && getWinnerIndicator()}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {duel.objective}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <span className={`w-4 h-4 mr-2 ${metric.color.split(' ')[0]} rounded`}>
                                {metric.icon}
                            </span>
                            {metric.name}
                        </div>

                        <div className="flex items-center">
                            <FiAward className="w-4 h-4 mr-1" />
                            {duel.rewards.winner} pts
                        </div>
                    </div>

                    {duel.status === 'active' && (
                        <div className={`flex items-center ${timeRemaining.hours < 2 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            <FiClock className="w-4 h-4 mr-1" />
                            {timeRemaining.hours}h {timeRemaining.minutes}m
                        </div>
                    )}
                </div>
            </div>

            {/* Progreso de duelo */}
            {duel.status === 'active' && (
                <div className="p-4">
                    <div className="space-y-3">
                        {/* Progreso visual con barras duales */}
                        <div className="relative">
                            <div className="flex items-center justify-between text-sm font-medium mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                        {duel.challengerId.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span>{duel.progress[duel.challengerId]?.current || 0}</span>
                                </div>

                                <div className="text-gray-500">VS</div>

                                <div className="flex items-center space-x-2">
                                    <span>{duel.progress[duel.opponentId]?.current || 0}</span>
                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                                        {duel.opponentId.slice(0, 2).toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            {/* Barra de progreso dual */}
                            <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                                {/* Lado izquierdo (challenger) */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${Math.min(
                                            ((duel.progress[duel.challengerId]?.current || 0) /
                                                Math.max(
                                                    duel.progress[duel.challengerId]?.current || 1,
                                                    duel.progress[duel.opponentId]?.current || 1
                                                )) * 45, 45
                                        )}%`
                                    }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400"
                                />

                                {/* Lado derecho (opponent) */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${Math.min(
                                            ((duel.progress[duel.opponentId]?.current || 0) /
                                                Math.max(
                                                    duel.progress[duel.challengerId]?.current || 1,
                                                    duel.progress[duel.opponentId]?.current || 1
                                                )) * 45, 45
                                        )}%`
                                    }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-purple-500 to-purple-400"
                                />

                                {/* Indicador central */}
                                <div className="absolute left-1/2 top-0 w-px h-full bg-gray-400 transform -translate-x-1/2" />
                            </div>
                        </div>

                        {/* Indicador de ventaja */}
                        {progress.difference > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`text-center text-sm ${progress.isWinning ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {progress.isWinning ? '🚀 Vas ganando' : '💪 Detrás'} por {progress.difference}
                            </motion.div>
                        )}

                        {/* Progreso temporal */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Iniciado</span>
                            <div className="flex-1 mx-3">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${timeRemaining.percentage}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-1 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                                    />
                                </div>
                            </div>
                            <span>Final</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Información de duelo finalizado */}
            {duel.status === 'finished' && (
                <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <span className="text-gray-600">Resultado final:</span>
                            <div className="font-medium">
                                {duel.challengerId}: {duel.progress[duel.challengerId]?.current || 0} vs{' '}
                                {duel.opponentId}: {duel.progress[duel.opponentId]?.current || 0}
                            </div>
                        </div>
                        {duel.finishedAt && (
                            <div className="text-gray-500">
                                {new Date(duel.finishedAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Espectadores */}
            {duel.spectators && duel.spectators.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            {duel.spectators.length} espectador{duel.spectators.length !== 1 ? 'es' : ''}
                        </div>
                    </div>
                </div>
            )}

            {/* Acciones */}
            {showActions && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        {duel.status === 'active' && duel.isPublic && !isParticipating && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSpectatorToggle();
                                }}
                                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${isSpectator
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <FiEye className="w-4 h-4 mr-1 inline" />
                                {isSpectator ? 'Observando' : 'Observar'}
                            </button>
                        )}

                        {isParticipating && (duel.status === 'active' || duel.status === 'pending') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelDuel();
                                }}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <FiX className="w-4 h-4 mr-1 inline" />
                                Cancelar
                            </button>
                        )}

                        <div className="flex-1" />

                        <div className="text-xs text-gray-500">
                            {new Date(duel.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default DuelCard;