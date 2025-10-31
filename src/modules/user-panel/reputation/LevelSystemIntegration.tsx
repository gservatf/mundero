// Componente de integración para el sistema de niveles
// Conecta automáticamente los eventos de reputación con el sistema de niveles

import React, { useEffect, useRef } from 'react';
import { useLevelUp, levelSystem } from './levelSystem';
import { LevelUpModal } from './LevelUpModal';
import { reputationService } from './reputationService';

interface LevelSystemIntegrationProps {
    userId: string;
    children?: React.ReactNode;
}

export const LevelSystemIntegration: React.FC<LevelSystemIntegrationProps> = ({
    userId,
    children
}) => {
    const { levelUpEvent, isModalOpen, closeModal } = useLevelUp();
    const previousLevelRef = useRef<number>(0);

    // Monitorear cambios en la reputación del usuario
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = reputationService.subscribeToUserReputation(
            userId,
            (reputation) => {
                if (reputation?.totalPoints) {
                    const currentLevel = levelSystem.calculateLevel(reputation.totalPoints);
                    const previousLevel = previousLevelRef.current;

                    if (currentLevel > previousLevel && previousLevel > 0) {
                        // Disparar evento de subida de nivel
                        levelSystem.triggerLevelUp(previousLevel, currentLevel, reputation.totalPoints, userId);
                    }

                    // Actualizar referencia del nivel anterior
                    previousLevelRef.current = currentLevel;
                }
            }
        );

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [userId]);

    // Componente renderiza sin UI visible, solo maneja la lógica
    return (
        <>
            {children}
            <LevelUpModal
                isOpen={isModalOpen}
                levelUpEvent={levelUpEvent}
                onClose={closeModal}
            />
        </>
    );
};

export default LevelSystemIntegration;