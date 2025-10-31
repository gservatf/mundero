import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface ProgressBarProps {
    current: number;
    total: number;
    showPercentage?: boolean;
    showNumbers?: boolean;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    total,
    showPercentage = true,
    showNumbers = true,
    className = ''
}) => {
    const percentage = Math.round((current / total) * 100);
    const isComplete = current >= total;

    return (
        <div className={`w-full ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {isComplete && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </motion.div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                        {isComplete ? 'Completado' : 'Progreso'}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                    {showNumbers && (
                        <span className="text-gray-600">
                            {current} / {total}
                        </span>
                    )}
                    {showPercentage && (
                        <span className={`font-semibold ${isComplete ? 'text-green-600' : 'text-blue-600'
                            }`}>
                            {percentage}%
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete
                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600'
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>

                {/* Milestone Markers */}
                <div className="absolute top-0 w-full h-3 flex items-center">
                    {[25, 50, 75].map((milestone) => (
                        <div
                            key={milestone}
                            className="absolute w-1 h-full bg-white/50"
                            style={{ left: `${milestone}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* Milestone Labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Inicio</span>
                <span className={current >= total * 0.25 ? 'text-blue-600 font-medium' : ''}>
                    25%
                </span>
                <span className={current >= total * 0.5 ? 'text-blue-600 font-medium' : ''}>
                    50%
                </span>
                <span className={current >= total * 0.75 ? 'text-blue-600 font-medium' : ''}>
                    75%
                </span>
                <span className={isComplete ? 'text-green-600 font-medium' : ''}>
                    ¡Fin!
                </span>
            </div>
        </div>
    );
};