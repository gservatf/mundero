// Modal de recompensa al completar el onboarding
// Incluye animaciones, confeti y opciones de compartir

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
    Trophy,
    Star,
    Share2,
    MessageCircle,
    Sparkles,
    Gift,
    X,
    ExternalLink,
    Heart,
    Zap
} from 'lucide-react';
import { OnboardingProgress } from './types';

interface WelcomeRewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    progress: OnboardingProgress | null;
}

export const WelcomeRewardModal: React.FC<WelcomeRewardModalProps> = ({
    isOpen,
    onClose,
    progress
}) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [currentBadgeIndex, setCCurrentBadgeIndex] = useState(0);
    const [isSharing, setIsSharing] = useState(false);

    // Activar confeti al abrir el modal
    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Animación rotativa de badges
    useEffect(() => {
        if (!isOpen || !progress?.badgesEarned?.length) return;

        const interval = setInterval(() => {
            setCCurrentBadgeIndex(prev =>
                (prev + 1) % (progress.badgesEarned?.length || 1)
            );
        }, 2000);

        return () => clearInterval(interval);
    }, [isOpen, progress?.badgesEarned?.length]);

    const handleShareToFeed = async () => {
        try {
            setIsSharing(true);

            // Crear post de logro en el feed
            const shareData = {
                type: 'achievement',
                title: '¡Completé mi aventura inicial en Mundero! 🎉',
                content: `He terminado todas las misiones de bienvenida y gané ${progress?.totalPoints || 0} puntos. ¡Estoy listo para explorar toda la plataforma!`,
                achievements: {
                    totalPoints: progress?.totalPoints || 0,
                    badgesEarned: progress?.badgesEarned || [],
                    completionTime: progress?.completedAt && progress?.startedAt
                        ? Math.round((new Date(progress.completedAt).getTime() - new Date(progress.startedAt).getTime()) / (1000 * 60))
                        : null
                },
                tags: ['onboarding', 'achievement', 'welcome']
            };

            // TODO: Integrar con feedService para crear post automático
            console.log('Sharing achievement to feed:', shareData);

            // Simular compartir
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('¡Logro compartido en tu feed!');
            onClose();
        } catch (error) {
            console.error('Error sharing to feed:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleShareToWhatsApp = () => {
        const message = `¡Acabo de completar mi aventura inicial en Mundero! 🎉\n\n` +
            `✨ ${progress?.totalPoints || 0} puntos ganados\n` +
            `🏅 ${progress?.badgesEarned?.length || 0} badges obtenidos\n\n` +
            `¡Únete a la comunidad más innovadora!`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const getBadgeEmoji = (badge: string) => {
        const badgeMap: Record<string, string> = {
            'starter': '🚀',
            'connector': '🤝',
            'first_voice': '🎤',
            'explorer': '🗺️',
            'achiever': '🏆',
            'social': '👥'
        };
        return badgeMap[badge] || '🏅';
    };

    const getBadgeTitle = (badge: string) => {
        const titleMap: Record<string, string> = {
            'starter': 'Iniciador',
            'connector': 'Conector',
            'first_voice': 'Primera Voz',
            'explorer': 'Explorador',
            'achiever': 'Triunfador',
            'social': 'Social'
        };
        return titleMap[badge] || badge;
    };

    if (!isOpen) return null;

    const completionTime = progress?.completedAt && progress?.startedAt
        ? Math.round((new Date(progress.completedAt).getTime() - new Date(progress.startedAt).getTime()) / (1000 * 60))
        : 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Confeti animado */}
                    {showConfetti && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{
                                        y: -10,
                                        x: Math.random() * 400,
                                        opacity: 1,
                                        scale: Math.random() * 0.5 + 0.5
                                    }}
                                    animate={{
                                        y: 600,
                                        rotate: 360,
                                        opacity: 0
                                    }}
                                    transition={{
                                        duration: 3,
                                        delay: Math.random() * 0.5,
                                        ease: "easeOut"
                                    }}
                                    className="absolute text-2xl"
                                >
                                    {['🎉', '✨', '🌟', '🎊', '🏆'][Math.floor(Math.random() * 5)]}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Header con gradiente */}
                    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 p-6 text-white text-center relative overflow-hidden">
                        {/* Botón cerrar */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Glow effect rotatorio */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{
                                x: ['-100%', '100%']
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />

                        {/* Icono principal */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="relative z-10"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                                <Trophy className="h-10 w-10 text-yellow-300" />
                            </div>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold mb-2"
                        >
                            ¡Felicidades!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-blue-100"
                        >
                            Has completado tu aventura inicial en Mundero
                        </motion.p>
                    </div>

                    {/* Contenido principal */}
                    <div className="p-6 space-y-6">
                        {/* Estadísticas */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-3 gap-4"
                        >
                            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                                <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                                <div className="text-lg font-bold text-gray-900">
                                    {progress?.totalPoints || 0}
                                </div>
                                <div className="text-xs text-gray-600">Puntos</div>
                            </div>

                            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                                <Gift className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                                <div className="text-lg font-bold text-gray-900">
                                    {progress?.badgesEarned?.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">Badges</div>
                            </div>

                            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                                <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                                <div className="text-lg font-bold text-gray-900">
                                    {completionTime}
                                </div>
                                <div className="text-xs text-gray-600">Minutos</div>
                            </div>
                        </motion.div>

                        {/* Badges obtenidos */}
                        {progress?.badgesEarned && progress.badgesEarned.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-center"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Badges Obtenidos
                                </h3>

                                <div className="relative h-16 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentBadgeIndex}
                                            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                            transition={{ duration: 0.5 }}
                                            className="flex flex-col items-center"
                                        >
                                            <div className="text-4xl mb-1">
                                                {getBadgeEmoji(progress.badgesEarned[currentBadgeIndex])}
                                            </div>
                                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                                                {getBadgeTitle(progress.badgesEarned[currentBadgeIndex])}
                                            </Badge>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {progress.badgesEarned.length > 1 && (
                                    <div className="flex justify-center space-x-1 mt-2">
                                        {progress.badgesEarned.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`w-2 h-2 rounded-full transition-colors ${index === currentBadgeIndex
                                                    ? 'bg-purple-500'
                                                    : 'bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Mensaje especial */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                        >
                            <Sparkles className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-700 font-medium">
                                ¡Ahora tienes acceso completo a todas las funciones de Mundero!
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Explora comunidades, conecta con otros usuarios y comparte tu contenido
                            </p>
                        </motion.div>

                        {/* Botones de acción */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="space-y-3"
                        >
                            <Button
                                onClick={handleShareToFeed}
                                disabled={isSharing}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                {isSharing ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                        <span>Compartiendo...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Heart className="h-4 w-4 mr-2" />
                                        Compartir en mi Feed
                                    </>
                                )}
                            </Button>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={handleShareToWhatsApp}
                                    variant="outline"
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    WhatsApp
                                </Button>

                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Explorar
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};