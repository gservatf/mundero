// Componente Leaderboard - Top 20 usuarios con mayor reputación
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLeaderboard } from './useReputation';
import { LevelChip } from './components/LevelChip';
import { DEFAULT_LEVELS } from './types';
import { REPUTATION_ENABLED } from './reputationService';
import {
    FiSearch,
    FiAward,
    FiUser,
    FiTrendingUp,
    FiRefreshCw,
    FiStar,
    FiTarget
} from 'react-icons/fi'; interface LeaderboardUser {
    userId: string;
    displayName: string;
    photoURL?: string;
    level: number;
    totalPoints: number;
    badges: string[];
    position: number;
}

export const Leaderboard: React.FC = () => {
    const { items: leaderboardData, loading, error, refresh } = useLeaderboard();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<LeaderboardUser[]>([]);

    // Filtrar datos según búsqueda
    useEffect(() => {
        if (!leaderboardData) {
            setFilteredData([]);
            return;
        }

        const filtered = leaderboardData
            .filter(user =>
                user.userId.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 20) // Top 20
            .map((user, index) => ({
                ...user,
                position: index + 1,
                displayName: `Usuario ${user.userId.slice(-6)}`  // Mostrar últimos 6 chars del ID
            }));

        setFilteredData(filtered);
    }, [leaderboardData, searchTerm]);    // Obtener icono de posición
    const getPositionIcon = (position: number) => {
        switch (position) {
            case 1:
                return <FiAward className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <FiAward className="w-6 h-6 text-gray-400" />;
            case 3:
                return <FiStar className="w-6 h-6 text-orange-600" />;
            default:
                return (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {position}
                    </div>
                );
        }
    };    // Obtener clases de estilo para Top 3
    const getPositionStyles = (position: number) => {
        switch (position) {
            case 1:
                return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700';
            case 2:
                return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-600';
            case 3:
                return 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700';
            default:
                return 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700';
        }
    };

    // Obtener nombre del nivel
    const getLevelName = (level: number) => {
        return DEFAULT_LEVELS.find(l => l.id === level)?.name || 'Explorador';
    };

    if (!REPUTATION_ENABLED) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
                    <FiTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        Sistema de Reputación Deshabilitado
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        El leaderboard estará disponible cuando se active el sistema de reputación.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={refresh}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        <span>Reintentar</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <div className="flex items-center justify-center space-x-3 mb-2">
                    <FiTarget className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Leaderboard
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Los usuarios con mayor reputación en la comunidad
                </p>
            </motion.div>

            {/* Barra de búsqueda y controles */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 items-center justify-between"
            >
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar usuario..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredData.length} usuarios encontrados
                    </span>
                    <button
                        onClick={refresh}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Actualizar"
                    >
                        <FiRefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {/* Lista del leaderboard */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-2"
            >
                <AnimatePresence mode="wait">
                    {filteredData.length === 0 ? (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center py-12"
                        >
                            <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                No se encontraron usuarios
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'Intenta con un término de búsqueda diferente' : 'Aún no hay usuarios en el ranking'}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.05 }
                                }
                            }}
                            className="space-y-2"
                        >
                            {filteredData.map((user, index) => (
                                <motion.div
                                    key={user.userId}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    className={`
                    p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200
                    ${getPositionStyles(user.position)}
                  `}
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* Posición */}
                                        <div className="flex-shrink-0">
                                            {getPositionIcon(user.position)}
                                        </div>

                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={user.photoURL || '/default-avatar.png'}
                                                alt={user.displayName}
                                                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                                            />
                                        </div>

                                        {/* Información del usuario */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {user.displayName}
                                                </h3>
                                                {user.position <= 3 && (
                                                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                                                        TOP {user.position}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <LevelChip
                                                    level={user.level}
                                                    name={getLevelName(user.level)}
                                                    size="small"
                                                />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.badges?.length || 0} insignias
                                                </span>
                                            </div>
                                        </div>

                                        {/* Puntos */}
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                {user.totalPoints.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                puntos
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Footer estadísticas */}
            {filteredData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-6"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {filteredData[0]?.totalPoints.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Puntos del líder
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {Math.round(filteredData.reduce((acc, user) => acc + user.totalPoints, 0) / filteredData.length) || 0}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Promedio de puntos
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {filteredData.reduce((acc, user) => acc + (user.badges?.length || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Total de insignias
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};