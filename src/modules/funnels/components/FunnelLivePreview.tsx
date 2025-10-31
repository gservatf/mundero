// Funnel Live Preview Component
// Real-time preview of funnel as it would appear to users

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Funnel, FunnelStep } from '../types';

interface FunnelLivePreviewProps {
    funnel: Funnel;
    onBack: () => void;
}

export const FunnelLivePreview: React.FC<FunnelLivePreviewProps> = ({
    funnel,
    onBack
}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [formData, setFormData] = useState<Record<string, string>>({});

    const currentStep = funnel.steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === funnel.steps.length - 1;

    const nextStep = () => {
        if (!isLastStep) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const prevStep = () => {
        if (!isFirstStep) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulate form submission
        if (currentStep.type === 'form') {
            console.log('Form submitted:', formData);

            // Move to next step or show thank you message
            if (!isLastStep) {
                nextStep();
            } else {
                alert(funnel.settings.thankYouMessage);
            }
        }
    };

    const getDeviceStyles = () => {
        switch (device) {
            case 'mobile':
                return 'max-w-sm mx-auto';
            case 'tablet':
                return 'max-w-2xl mx-auto';
            case 'desktop':
            default:
                return 'max-w-4xl mx-auto';
        }
    };

    const getDeviceIcon = () => {
        switch (device) {
            case 'mobile':
                return <Smartphone className="h-4 w-4" />;
            case 'tablet':
                return <Tablet className="h-4 w-4" />;
            case 'desktop':
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    const renderStepContent = (step: FunnelStep) => {
        switch (step.type) {
            case 'form':
                return (
                    <div className="space-y-6">
                        <div
                            dangerouslySetInnerHTML={{ __html: step.content }}
                            className="prose prose-lg max-w-none"
                        />

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {funnel.settings.collectEmail && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="tu@email.com"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            )}

                            {funnel.settings.collectPhone && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+1 234 567 8900"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tu nombre completo"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3">
                                Enviar
                            </Button>
                        </form>
                    </div>
                );

            case 'redirect':
                return (
                    <div className="text-center space-y-6">
                        <div
                            dangerouslySetInnerHTML={{ __html: step.content }}
                            className="prose prose-lg max-w-none mx-auto"
                        />

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">
                                Redirigiendo a:
                            </p>
                            <p className="font-mono text-sm text-blue-600">
                                {step.settings?.url || 'URL no configurada'}
                            </p>
                        </div>

                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.open(step.settings?.url, '_blank')}
                            disabled={!step.settings?.url}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ir al enlace
                        </Button>
                    </div>
                );

            default:
                return (
                    <div
                        dangerouslySetInnerHTML={{ __html: step.content }}
                        className="prose prose-lg max-w-none"
                    />
                );
        }
    };

    if (!currentStep) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-gray-600 mb-4">No hay pasos para mostrar</p>
                    <Button onClick={onBack}>Volver al editor</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al Editor
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                Vista Previa: {funnel.name}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Paso {currentStepIndex + 1} de {funnel.steps.length}: {currentStep.title}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Device Selector */}
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <Button
                                variant={device === 'desktop' ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-none"
                                onClick={() => setDevice('desktop')}
                            >
                                <Monitor className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={device === 'tablet' ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-none"
                                onClick={() => setDevice('tablet')}
                            >
                                <Tablet className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={device === 'mobile' ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-none"
                                onClick={() => setDevice('mobile')}
                            >
                                <Smartphone className="h-4 w-4" />
                            </Button>
                        </div>

                        <Badge variant="outline" className="flex items-center gap-1">
                            {getDeviceIcon()}
                            {device.charAt(0).toUpperCase() + device.slice(1)}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        disabled={isFirstStep}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Anterior
                    </Button>

                    <div className="flex items-center gap-2">
                        {funnel.steps.map((_, index) => (
                            <button
                                key={index}
                                className={`w-3 h-3 rounded-full transition-colors ${index === currentStepIndex
                                        ? 'bg-blue-600'
                                        : index < currentStepIndex
                                            ? 'bg-green-500'
                                            : 'bg-gray-300'
                                    }`}
                                onClick={() => setCurrentStepIndex(index)}
                                title={`Paso ${index + 1}`}
                            />
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={nextStep}
                        disabled={isLastStep}
                    >
                        Siguiente
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className={getDeviceStyles()}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="p-8 shadow-lg">
                                <div className="mb-6">
                                    <Badge variant="outline" className="mb-2">
                                        {currentStep.type}
                                    </Badge>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {currentStep.title}
                                    </h1>
                                </div>

                                {renderStepContent(currentStep)}
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-white border-t border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        URL de vista previa: {window.location.origin}/{funnel.organizationId}/{funnel.slug}
                    </span>
                    <span>
                        Última actualización: {new Date(funnel.updatedAt).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};