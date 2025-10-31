// Types for the Funnel System
// Unified type definitions for organizations, funnels, and workflows

export interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    industry?: string;
    branding: {
        primaryColor: string;
        secondaryColor: string;
        logo?: string;
        favicon?: string;
    };
    settings: {
        allowPublicFunnels: boolean;
        requireApproval: boolean;
        maxFunnels: number;
    };
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
}

export interface OrgMember {
    id: string;
    organizationId: string;
    userId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    permissions: string[];
    joinedAt: Date;
    invitedBy?: string;
    status: 'active' | 'pending' | 'suspended';
}

export interface Funnel {
    id: string;
    organizationId: string;
    name: string;
    slug: string;
    description?: string;
    status: 'draft' | 'published' | 'paused' | 'archived';
    isPublished?: boolean;

    // Funnel Structure
    steps: FunnelStep[];
    settings: {
        collectEmail: boolean;
        collectPhone?: boolean;
        customFields?: CustomField[];
        thankYouMessage?: string;
        redirectUrl?: string;

        // New solution integration settings
        destination?: 'email' | 'redirect' | 'solution' | 'default';
        solutionKey?: string;
        notificationEmail?: string;

        // Workflow settings
        autoWorkflow?: boolean;
        workflowTriggers?: string[];
    };

    // Tracking
    analytics: {
        views: number;
        submissions: number;
        conversionRate: number;
        lastUpdated: Date;
    };

    // Workflow Integration
    workflowId?: string;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    tags: string[];
}

export interface FunnelStep {
    id: string;
    type: 'landing' | 'form' | 'content' | 'redirect';
    title: string;
    content: string;
    order: number;
    settings: Record<string, any>;
}

export interface CustomField {
    id: string;
    name: string;
    type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea';
    label: string;
    required: boolean;
    options?: string[]; // For select fields
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
}

export interface FunnelSubmission {
    id: string;
    funnelId: string;
    organizationId: string;

    // Submitted Data
    formData: Record<string, any>;
    responses: Record<string, any>; // Alias for formData for backward compatibility
    email?: string;
    phone?: string;

    // Tracking
    source: 'direct' | 'social' | 'referral' | 'organic' | 'paid';
    userAgent: string;
    ipAddress: string;
    utmParams?: {
        source?: string;
        medium?: string;
        campaign?: string;
        term?: string;
        content?: string;
    };

    // Status
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
    assignedTo?: string;
    notes: string[];

    // Workflow
    workflowStatus?: 'pending' | 'processing' | 'completed' | 'failed';

    // Timestamps
    submittedAt: Date;
    updatedAt: Date;
}

export interface FunnelEvent {
    id: string;
    userId?: string | null;
    funnelId?: string;
    organizationId?: string;

    // Event Details
    event: 'view' | 'step_completed' | 'submission' | 'conversion' | 'submit';
    source: 'feed' | 'event' | 'community' | 'challenge' | 'direct';
    stage?: 'awareness' | 'interest' | 'action' | 'conversion';

    // Context
    metadata: Record<string, any>;
    timestamp: Date;
    sessionId?: string;
}

export interface Workflow {
    id: string;
    organizationId: string;
    name: string;
    description?: string;

    // Workflow Definition
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];

    // Settings
    isActive: boolean;
    triggerEvent: 'funnel_submission' | 'manual' | 'scheduled';

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    version: number;
}

export interface WorkflowNode {
    id: string;
    type: 'EMAIL' | 'WEBHOOK' | 'DELAY' | 'NOTIFY_HR' | 'START_SOLUTION' | 'CONDITION';
    position: { x: number; y: number };
    data: {
        label: string;
        config: Record<string, any>;
    };
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
    data?: Record<string, any>;
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    submissionId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    currentNode?: string;
    startedAt: Date;
    completedAt?: Date;
    error?: string;
    logs: WorkflowLog[];
}

export interface WorkflowLog {
    timestamp: Date;
    nodeId: string;
    action: string;
    status: 'success' | 'error' | 'info';
    message: string;
    data?: Record<string, any>;
}

// API Response Types
export interface FunnelMetrics {
    views: number;
    submissions: number;
    conversionRate: number;
    timeOnPage: number;
    topSources: Array<{ source: string; count: number }>;
    dailyStats: Array<{ date: string; views: number; submissions: number }>;
}

export interface FunnelAnalytics {
    overview: {
        totalViews: number;
        totalSubmissions: number;
        conversionRate: number;
        avgTimeToConvert: number;
    };
    sources: Array<{
        source: string;
        views: number;
        submissions: number;
        conversionRate: number;
    }>;
    timeline: Array<{
        date: string;
        views: number;
        submissions: number;
    }>;
    stepAnalysis: Array<{
        stepId: string;
        stepName: string;
        views: number;
        completions: number;
        dropOffRate: number;
    }>;
}

// Form Types
export interface CreateFunnelData {
    name: string;
    description?: string;
    steps: Omit<FunnelStep, 'id'>[];
    settings: Funnel['settings'];
    workflowId?: string;
}

export interface UpdateFunnelData extends Partial<CreateFunnelData> {
    status?: Funnel['status'];
}

export interface CreateOrganizationData {
    name: string;
    slug: string;
    description?: string;
    website?: string;
    industry?: string;
    branding: Organization['branding'];
}

export interface CreateWorkflowData {
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    triggerEvent: Workflow['triggerEvent'];
}

// Store Types
export interface FunnelEditorState {
    currentFunnel: Partial<Funnel> | null;
    isLoading: boolean;
    error: string | null;
    previewMode: boolean;
    selectedStep: string | null;

    // Actions
    setCurrentFunnel: (funnel: Partial<Funnel> | null) => void;
    updateFunnelStep: (stepId: string, updates: Partial<FunnelStep>) => void;
    addFunnelStep: (step: Omit<FunnelStep, 'id'>) => void;
    removeFunnelStep: (stepId: string) => void;
    reorderSteps: (startIndex: number, endIndex: number) => void;
    setPreviewMode: (enabled: boolean) => void;
    setSelectedStep: (stepId: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export interface WorkflowEditorState {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    selectedNode: WorkflowNode | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setNodes: (nodes: WorkflowNode[]) => void;
    setEdges: (edges: WorkflowEdge[]) => void;
    addNode: (node: Omit<WorkflowNode, 'id'>) => void;
    updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
    removeNode: (nodeId: string) => void;
    setSelectedNode: (node: WorkflowNode | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}