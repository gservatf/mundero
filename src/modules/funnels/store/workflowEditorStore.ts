// Workflow Editor Store
// Zustand store for managing workflow editor state

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WorkflowNode, WorkflowEdge, WorkflowEditorState } from '../types';

const useWorkflowEditorStore = create<WorkflowEditorState>()(
    devtools(
        (set, get) => ({
            nodes: [],
            edges: [],
            selectedNode: null,
            isLoading: false,
            error: null,

            setNodes: (nodes) =>
                set({ nodes }, false, 'setNodes'),

            setEdges: (edges) =>
                set({ edges }, false, 'setEdges'),

            addNode: (nodeData) =>
                set((state) => {
                    const newNode: WorkflowNode = {
                        ...nodeData,
                        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                    };

                    return {
                        nodes: [...state.nodes, newNode]
                    };
                }, false, 'addNode'),

            updateNode: (nodeId, updates) =>
                set((state) => ({
                    nodes: state.nodes.map(node =>
                        node.id === nodeId ? { ...node, ...updates } : node
                    )
                }), false, 'updateNode'),

            removeNode: (nodeId) =>
                set((state) => ({
                    nodes: state.nodes.filter(node => node.id !== nodeId),
                    edges: state.edges.filter(edge =>
                        edge.source !== nodeId && edge.target !== nodeId
                    ),
                    selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode
                }), false, 'removeNode'),

            setSelectedNode: (node) =>
                set({ selectedNode: node }, false, 'setSelectedNode'),

            setLoading: (loading) =>
                set({ isLoading: loading }, false, 'setLoading'),

            setError: (error) =>
                set({ error }, false, 'setError'),
        }),
        {
            name: 'workflow-editor-store',
        }
    )
);

export default useWorkflowEditorStore;