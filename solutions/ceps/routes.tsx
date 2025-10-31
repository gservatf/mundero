import React from 'react';
import { SolutionGuard } from './components/SolutionGuard';
import { QuizIntro } from './components/QuizIntro';
import { QuizPlay } from './components/QuizPlay';
import { ResultView } from './components/ResultView';
import { useQuizStore } from './state/useQuizStore';

export const CepsRoutes: React.FC = () => {
    const { currentQuestionIndex, completedAt, order } = useQuizStore();

    const renderCurrentView = () => {
        // Check if quiz is completed
        if (completedAt) {
            return <ResultView />;
        }

        // Check if quiz hasn't started yet (no order or at beginning)
        if (order.length === 0 || currentQuestionIndex === 0) {
            return <QuizIntro />;
        }

        return <QuizPlay />;
    };

    return (
        <SolutionGuard>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {renderCurrentView()}
            </div>
        </SolutionGuard>
    );
};

// Export individual route components for external routing systems
export const CepsMain = () => (
    <SolutionGuard>
        <QuizIntro />
    </SolutionGuard>
);

export const CepsQuiz = () => (
    <SolutionGuard>
        <QuizPlay />
    </SolutionGuard>
);

export const CepsResults = () => (
    <SolutionGuard>
        <ResultView />
    </SolutionGuard>
);

// Routes configuration for integration with existing routing system
export const cepsRoutes = [
    {
        path: '/solutions/ceps',
        component: CepsMain,
        exact: true,
        title: 'CEPS - Cuestionario de Escalas de Personalidad Situacional',
        description: 'Evaluación psicométrica de personalidad en contextos organizacionales',
        permissions: ['org_solutions']
    },
    {
        path: '/solutions/ceps/quiz',
        component: CepsQuiz,
        exact: true,
        title: 'CEPS - Evaluación en Curso',
        description: 'Cuestionario de personalidad situacional',
        permissions: ['org_solutions']
    },
    {
        path: '/solutions/ceps/results',
        component: CepsResults,
        exact: true,
        title: 'CEPS - Resultados',
        description: 'Resultados de la evaluación CEPS',
        permissions: ['org_solutions']
    }
];

export default CepsRoutes;