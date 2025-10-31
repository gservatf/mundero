// Componente para mostrar el nivel actual del usuario
// Incluye progreso visual y animaciones de nivel

import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiTrendingUp, FiAward } from 'react-icons/fi';
import { useLevelSystem } from './levelSystem';

interface UserLevelDisplayProps {
    totalPoints: number;
    showProgress?: boolean;
    size?: 'small' | 'medium' | 'large';
    animated?: boolean;
    onClick?: () => void;
}

export const UserLevelDisplay: React.FC<UserLevelDisplayProps> = ({
    totalPoints,
    showProgress = true,
    size = 'medium',
    animated = true,
    onClick
}) => {
    const { calculateLevel, getLevelInfo, getLevelProgress } = useLevelSystem();

    const currentLevel = calculateLevel(totalPoints);
    const levelInfo = getLevelInfo(currentLevel);
    const progress = getLevelProgress(totalPoints);

    const sizeClasses = {
        small: {
            container: 'p-2',
            icon: 'text-2xl',
            title: 'text-sm font-medium',
            level: 'text-xs',
            points: 'text-xs',
            progress: 'h-1'
        },
        medium: {
            container: 'p-4',
            icon: 'text-4xl',
            title: 'text-lg font-semibold',
            level: 'text-sm',
            points: 'text-sm',
            progress: 'h-2'
        },
        large: {
            container: 'p-6',
            icon: 'text-6xl',
            title: 'text-2xl font-bold',
            level: 'text-lg',
            points: 'text-lg',
            progress: 'h-3'
        }
    };

    const classes = sizeClasses[size];

    return (
        <motion.div
            initial={animated ? { opacity: 0, scale: 0.9 } : {}}
            animate={animated ? { opacity: 1, scale: 1 } : {}}
            whileHover={onClick ? { scale: 1.02 } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
            onClick={onClick}
            className={`
        bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl
        ${classes.container}
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
      `}
        >
            <div className="flex items-center space-x-4">
                {/* Level Icon */}
                <motion.div
                    animate={animated ? {
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                    }}
                    className={`${classes.icon} drop-shadow-sm`}
                >
                    {levelInfo.icon}
                </motion.div>

                {/* Level Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <div className={`${classes.title} text-gray-900`}>
                                {levelInfo.title}
                            </div>
                            <div className={`${classes.level} text-gray-600 flex items-center space-x-1`}>
                                <FiStar className="w-3 h-3" />
                                <span>Nivel {currentLevel}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`${classes.points} text-purple-600 font-medium flex items-center space-x-1`}>
                                <FiAward className="w-3 h-3" />
                                <span>{totalPoints.toLocaleString()}</span>
                            </div>
                            {size !== 'small' && (
                                <div className="text-xs text-gray-500">
                                    puntos totales
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {showProgress && (
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                    Progreso al nivel {progress.nextLevel}
                                </span>
                                <span className="text-xs text-gray-600">
                                    {progress.nextLevelPoints - totalPoints} puntos restantes
                                </span>
                            </div>

                            <div className={`w-full bg-gray-200 rounded-full ${classes.progress} overflow-hidden`}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress.progressPercentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`${classes.progress} bg-gradient-to-r from-purple-500 to-blue-500 rounded-full relative`}
                                >
                                    {/* Shine effect */}
                                    {animated && (
                                        <motion.div
                                            animate={{
                                                x: ['-100%', '100%']
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 3
                                            }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        />
                                    )}
                                </motion.div>
                            </div>

                            <div className="text-xs text-gray-500 text-center">
                                {Math.round(progress.progressPercentage)}% completado
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Level Benefits Preview (only for large size) */}
            {size === 'large' && levelInfo.benefits.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 pt-4 border-t border-purple-200"
                >
                    <div className="flex items-center space-x-2 mb-2">
                        <FiTrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">
                            Beneficios Activos
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {levelInfo.benefits.slice(0, 4).map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                className="flex items-center space-x-2 text-xs text-gray-700"
                            >
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                <span>{benefit}</span>
                            </motion.div>
                        ))}
                        {levelInfo.benefits.length > 4 && (
                            <div className="text-xs text-gray-500 italic">
                                +{levelInfo.benefits.length - 4} más...
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default UserLevelDisplay;