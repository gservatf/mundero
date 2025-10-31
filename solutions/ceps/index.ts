// SOLUCIÓN CEPS (Dual Mode) - Export principal para integración
// Este archivo facilita la integración con el sistema de rutas existente

export { CepsRoutes as default, CepsMain, CepsQuiz, CepsResults, cepsRoutes } from './routes';

// Components para uso directo si se necesita
export { QuizIntro } from './components/QuizIntro';
export { QuizPlay } from './components/QuizPlay';
export { ResultView } from './components/ResultView';
export { SolutionGuard } from './components/SolutionGuard';

// State management
export { useQuizStore } from './state/useQuizStore';
export type { QuizStore } from './state/useQuizStore';

// Services para integraciones externas
export * from './services/cepsService';
export * from './services/funnelService';
export * from './services/reputationService';
export * from './services/reportService';
export * from './services/driveService';

// Engine utilities
export * from './engine/random';
export * from './engine/session';
export * from './engine/scoring';
export * from './engine/googleDriveIntegration';

// Manifest data
export { default as manifest } from './manifest.json';