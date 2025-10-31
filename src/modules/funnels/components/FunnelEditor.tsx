// Funnel Editor Component
// Visual editor for creating and editing funnels

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Save,
    Eye,
    Settings,
    ArrowUp,
    ArrowDown,
    Trash2,
    Copy,
    FileText,
    Image,
    Link,
    Mail
} from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Funnel, FunnelStep, Organization } from '../types';
import { funnelsService } from '../../../services/funnelsService';
import useFunnelEditorStore from '../store/funnelEditorStore';
import { FunnelLivePreview } from './FunnelLivePreview.tsx';

interface FunnelEditorProps {
    organization: Organization;
    funnel?: Funnel;
    onSave: (funnel: Funnel) => void;
    onCancel: () => void;
}

export const FunnelEditor: React.FC<FunnelEditorProps> = ({
    organization,
    funnel,
    onSave,
    onCancel
}) => {
    const {
        currentFunnel,
        selectedStep,
        previewMode,
        isLoading,
        error,
        setCurrentFunnel,
        updateFunnelStep,
        addFunnelStep,
        removeFunnelStep,
        reorderSteps,
        setSelectedStep,
        setPreviewMode,
        setLoading,
        setError
    } = useFunnelEditorStore();

    const [activeTab, setActiveTab] = useState('builder');

    useEffect(() => {
        if (funnel) {
            setCurrentFunnel(funnel);
        } else {
            // Initialize new funnel
            setCurrentFunnel({
                name: '',
                description: '',
                organizationId: organization.id,
                slug: '',
                status: 'draft',
                steps: [],
                settings: {
                    collectEmail: true,
                    collectPhone: false,
                    customFields: [],
                    thankYouMessage: '¡Gracias por tu interés! Te contactaremos pronto.'
                },
                analytics: {
                    views: 0,
                    submissions: 0,
                    conversionRate: 0,
                    lastUpdated: new Date()
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: '',
                tags: []
            });
        }
    }, [funnel, organization.id, setCurrentFunnel]);

    const handleSaveFunnel = async () => {
        if (!currentFunnel) return;

        try {
            setLoading(true);
            setError(null);

            if (funnel?.id) {
                // Update existing funnel
                await funnelsService.updateFunnel(funnel.id, 'current-user-id', {
                    name: currentFunnel.name!,
                    description: currentFunnel.description,
                    steps: currentFunnel.steps!,
                    settings: currentFunnel.settings!,
                    status: currentFunnel.status
                });
                onSave({ ...funnel, ...currentFunnel } as Funnel);
            } else {
                // Create new funnel
                const funnelId = await funnelsService.createFunnel(
                    organization.id,
                    'current-user-id', // TODO: Get from auth context
                    {
                        name: currentFunnel.name!,
                        description: currentFunnel.description,
                        steps: currentFunnel.steps!,
                        settings: currentFunnel.settings!
                    }
                );

                const newFunnel = await funnelsService.getFunnel(funnelId);
                if (newFunnel) {
                    onSave(newFunnel);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error saving funnel');
        } finally {
            setLoading(false);
        }
    };

    const addStep = (type: FunnelStep['type']) => {
        const stepTemplates = {
            landing: {
                type: 'landing' as const,
                title: 'Página de Aterrizaje',
                content: '<h1>Bienvenido</h1><p>Descubre nuestra propuesta de valor única.</p>',
                order: 0,
                settings: {}
            },
            form: {
                type: 'form' as const,
                title: 'Formulario de Contacto',
                content: '<h2>¡Nos interesa conocerte!</h2><p>Déjanos tus datos y te contactaremos.</p>',
                order: 0,
                settings: {
                    fields: ['name', 'email']
                }
            },
            content: {
                type: 'content' as const,
                title: 'Contenido Informativo',
                content: '<h2>Más información</h2><p>Aquí puedes agregar contenido relevante.</p>',
                order: 0,
                settings: {}
            },
            redirect: {
                type: 'redirect' as const,
                title: 'Redirección',
                content: '<h2>Redirigiendo...</h2><p>Serás redirigido automáticamente.</p>',
                order: 0,
                settings: {
                    url: 'https://example.com',
                    delay: 3
                }
            }
        };

        addFunnelStep(stepTemplates[type]);
    };

    const getStepIcon = (type: FunnelStep['type']) => {
        switch (type) {
            case 'landing': return <FileText className="h-4 w-4" />;
            case 'form': return <Mail className="h-4 w-4" />;
            case 'content': return <Image className="h-4 w-4" />;
            case 'redirect': return <Link className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const moveStep = (stepId: string, direction: 'up' | 'down') => {
        if (!currentFunnel?.steps) return;

        const stepIndex = currentFunnel.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return;

        const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
        if (newIndex < 0 || newIndex >= currentFunnel.steps.length) return;

        reorderSteps(stepIndex, newIndex);
    };

    if (previewMode && currentFunnel) {
        return (
            <FunnelLivePreview
                funnel={currentFunnel as Funnel}
                onBack={() => setPreviewMode(false)}
            />
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={onCancel}>
                            ← Volver
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                {funnel ? 'Editar Funnel' : 'Nuevo Funnel'}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {currentFunnel?.name || 'Sin nombre'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPreviewMode(true)}
                            disabled={!currentFunnel?.steps?.length}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Vista Previa
                        </Button>
                        <Button
                            onClick={handleSaveFunnel}
                            disabled={isLoading || !currentFunnel?.name}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                        <TabsList className="w-full grid grid-cols-2 p-1 m-1">
                            <TabsTrigger value="builder">Constructor</TabsTrigger>
                            <TabsTrigger value="settings">Configuración</TabsTrigger>
                        </TabsList>

                        <TabsContent value="builder" className="p-4 space-y-4">
                            {/* Funnel Info */}
                            <Card className="p-4">
                                <h3 className="font-medium text-gray-900 mb-3">Información Básica</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del Funnel
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ej: Captación de Leads"
                                            value={currentFunnel?.name || ''}
                                            onChange={(e) => setCurrentFunnel({
                                                ...currentFunnel,
                                                name: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={3}
                                            placeholder="Describe el propósito de este funnel..."
                                            value={currentFunnel?.description || ''}
                                            onChange={(e) => setCurrentFunnel({
                                                ...currentFunnel,
                                                description: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Add Steps */}
                            <Card className="p-4">
                                <h3 className="font-medium text-gray-900 mb-3">Agregar Pasos</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-auto p-3 flex flex-col items-center gap-2"
                                        onClick={() => addStep('landing')}
                                    >
                                        <FileText className="h-5 w-5" />
                                        <span className="text-xs">Landing</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-auto p-3 flex flex-col items-center gap-2"
                                        onClick={() => addStep('form')}
                                    >
                                        <Mail className="h-5 w-5" />
                                        <span className="text-xs">Formulario</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-auto p-3 flex flex-col items-center gap-2"
                                        onClick={() => addStep('content')}
                                    >
                                        <Image className="h-5 w-5" />
                                        <span className="text-xs">Contenido</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-auto p-3 flex flex-col items-center gap-2"
                                        onClick={() => addStep('redirect')}
                                    >
                                        <Link className="h-5 w-5" />
                                        <span className="text-xs">Redirección</span>
                                    </Button>
                                </div>
                            </Card>

                            {/* Steps List */}
                            <Card className="p-4">
                                <h3 className="font-medium text-gray-900 mb-3">
                                    Pasos ({currentFunnel?.steps?.length || 0})
                                </h3>
                                <div className="space-y-2">
                                    {currentFunnel?.steps?.map((step, index) => (
                                        <div
                                            key={step.id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedStep === step.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setSelectedStep(step.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getStepIcon(step.type)}
                                                    <span className="text-sm font-medium">{step.title}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveStep(step.id, 'up');
                                                        }}
                                                        disabled={index === 0}
                                                    >
                                                        <ArrowUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveStep(step.id, 'down');
                                                        }}
                                                        disabled={index === currentFunnel.steps!.length - 1}
                                                    >
                                                        <ArrowDown className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFunnelStep(step.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="mt-2 text-xs">
                                                {step.type}
                                            </Badge>
                                        </div>
                                    )) || (
                                            <p className="text-sm text-gray-500 text-center py-4">
                                                No hay pasos aún. Agrega algunos usando los botones de arriba.
                                            </p>
                                        )}
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="p-4 space-y-4">
                            <Card className="p-4">
                                <h3 className="font-medium text-gray-900 mb-3">Configuración del Formulario</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={currentFunnel?.settings?.collectEmail || false}
                                            onChange={(e) => setCurrentFunnel({
                                                ...currentFunnel,
                                                settings: {
                                                    ...currentFunnel?.settings,
                                                    collectEmail: e.target.checked
                                                }
                                            })}
                                        />
                                        <span className="text-sm">Recopilar email</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={currentFunnel?.settings?.collectPhone || false}
                                            onChange={(e) => setCurrentFunnel({
                                                ...currentFunnel,
                                                settings: {
                                                    collectEmail: true,
                                                    collectPhone: e.target.checked,
                                                    customFields: currentFunnel?.settings?.customFields || [],
                                                    thankYouMessage: currentFunnel?.settings?.thankYouMessage || 'Thank you!',
                                                    redirectUrl: currentFunnel?.settings?.redirectUrl
                                                }
                                            })}
                                        />
                                        <span className="text-sm">Recopilar teléfono</span>
                                    </label>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <h3 className="font-medium text-gray-900 mb-3">Mensaje de Agradecimiento</h3>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={4}
                                    placeholder="Mensaje que se mostrará después del envío..."
                                    value={currentFunnel?.settings?.thankYouMessage || ''}
                                    onChange={(e) => setCurrentFunnel({
                                        ...currentFunnel,
                                        settings: {
                                            collectEmail: true,
                                            collectPhone: currentFunnel?.settings?.collectPhone || false,
                                            customFields: currentFunnel?.settings?.customFields || [],
                                            thankYouMessage: e.target.value,
                                            redirectUrl: currentFunnel?.settings?.redirectUrl
                                        }
                                    })}
                                />
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 p-6">
                    {selectedStep ? (
                        <StepEditor
                            step={currentFunnel?.steps?.find(s => s.id === selectedStep)!}
                            onUpdate={(updates) => updateFunnelStep(selectedStep, updates)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg font-medium">Selecciona un paso para editar</p>
                                <p className="text-sm">O agrega un nuevo paso desde la barra lateral</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg"
                    >
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-white hover:bg-red-600"
                            onClick={() => setError(null)}
                        >
                            Cerrar
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Step Editor Component
interface StepEditorProps {
    step: FunnelStep;
    onUpdate: (updates: Partial<FunnelStep>) => void;
}

const StepEditor: React.FC<StepEditorProps> = ({ step, onUpdate }) => {
    return (
        <Card className="p-6 h-full">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Editando: {step.title}
                </h2>
                <Badge variant="outline">{step.type}</Badge>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título del Paso
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={step.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contenido HTML
                    </label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        rows={12}
                        value={step.content}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="<h1>Tu contenido aquí</h1>"
                    />
                </div>

                {step.type === 'redirect' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL de Redirección
                        </label>
                        <input
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={step.settings?.url || ''}
                            onChange={(e) => onUpdate({
                                settings: { ...step.settings, url: e.target.value }
                            })}
                            placeholder="https://ejemplo.com"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
};