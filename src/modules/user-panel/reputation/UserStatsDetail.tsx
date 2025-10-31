// Componente de estadísticas detalladas para el leaderboard
// Muestra métricas avanzadas y comparaciones del usuario

import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiAward, FiClock, FiStar } from 'react-icons/fi';

interface UserStatsDetailProps {
    userId: string;
    stats: {
        totalPoints: number;
        weeklyPoints: number;
        monthlyPoints: number;
        level: number;
        rank: number;
        previousRank: number;
        challengesWon: number;
        challengesTotal: number;
        duelsWon: number;
        duelsTotal: number;
        streak: number;
        longestStreak: number;
        avgPointsPerDay: number;
        pointsThisWeek: number[];
    };
    onClose: () => void;
}

export const UserStatsDetail: React.FC<UserStatsDetailProps> = ({
    userId,
    stats,
    onClose
}) => {
    const rankChange = stats.previousRank - stats.rank;
    const challengeWinRate = stats.challengesTotal > 0 ? (stats.challengesWon / stats.challengesTotal) * 100 : 0;
    const duelWinRate = stats.duelsTotal > 0 ? (stats.duelsWon / stats.duelsTotal) * 100 : 0;

    const getTrendIcon = (change: number) => {
        if (change > 0) return <FiTrendingUp className="w-4 h-4 text-green-500" />;
        if (change < 0) return <FiTrendingDown className="w-4 h-4 text-red-500" />;
        return <FiMinus className="w-4 h-4 text-gray-400" />;
    };

    const getTrendColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Estadísticas Detalladas</h2>
                            <p className="text-purple-100">Análisis completo de rendimiento</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Ranking y Tendencia */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Posición Actual</p>
                                    <p className="text-2xl font-bold text-purple-900">#{stats.rank}</p>
                                </div>
                                <div className="text-3xl">🏆</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Cambio de Posición</p>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-2xl font-bold ${getTrendColor(rankChange)}`}>
                                            {rankChange > 0 ? `+${rankChange}` : rankChange === 0 ? '±0' : rankChange}
                                        </span>
                                        {getTrendIcon(rankChange)}
                                    </div>
                                </div>
                                <div className="text-3xl">📈</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Nivel</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.level}</p>
                                </div>
                                <div className="text-3xl">⭐</div>
                            </div>
                        </div>
                    </div>

                    {/* Puntos y Progreso */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiAward className="w-5 h-5 mr-2 text-purple-600" />
                            Progreso de Puntos
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">Total</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{stats.monthlyPoints.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">Este mes</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{stats.weeklyPoints.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">Esta semana</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-orange-600">{Math.round(stats.avgPointsPerDay)}</p>
                                <p className="text-sm text-gray-600">Promedio/día</p>
                            </div>
                        </div>

                        {/* Weekly Progress Chart */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Progreso Semanal</h4>
                            <div className="flex items-end space-x-2 h-24">
                                {stats.pointsThisWeek.map((points, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(points / Math.max(...stats.pointsThisWeek)) * 100}%` }}
                                            transition={{ delay: index * 0.1 }}
                                            className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t min-h-[4px]"
                                        />
                                        <span className="text-xs text-gray-600 mt-2">
                                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Competiciones */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiStar className="w-5 h-5 mr-2 text-purple-600" />
                            Rendimiento en Competiciones
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Challenges */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-blue-900">Challenges</h4>
                                    <span className="text-2xl">🎯</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-blue-700">Ganados</span>
                                        <span className="font-semibold text-blue-900">{stats.challengesWon}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-blue-700">Total</span>
                                        <span className="font-semibold text-blue-900">{stats.challengesTotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-blue-700">Tasa de victoria</span>
                                        <span className="font-semibold text-blue-900">{challengeWinRate.toFixed(1)}%</span>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${challengeWinRate}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Duels */}
                            <div className="bg-red-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-red-900">Duelos</h4>
                                    <span className="text-2xl">⚔️</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-red-700">Ganados</span>
                                        <span className="font-semibold text-red-900">{stats.duelsWon}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-red-700">Total</span>
                                        <span className="font-semibold text-red-900">{stats.duelsTotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-red-700">Tasa de victoria</span>
                                        <span className="font-semibold text-red-900">{duelWinRate.toFixed(1)}%</span>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="w-full bg-red-200 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${duelWinRate}%` }}
                                            transition={{ duration: 1, delay: 0.7 }}
                                            className="h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Streaks */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiClock className="w-5 h-5 mr-2 text-purple-600" />
                            Rachas de Actividad
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-600 font-medium">Racha Actual</p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl font-bold text-orange-900">{stats.streak}</span>
                                            <span className="text-orange-700">días</span>
                                        </div>
                                    </div>
                                    <div className="text-3xl">🔥</div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-yellow-600 font-medium">Mejor Racha</p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl font-bold text-yellow-900">{stats.longestStreak}</span>
                                            <span className="text-yellow-700">días</span>
                                        </div>
                                    </div>
                                    <div className="text-3xl">🏆</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserStatsDetail;