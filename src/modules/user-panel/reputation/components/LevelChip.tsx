// Componente de Chip de Nivel - Versión Animada
import React from 'react';
import { motion } from 'framer-motion';

interface LevelChipProps {
    level: number;
    name: string;
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
    className?: string;
}

export function LevelChip({
    level,
    name,
    size = 'medium',
    showIcon = true,
    className = ''
}: LevelChipProps) {

    // Colores basados en el nivel
    const getLevelColors = (level: number) => {
        switch (level) {
            case 1:
                return {
                    bg: 'bg-gray-100 dark:bg-gray-800',
                    text: 'text-gray-700 dark:text-gray-300',
                    border: 'border-gray-300 dark:border-gray-600',
                    icon: '🌱'
                };
            case 2:
                return {
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    text: 'text-green-700 dark:text-green-400',
                    border: 'border-green-300 dark:border-green-600',
                    icon: '🌿'
                };
            case 3:
                return {
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    text: 'text-blue-700 dark:text-blue-400',
                    border: 'border-blue-300 dark:border-blue-600',
                    icon: '⭐'
                };
            case 4:
                return {
                    bg: 'bg-purple-100 dark:bg-purple-900/30',
                    text: 'text-purple-700 dark:text-purple-400',
                    border: 'border-purple-300 dark:border-purple-600',
                    icon: '👑'
                };
            case 5:
                return {
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    text: 'text-yellow-700 dark:text-yellow-400',
                    border: 'border-yellow-300 dark:border-yellow-600',
                    icon: '💎'
                };
            default:
                return {
                    bg: 'bg-red-100 dark:bg-red-900/30',
                    text: 'text-red-700 dark:text-red-400',
                    border: 'border-red-300 dark:border-red-600',
                    icon: '🔥'
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return 'px-2 py-1 text-xs';
            case 'large':
                return 'px-4 py-2 text-base';
            default:
                return 'px-3 py-1.5 text-sm';
        }
    };

    const colors = getLevelColors(level);

    return (
        <motion.div
            className={`
                inline-flex items-center gap-1.5 rounded-full border font-medium
                ${colors.bg} ${colors.text} ${colors.border}
                ${getSizeClasses()}
                ${className}
                relative overflow-hidden
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
        >
            {/* Brillo sutil animado */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "linear",
                    repeatDelay: 2
                }}
            />

            {showIcon && (
                <motion.span
                    className="leading-none relative z-10"
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{
                        delay: 0.2,
                        duration: 0.4,
                        type: "spring",
                        stiffness: 300
                    }}
                >
                    {colors.icon}
                </motion.span>
            )}

            <motion.span
                className="relative z-10"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                Nivel {level} - {name}
            </motion.span>
        </motion.div>
    );
}