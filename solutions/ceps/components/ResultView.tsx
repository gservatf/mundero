import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Download,
    Share2,
    RotateCcw,
    Trophy,
    Target,
    TrendingUp,
    ArrowLeft,
    Eye
} from 'lucide-react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useQuizStore } from '../state/useQuizStore';
import { computeCepsScores, getCompetencyRecommendation, getOverallProfile } from '../engine/scoring';
import { getMeta } from '../services/cepsService';
import { registerFunnelEvent } from '../services/funnelService';
import { incrementReputation, awardCepsBadge, recordCepsAchievement } from '../services/reputationService';
import { PdfReport } from './index';
import { ConfettiBurst } from './index';

export const ResultView: React.FC = () => {
    const navigate = useNavigate();
    const {
        answers,
        userId,
        mode,
        completedAt,
        startedAt,
        reset,
        companyName,
        area,
        position,
        userName,
        userEmail
    } = useQuizStore();

    const [scores, setScores] = useState<any>(null);
    const [showPdfReport, setShowPdfReport] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    const meta = getMeta();

    useEffect(() => {
        processResults();
    }, []);

    const processResults = async () => {
        try {
            // Calculate scores
            const cepsScores = computeCepsScores(answers);
            setScores(cepsScores);

            // Show confetti for high scores
            if (cepsScores.overallLevel === 'Alto') {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            }

            // Register events and reputation
            if (userId) {
                // Register conversion event
                await registerFunnelEvent(userId, "solution", "conversion", {
                    solution: "ceps",
                    overallLevel: cepsScores.overallLevel,
                    totalScore: cepsScores.totalScore,
                    completionTime: completedAt && startedAt ? completedAt - startedAt : undefined
                });

                // Award reputation and badges
                await incrementReputation(userId, 10);
                await awardCepsBadge(userId, cepsScores.overallLevel);

                // Record achievement
                const timeSpent = completedAt && startedAt ? (completedAt - startedAt) / 1000 / 60 : undefined;
                let achievementType: "completion" | "excellence" | "speed" | "perfectionist" = "completion";

                if (cepsScores.overallLevel === 'Alto') achievementType = "excellence";
                else if (timeSpent && timeSpent < 10) achievementType = "speed";
                else if (cepsScores.totalScore >= 200) achievementType = "perfectionist";

                await recordCepsAchievement(userId, {
                    type: achievementType,
                    score: cepsScores.totalScore,
                    timeSpent,
                    competencyHighlights: Object.entries(cepsScores.levelByComp)
                        .filter(([_, level]) => level === 'Alto')
                        .map(([comp, _]) => comp)
                });
            }

        } catch (error) {
            console.error('Error processing results:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getTimeSpent = () => {
        if (!completedAt || !startedAt) return null;
        const minutes = Math.round((completedAt - startedAt) / 1000 / 60);
        return `${minutes} minutos`;
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Alto': return 'bg-green-500';
            case 'Promedio': return 'bg-yellow-500';
            case 'Bajo': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getOverallMessage = () => {
        if (!scores) return '';

        const profile = getOverallProfile(scores.scores);
        const recommendations = meta.overallRecommendations;

        return recommendations[profile] || recommendations.balanced;
    };

    if (isProcessing || !scores) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Procesando tus resultados...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            {showConfetti && <ConfettiBurst />}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Trophy className="w-12 h-12 text-yellow-500" />
                        <h1 className="text-4xl font-bold text-gray-900">
                            ¡Evaluación Completada!
                        </h1>
                    </div>

                    <p className="text-lg text-gray-600 mb-2">
                        Tus Características Emprendedoras Personales (CEPS)
                    </p>

                    {mode === 'corporate' && companyName && (
                        <Badge variant="outline" className="text-purple-700 border-purple-300">
                            Evaluación Corporativa - {companyName}
                        </Badge>
                    )}
                </motion.div>

                {/* Overall Score */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <Card className="p-8 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    {scores.totalScore}
                                </div>
                                <div className="text-blue-100">
                                    Puntuación Total / 250
                                </div>
                            </div>

                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    {scores.overallLevel}
                                </div>
                                <div className="text-blue-100">
                                    Nivel General
                                </div>
                            </div>

                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    {getTimeSpent() || '--'}
                                </div>
                                <div className="text-blue-100">
                                    Tiempo Empleado
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Radar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Perfil de Competencias
                            </h3>

                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={scores.radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis
                                            angle={0}
                                            domain={[0, 25]}
                                            tick={{ fontSize: 8 }}
                                        />
                                        <Radar
                                            name="Puntuación"
                                            dataKey="A"
                                            stroke="#3B82F6"
                                            fill="#3B82F6"
                                            fillOpacity={0.3}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Puntuaciones por Competencia
                            </h3>

                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={scores.radarData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="subject"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            interval={0}
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis domain={[0, 25]} />
                                        <Tooltip />
                                        <Bar dataKey="A" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Competencies Detail */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mb-8"
                >
                    <Card className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">
                            Análisis Detallado por Competencia
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {meta.competencies.map((comp: any, index: number) => {
                                const score = scores.scores[comp.key];
                                const level = scores.levelByComp[comp.key];
                                const recommendation = getCompetencyRecommendation(comp.key, level);

                                return (
                                    <motion.div
                                        key={comp.key}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-900">
                                                {comp.label}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">
                                                    {score}
                                                </span>
                                                <Badge
                                                    className={`${getLevelColor(level)} text-white`}
                                                >
                                                    {level}
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3">
                                            {comp.description}
                                        </p>

                                        <div className="bg-gray-50 rounded p-3">
                                            <p className="text-xs text-gray-700">
                                                <strong>Recomendación:</strong> {recommendation}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>

                {/* Overall Recommendation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="mb-8"
                >
                    <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Recomendación General
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            {getOverallMessage()}
                        </p>
                    </Card>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex flex-wrap gap-4 justify-center mb-8"
                >
                    <Button
                        onClick={() => setShowPdfReport(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                    </Button>

                    <Button variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartir Resultados
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            reset();
                            navigate('/solutions/ceps/start');
                        }}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Hacer de Nuevo
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Inicio
                    </Button>
                </motion.div>

                {/* PDF Report Modal */}
                {showPdfReport && (
                    <PdfReport
                        scores={scores}
                        user={{
                            name: userName || 'Usuario',
                            email: userEmail || 'usuario@email.com'
                        }}
                        mode={mode}
                        orgInfo={mode === 'corporate' ? {
                            name: companyName || '',
                            area: area,
                            position: position
                        } : undefined}
                        onClose={() => setShowPdfReport(false)}
                    />
                )}
            </div>
        </div>
    );
};