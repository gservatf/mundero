import questions from "../data/cepsQuestions.json";
import meta from "../data/cepsMeta.json";
import { shuffle } from "../engine/random";

export interface CepsQuestion {
    id: number;
    text: string;
    scale: number[];
}

export interface CepsCompetency {
    key: string;
    label: string;
    description: string;
    items: number[];
}

export interface CepsMeta {
    competencies: CepsCompetency[];
    recommendations: Record<string, any>;
    overallRecommendations: Record<string, string>;
}

export function getQuestionsShuffled(): CepsQuestion[] {
    return shuffle(questions as CepsQuestion[]);
}

export function getQuestionsInOrder(): CepsQuestion[] {
    return questions as CepsQuestion[];
}

export function getQuestionById(id: number): CepsQuestion | undefined {
    return (questions as CepsQuestion[]).find(q => q.id === id);
}

export function getMeta(): CepsMeta {
    return meta as CepsMeta;
}

export function getCompetencyByKey(key: string): CepsCompetency | undefined {
    const metaData = getMeta();
    return metaData.competencies.find(comp => comp.key === key);
}

export function getCompetencies(): CepsCompetency[] {
    const metaData = getMeta();
    return metaData.competencies;
}

export function getRecommendations() {
    const metaData = getMeta();
    return metaData.recommendations;
}

export function getOverallRecommendations() {
    const metaData = getMeta();
    return metaData.overallRecommendations;
}

export function validateAnswers(answers: Record<number, number>): boolean {
    // Verificar que todas las respuestas estén en el rango válido (1-5)
    for (const [questionId, answer] of Object.entries(answers)) {
        const id = parseInt(questionId);
        if (id < 1 || id > 55) return false;
        if (answer < 1 || answer > 5) return false;
    }

    return true;
}

export function isQuizComplete(answers: Record<number, number>): boolean {
    // Verificar que se hayan respondido las 55 preguntas
    return Object.keys(answers).length === 55;
}

export function getProgress(answers: Record<number, number>): number {
    return (Object.keys(answers).length / 55) * 100;
}