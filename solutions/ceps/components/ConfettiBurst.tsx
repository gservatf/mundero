import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const ConfettiBurst: React.FC = () => {
    const [particles, setParticles] = useState<Array<{
        id: number;
        x: number;
        y: number;
        color: string;
        size: number;
        velocity: { x: number; y: number };
        rotation: number;
        rotationSpeed: number;
    }>>([]);

    useEffect(() => {
        // Generate confetti particles
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: -10,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            velocity: {
                x: (Math.random() - 0.5) * 4,
                y: Math.random() * 3 + 2
            },
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        }));

        setParticles(newParticles);

        // Animate particles
        const interval = setInterval(() => {
            setParticles(prev =>
                prev.map(particle => ({
                    ...particle,
                    x: particle.x + particle.velocity.x,
                    y: particle.y + particle.velocity.y,
                    rotation: particle.rotation + particle.rotationSpeed,
                    velocity: {
                        ...particle.velocity,
                        y: particle.velocity.y + 0.1 // gravity
                    }
                })).filter(particle => particle.y < window.innerHeight + 50)
            );
        }, 16); // ~60fps

        // Clean up after 3 seconds
        const timeout = setTimeout(() => {
            clearInterval(interval);
            setParticles([]);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        borderRadius: '50%',
                        transform: `rotate(${particle.rotation}deg)`
                    }}
                    animate={{
                        scale: [1, 1.2, 0.8, 1],
                        opacity: [1, 0.8, 0.6, 0]
                    }}
                    transition={{
                        duration: 2,
                        ease: "easeOut"
                    }}
                />
            ))}

            {/* Emoji confetti */}
            {['🎉', '🎊', '🌟', '✨', '🏆'].map((emoji, index) => (
                <motion.div
                    key={`emoji-${index}`}
                    className="absolute text-4xl"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: -50,
                        rotate: 0,
                        scale: 0
                    }}
                    animate={{
                        y: window.innerHeight + 50,
                        rotate: 360,
                        scale: [0, 1, 0.8, 1, 0]
                    }}
                    transition={{
                        duration: 3,
                        delay: index * 0.2,
                        ease: "easeOut"
                    }}
                >
                    {emoji}
                </motion.div>
            ))}
        </div>
    );
};