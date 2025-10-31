import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CepsQuestion } from '../services/cepsService';

interface QuestionCardProps {
    question: CepsQuestion;
    answer?: number;
    onAnswer: (value: number) => void;
    questionNumber: number;
    totalQuestions: number;
    isAnimating?: boolean;
}

const scaleLabels = [
    { value: 1, label: 'Nunca', color: 'bg-red-500', description: 'No me describe en absoluto' },
    { value: 2, label: 'Rara vez', color: 'bg-orange-500', description: 'Me describe muy poco' },
    { value: 3, label: 'A veces', color: 'bg-yellow-500', description: 'Me describe moderadamente' },
    { value: 4, label: 'Frecuentemente', color: 'bg-blue-500', description: 'Me describe bastante bien' },
    { value: 5, label: 'Siempre', color: 'bg-green-500', description: 'Me describe perfectamente' }
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    answer,
    onAnswer,
    questionNumber,
    totalQuestions,
    isAnimating = false
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            <Card className="p-8 bg-white shadow-lg">
                {/* Question Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500">
                            Pregunta {questionNumber} de {totalQuestions}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                            ID: {question.id}
                        </span>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                        {question.text}
                    </h2>
                </div>

                {/* Scale Options */}
                <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                        Selecciona qué tan bien te describe esta afirmación:
                    </p>

                    {scaleLabels.map((option) => (
                        <motion.div
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant={answer === option.value ? "default" : "outline"}
                                className={`w-full p-4 h-auto text-left transition-all duration-200 ${answer === option.value
                                        ? `${option.color} text-white shadow-lg`
                                        : 'hover:shadow-md hover:bg-gray-50'
                                    }`}
                                onClick={() => onAnswer(option.value)}
                                disabled={isAnimating}
                            >
                                <div className="flex items-center w-full">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current mr-4">
                                        <span className="font-bold text-sm">
                                            {option.value}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="font-semibold text-base">
                                            {option.label}
                                        </div>
                                        <div className="text-sm opacity-75">
                                            {option.description}
                                        </div>
                                    </div>

                                    {answer === option.value && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full bg-white text-current flex items-center justify-center ml-4"
                                        >
                                            <span className="text-xs">✓</span>
                                        </motion.div>
                                    )}
                                </div>
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Visual Scale */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Nunca (1)</span>
                        <span>Neutral (3)</span>
                        <span>Siempre (5)</span>
                    </div>

                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <div
                                key={value}
                                className={`flex-1 h-2 rounded transition-all duration-300 ${answer && answer >= value
                                        ? scaleLabels[value - 1].color
                                        : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Answer Feedback */}
                {answer && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-blue-50 rounded-lg"
                    >
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Tu respuesta:</span> {scaleLabels[answer - 1].label}
                            <span className="text-blue-600 ml-2">
                                ({scaleLabels[answer - 1].description})
                            </span>
                        </p>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
};