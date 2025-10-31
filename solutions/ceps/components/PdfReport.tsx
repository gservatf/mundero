import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Building, User, CheckCircle, Loader } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { buildUserPdf, generatePdfFileName } from '../services/reportService';
import { pushCorporateReport } from '../services/driveService';
import { CepsScoreResult } from '../engine/scoring';

interface PdfReportProps {
    scores: CepsScoreResult;
    user: {
        name: string;
        email: string;
    };
    mode: 'user' | 'corporate';
    orgInfo?: {
        name: string;
        area?: string;
        position?: string;
    };
    onClose: () => void;
}

export const PdfReport: React.FC<PdfReportProps> = ({
    scores,
    user,
    mode,
    orgInfo,
    onClose
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{
        success: boolean;
        driveUrl?: string;
        error?: string;
    } | null>(null);

    const handleDownload = async () => {
        setIsGenerating(true);

        try {
            // Generate PDF
            const pdfBlob = await buildUserPdf({
                user,
                logoUrl: "https://drive.google.com/uc?id=1ytsRTacOp-9ZqtIq2nxf64CYVAsBFYKD",
                scores,
                mode,
                orgInfo
            });

            // Download file
            const fileName = generatePdfFileName(user.name, mode);
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // If corporate mode, also upload to Drive
            if (mode === 'corporate' && orgInfo) {
                setIsUploading(true);

                try {
                    const result = await pushCorporateReport({
                        user,
                        org: {
                            id: 'demo-org',
                            name: orgInfo.name,
                            area: orgInfo.area,
                            position: orgInfo.position
                        },
                        pdfBlob,
                        scores: scores.scores,
                        overallLevel: scores.overallLevel
                    });

                    setUploadResult(result);
                } catch (error) {
                    setUploadResult({
                        success: false,
                        error: error instanceof Error ? error.message : 'Error desconocido'
                    });
                } finally {
                    setIsUploading(false);
                }
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error al generar el PDF. Por favor intenta de nuevo.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl"
                >
                    <Card className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                {mode === 'corporate' ? (
                                    <Building className="w-6 h-6 text-purple-600" />
                                ) : (
                                    <User className="w-6 h-6 text-blue-600" />
                                )}
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Reporte PDF CEPS
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {mode === 'corporate' ? 'Evaluación Corporativa' : 'Evaluación Personal'}
                                    </p>
                                </div>
                            </div>

                            <Button variant="outline" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Preview Info */}
                        <div className="space-y-4 mb-6">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Contenido del Reporte
                                </h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Puntuación total y nivel general</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Gráfico radar de competencias</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Análisis detallado por competencia</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Recomendaciones personalizadas</span>
                                    </div>
                                    {mode === 'corporate' && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-500" />
                                            <span>Logo corporativo WeC</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Información del Reporte
                                </h4>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Nombre:</span>
                                        <div className="font-medium">{user.name}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Email:</span>
                                        <div className="font-medium">{user.email}</div>
                                    </div>

                                    {mode === 'corporate' && orgInfo && (
                                        <>
                                            <div>
                                                <span className="text-gray-600">Empresa:</span>
                                                <div className="font-medium">{orgInfo.name}</div>
                                            </div>
                                            {orgInfo.area && (
                                                <div>
                                                    <span className="text-gray-600">Área:</span>
                                                    <div className="font-medium">{orgInfo.area}</div>
                                                </div>
                                            )}
                                            {orgInfo.position && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-600">Puesto:</span>
                                                    <div className="font-medium">{orgInfo.position}</div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Results Summary */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Resumen de Resultados
                                </h4>

                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {scores.totalScore}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Puntuación Total
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <Badge
                                            className={`text-sm ${scores.overallLevel === 'Alto' ? 'bg-green-500' :
                                                    scores.overallLevel === 'Promedio' ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                } text-white`}
                                        >
                                            {scores.overallLevel}
                                        </Badge>
                                        <div className="text-xs text-gray-600 mt-1">
                                            Nivel General
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {Object.values(scores.levelByComp).filter(l => l === 'Alto').length}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Competencias Altas
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Corporate Upload Status */}
                        {mode === 'corporate' && (isUploading || uploadResult) && (
                            <div className="mb-6">
                                {isUploading && (
                                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                                            <div>
                                                <p className="text-blue-800 font-medium">
                                                    Subiendo a Google Drive...
                                                </p>
                                                <p className="text-blue-600 text-sm">
                                                    Guardando en carpeta corporativa y actualizando registro Excel
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {uploadResult && (
                                    <div className={`border rounded-lg p-4 ${uploadResult.success
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-red-200 bg-red-50'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className={`w-5 h-5 ${uploadResult.success ? 'text-green-600' : 'text-red-600'
                                                }`} />
                                            <div>
                                                <p className={`font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'
                                                    }`}>
                                                    {uploadResult.success
                                                        ? '¡Reporte subido exitosamente!'
                                                        : 'Error al subir reporte'
                                                    }
                                                </p>
                                                {uploadResult.success ? (
                                                    <p className="text-green-600 text-sm">
                                                        El reporte ha sido guardado en Google Drive y registrado en Excel
                                                    </p>
                                                ) : (
                                                    <p className="text-red-600 text-sm">
                                                        {uploadResult.error || 'Error desconocido'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleDownload}
                                disabled={isGenerating || isUploading}
                                className="flex-1"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Generando PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Descargar PDF
                                    </>
                                )}
                            </Button>

                            <Button variant="outline" onClick={onClose}>
                                Cerrar
                            </Button>
                        </div>

                        {/* Corporate Mode Note */}
                        {mode === 'corporate' && (
                            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-purple-700">
                                    <strong>Modo Corporativo:</strong> El reporte se descargará en tu dispositivo
                                    y también se enviará automáticamente a Google Drive para registro corporativo.
                                </p>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};