// Workflow Editor Component
// Visual workflow builder using React Flow

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    ConnectionMode,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Save,
    Play,
    Plus,
    Settings,
    Trash2,
    Mail,
    Clock,
    Webhook,
    UserCheck,
    Zap
} from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Workflow, WorkflowNode, WorkflowEdge } from '../types';
import useWorkflowEditorStore from '../store/workflowEditorStore';

// Custom Node Types
const nodeTypes = {
    email: EmailNode,
    webhook: WebhookNode,
    delay: DelayNode,
    notifyHr: NotifyHrNode,
    startSolution: StartSolutionNode,
    condition: ConditionNode,
};

interface WorkflowEditorProps {
    workflow?: Workflow;
    onSave: (workflow: Partial<Workflow>) => void;
    onCancel: () => void;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
    workflow,
    onSave,
    onCancel
}) => {
    const {
        nodes,
        edges,
        selectedNode,
        isLoading,
        error,
        setNodes,
        setEdges,
        addNode,
        updateNode,
        removeNode,
        setSelectedNode,
        setLoading,
        setError
    } = useWorkflowEditorStore();

    const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState([]);
    const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState([]);
    const [workflowName, setWorkflowName] = useState('');
    const [workflowDescription, setWorkflowDescription] = useState('');

    useEffect(() => {
        if (workflow) {
            setWorkflowName(workflow.name);
            setWorkflowDescription(workflow.description || '');
            setNodes(workflow.nodes);
            setEdges(workflow.edges);

            // Convert to React Flow format
            setReactFlowNodes(workflow.nodes.map(node => ({
                id: node.id,
                type: node.type.toLowerCase(),
                position: node.position,
                data: node.data
            })));

            setReactFlowEdges(workflow.edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: edge.type || 'default'
            })));
        }
    }, [workflow, setNodes, setEdges, setReactFlowNodes, setReactFlowEdges]);

    const onConnect = useCallback(
        (params: Connection) => {
            const newEdge = {
                ...params,
                id: `edge_${Date.now()}`
            };
            setReactFlowEdges((edges: Edge[]) => addEdge(newEdge, edges));
        },
        [setReactFlowEdges]
    );

    const addWorkflowNode = (type: WorkflowNode['type']) => {
        const nodeConfig = {
            EMAIL: {
                label: 'Enviar Email',
                config: {
                    subject: '',
                    template: '',
                    delay: 0
                }
            },
            WEBHOOK: {
                label: 'Webhook',
                config: {
                    url: '',
                    method: 'POST',
                    headers: {},
                    payload: {}
                }
            },
            DELAY: {
                label: 'Esperar',
                config: {
                    duration: 24,
                    unit: 'hours'
                }
            },
            NOTIFY_HR: {
                label: 'Notificar RRHH',
                config: {
                    message: '',
                    assignTo: ''
                }
            },
            START_SOLUTION: {
                label: 'Iniciar Solución',
                config: {
                    solutionId: '',
                    parameters: {}
                }
            },
            CONDITION: {
                label: 'Condición',
                config: {
                    field: '',
                    operator: 'equals',
                    value: ''
                }
            }
        };

        const config = nodeConfig[type];
        const newNode: Omit<WorkflowNode, 'id'> = {
            type,
            position: { x: Math.random() * 300, y: Math.random() * 300 },
            data: config
        };

        addNode(newNode);

        // Add to React Flow
        const reactFlowNode = {
            id: `node_${Date.now()}`,
            type: type.toLowerCase(),
            position: newNode.position,
            data: config
        };

        setReactFlowNodes((nodes: Node[]) => [...nodes, reactFlowNode]);
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            const workflowData: Partial<Workflow> = {
                name: workflowName,
                description: workflowDescription,
                nodes: reactFlowNodes.map((node: Node) => ({
                    id: node.id,
                    type: (node.type?.toUpperCase() || 'CONDITION') as WorkflowNode['type'],
                    position: node.position,
                    data: node.data
                })),
                edges: reactFlowEdges.map((edge: Edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    type: edge.type
                })),
                isActive: true,
                triggerEvent: 'funnel_submission'
            };

            onSave(workflowData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error saving workflow');
        } finally {
            setLoading(false);
        }
    };

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
                                {workflow ? 'Editar Workflow' : 'Nuevo Workflow'}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {workflowName || 'Sin nombre'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            Probar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isLoading || !workflowName}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
                    <div className="p-4 space-y-4">
                        {/* Workflow Info */}
                        <Card className="p-4">
                            <h3 className="font-medium text-gray-900 mb-3">Información del Workflow</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ej: Seguimiento de Leads"
                                        value={workflowName}
                                        onChange={(e) => setWorkflowName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Describe qué hace este workflow..."
                                        value={workflowDescription}
                                        onChange={(e) => setWorkflowDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Node Palette */}
                        <Card className="p-4">
                            <h3 className="font-medium text-gray-900 mb-3">Agregar Nodos</h3>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => addWorkflowNode('EMAIL')}
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Enviar Email
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => addWorkflowNode('DELAY')}
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Esperar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => addWorkflowNode('WEBHOOK')}
                                >
                                    <Webhook className="h-4 w-4 mr-2" />
                                    Webhook
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => addWorkflowNode('NOTIFY_HR')}
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Notificar RRHH
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => addWorkflowNode('START_SOLUTION')}
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Iniciar Solución
                                </Button>
                            </div>
                        </Card>

                        {/* Node Properties */}
                        {selectedNode && (
                            <Card className="p-4">
                                <h3 className="font-medium text-gray-900 mb-3">Propiedades del Nodo</h3>
                                <NodeProperties
                                    node={selectedNode}
                                    onUpdate={(updates) => updateNode(selectedNode.id, updates)}
                                />
                            </Card>
                        )}
                    </div>
                </div>

                {/* React Flow Canvas */}
                <div className="flex-1">
                    <ReactFlow
                        nodes={reactFlowNodes}
                        edges={reactFlowEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        connectionMode={ConnectionMode.Loose}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />

                        <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-lg">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Badge variant="outline">{reactFlowNodes.length} nodos</Badge>
                                <Badge variant="outline">{reactFlowEdges.length} conexiones</Badge>
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
};

// Custom Node Components
function EmailNode({ data, selected }: { data: any; selected: boolean }) {
    return (
        <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">Enviar Email</span>
            </div>
            <p className="text-sm text-gray-600">{data.config?.subject || 'Sin asunto'}</p>
        </Card>
    );
}

function WebhookNode({ data, selected }: { data: any; selected: boolean }) {
    return (
        <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <Webhook className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-900">Webhook</span>
            </div>
            <p className="text-sm text-gray-600">{data.config?.url || 'URL no configurada'}</p>
        </Card>
    );
}

function DelayNode({ data, selected }: { data: any; selected: boolean }) {
    return (
        <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-gray-900">Esperar</span>
            </div>
            <p className="text-sm text-gray-600">
                {data.config?.duration || 24} {data.config?.unit || 'hours'}
            </p>
        </Card>
    );
}

function NotifyHrNode({ data, selected }: { data: any; selected: boolean }) {
    return (
        <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">Notificar RRHH</span>
            </div>
            <p className="text-sm text-gray-600">{data.config?.message || 'Sin mensaje'}</p>
        </Card>
    );
}

function StartSolutionNode({ data, selected }: { data: any; selected: boolean }) {
    return (
        <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-gray-900">Iniciar Solución</span>
            </div>
            <p className="text-sm text-gray-600">{data.config?.solutionId || 'Sin solución'}</p>
        </Card>
    );
}

function ConditionNode({ data, selected }: { data: any; selected: boolean }) {
    return (
        <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">Condición</span>
            </div>
            <p className="text-sm text-gray-600">
                {data.config?.field || 'Sin condición'}
            </p>
        </Card>
    );
}

// Node Properties Editor
interface NodePropertiesProps {
    node: WorkflowNode;
    onUpdate: (updates: Partial<WorkflowNode>) => void;
}

const NodeProperties: React.FC<NodePropertiesProps> = ({ node, onUpdate }) => {
    switch (node.type) {
        case 'EMAIL':
            return (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Asunto
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={node.data.config?.subject || ''}
                            onChange={(e) => onUpdate({
                                data: {
                                    ...node.data,
                                    config: { ...node.data.config, subject: e.target.value }
                                }
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plantilla
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                            value={node.data.config?.template || ''}
                            onChange={(e) => onUpdate({
                                data: {
                                    ...node.data,
                                    config: { ...node.data.config, template: e.target.value }
                                }
                            })}
                        />
                    </div>
                </div>
            );

        case 'WEBHOOK':
            return (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL
                        </label>
                        <input
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={node.data.config?.url || ''}
                            onChange={(e) => onUpdate({
                                data: {
                                    ...node.data,
                                    config: { ...node.data.config, url: e.target.value }
                                }
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Método
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={node.data.config?.method || 'POST'}
                            onChange={(e) => onUpdate({
                                data: {
                                    ...node.data,
                                    config: { ...node.data.config, method: e.target.value }
                                }
                            })}
                        >
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                    </div>
                </div>
            );

        case 'DELAY':
            return (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duración
                        </label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={node.data.config?.duration || 24}
                            onChange={(e) => onUpdate({
                                data: {
                                    ...node.data,
                                    config: { ...node.data.config, duration: parseInt(e.target.value) }
                                }
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unidad
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={node.data.config?.unit || 'hours'}
                            onChange={(e) => onUpdate({
                                data: {
                                    ...node.data,
                                    config: { ...node.data.config, unit: e.target.value }
                                }
                            })}
                        >
                            <option value="minutes">Minutos</option>
                            <option value="hours">Horas</option>
                            <option value="days">Días</option>
                        </select>
                    </div>
                </div>
            );

        default:
            return (
                <p className="text-sm text-gray-600">
                    Selecciona un nodo para ver sus propiedades
                </p>
            );
    }
};