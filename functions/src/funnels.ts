// Cloud Functions for Funnel System
// Handles funnel submissions, workflow execution, and validation

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { EventContext } from "firebase-functions";
import { Change } from "firebase-functions";
import { DocumentSnapshot } from "firebase-functions/v1/firestore";

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Types
interface FunnelSubmission {
    id: string;
    funnelId: string;
    organizationId: string;
    formData: Record<string, any>;
    email?: string;
    phone?: string;
    source: string;
    userAgent: string;
    ipAddress: string;
    utmParams?: Record<string, string>;
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
    submittedAt: Date;
    workflowStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

interface Workflow {
    id: string;
    organizationId: string;
    name: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    isActive: boolean;
    triggerEvent: 'funnel_submission' | 'manual' | 'scheduled';
}

interface WorkflowNode {
    id: string;
    type: 'EMAIL' | 'WEBHOOK' | 'DELAY' | 'NOTIFY_HR' | 'START_SOLUTION' | 'CONDITION';
    position: { x: number; y: number };
    data: {
        label: string;
        config: Record<string, any>;
    };
}

interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
}

// ==================== FUNNEL SUBMISSION HANDLER ====================

export const onFunnelSubmissionCreate = functions.firestore
    .document("funnel_submissions/{submissionId}")
    .onCreate(async (snap: DocumentSnapshot, context: EventContext) => {
        const submission = snap.data() as FunnelSubmission;
        const submissionId = context.params.submissionId;

        if (!submission) {
            functions.logger.error("No submission data found");
            return;
        }

        try {
            functions.logger.info("Processing funnel submission", { submissionId, funnelId: submission.funnelId });

            // Get funnel details
            const funnelDoc = await db.collection("funnels").doc(submission.funnelId).get();
            if (!funnelDoc.exists) {
                functions.logger.error("Funnel not found", { funnelId: submission.funnelId });
                return;
            }

            const funnel = funnelDoc.data();

            // Update submission with organization ID if missing
            if (!submission.organizationId && funnel?.organizationId) {
                await db.collection("funnel_submissions").doc(submissionId).update({
                    organizationId: funnel.organizationId
                });
            }

            // Check if funnel has a workflow
            if (funnel?.workflowId) {
                await runWorkflow(funnel.workflowId, submissionId, submission);
            } else {
                // Run quick destination (default behavior)
                await runQuickDestination(submission, funnel);
            }

            // Register signup/conversion event
            await registerSignup(submission);

            functions.logger.info("Funnel submission processed successfully", { submissionId });

        } catch (error) {
            functions.logger.error("Error processing funnel submission", {
                submissionId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Update submission status to indicate error
            await db.collection("funnel_submissions").doc(submissionId).update({
                workflowStatus: "failed",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });

// ==================== WORKFLOW EXECUTION ====================

async function runWorkflow(workflowId: string, submissionId: string, submission: FunnelSubmission) {
    try {
        functions.logger.info("Starting workflow execution", { workflowId, submissionId });

        // Get workflow
        const workflowDoc = await db.collection("workflows").doc(workflowId).get();
        if (!workflowDoc.exists) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        const workflow = workflowDoc.data() as Workflow;

        if (!workflow.isActive) {
            functions.logger.warn("Workflow is not active", { workflowId });
            return;
        }        // Create workflow execution record
        const executionData = {
            workflowId,
            submissionId,
            status: 'running',
            startedAt: new Date(),
            logs: []
        };

        const executionRef = await db.collection('workflow_executions').add(executionData);
        const executionId = executionRef.id;

        // Update submission status
        await db.collection('funnel_submissions').doc(submissionId).update({
            workflowStatus: 'processing'
        });

        // Find start node (node with no incoming edges)
        const startNode = workflow.nodes.find(node =>
            !workflow.edges.some(edge => edge.target === node.id)
        );

        if (!startNode) {
            throw new Error('No start node found in workflow');
        }

        // Execute workflow starting from start node
        await executeWorkflowNode(startNode, workflow, submission, executionId);

        // Update execution status
        await executionRef.update({
            status: 'completed',
            completedAt: new Date()
        });

        // Update submission status
        await db.collection('funnel_submissions').doc(submissionId).update({
            workflowStatus: 'completed'
        });

        functions.logger.info("Workflow execution completed", { workflowId, submissionId, executionId });

    } catch (error) {
        functions.logger.error("Workflow execution failed", {
            workflowId,
            submissionId,
            error: error instanceof Error ? error.message : String(error)
        });
        throw error;
    }
}

async function executeWorkflowNode(
    node: WorkflowNode,
    workflow: Workflow,
    submission: FunnelSubmission,
    executionId: string
) {
    try {
        functions.logger.info("Executing workflow node", { nodeId: node.id, type: node.type });

        // Log node execution
        await logWorkflowAction(executionId, node.id, 'started', 'Node execution started');

        let result: any = null;

        switch (node.type) {
            case 'EMAIL':
                result = await handleEmailNode(node, submission);
                break;

            case 'WEBHOOK':
                result = await handleWebhookNode(node, submission);
                break;

            case 'DELAY':
                result = await handleDelayNode(node, submission);
                break;

            case 'NOTIFY_HR':
                result = await handleNotifyHrNode(node, submission);
                break;

            case 'START_SOLUTION':
                result = await handleStartSolutionNode(node, submission);
                break;

            case 'CONDITION':
                result = await handleConditionNode(node, submission);
                break;

            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }

        // Log successful execution
        await logWorkflowAction(executionId, node.id, 'completed', 'Node execution completed', result);

        // Find and execute next nodes
        const nextEdges = workflow.edges.filter(edge => edge.source === node.id);

        for (const edge of nextEdges) {
            const nextNode = workflow.nodes.find(n => n.id === edge.target);
            if (nextNode) {
                await executeWorkflowNode(nextNode, workflow, submission, executionId);
            }
        }

    } catch (error) {
        functions.logger.error("Node execution failed", {
            nodeId: node.id,
            type: node.type,
            error: error instanceof Error ? error.message : String(error)
        }); await logWorkflowAction(
            executionId,
            node.id,
            'error',
            error instanceof Error ? error.message : String(error)
        );

        throw error;
    }
}

// ==================== NODE HANDLERS ====================

async function handleEmailNode(node: WorkflowNode, submission: FunnelSubmission) {
    const config = node.data.config;

    // In a real implementation, you would integrate with an email service
    // like SendGrid, Mailgun, or AWS SES
    functions.logger.info("Sending email", {
        to: submission.email,
        subject: config.subject,
        nodeId: node.id
    });    // Simulate email sending
    return {
        emailSent: true,
        recipient: submission.email,
        subject: config.subject,
        timestamp: new Date()
    };
}

async function handleWebhookNode(node: WorkflowNode, submission: FunnelSubmission) {
    const config = node.data.config;

    if (!config.url) {
        throw new Error('Webhook URL not configured');
    }

    // Prepare payload
    const payload = {
        submission,
        timestamp: new Date(),
        ...config.payload
    };

    // Make HTTP request
    const response = await fetch(config.url, {
        method: config.method || 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...config.headers
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    return {
        webhookCalled: true,
        url: config.url,
        status: response.status,
        timestamp: new Date()
    };
}

async function handleDelayNode(node: WorkflowNode, submission: FunnelSubmission) {
    const config = node.data.config;
    const duration = config.duration || 1;
    const unit = config.unit || 'hours';

    // In a real implementation, you would schedule the next action
    // using Cloud Scheduler or similar service
    functions.logger.info("Scheduling delay", { duration, unit, nodeId: node.id });

    return {
        delayScheduled: true,
        duration,
        unit,
        nextExecutionTime: calculateNextExecutionTime(duration, unit),
        timestamp: new Date()
    };
}

async function handleNotifyHrNode(node: WorkflowNode, submission: FunnelSubmission) {
    const config = node.data.config;

    // Create notification for HR team
    await db.collection('hr_notifications').add({
        submissionId: submission.id,
        funnelId: submission.funnelId,
        organizationId: submission.organizationId,
        message: config.message,
        assignTo: config.assignTo,
        status: 'pending',
        createdAt: new Date(),
        submissionData: {
            email: submission.email,
            phone: submission.phone,
            formData: submission.formData
        }
    });

    return {
        hrNotified: true,
        message: config.message,
        assignTo: config.assignTo,
        timestamp: new Date()
    };
}

async function handleStartSolutionNode(node: WorkflowNode, submission: FunnelSubmission) {
    const config = node.data.config;

    if (!config.solutionId) {
        throw new Error('Solution ID not configured');
    }

    // Create solution instance
    await db.collection('solution_instances').add({
        solutionId: config.solutionId,
        submissionId: submission.id,
        organizationId: submission.organizationId,
        parameters: config.parameters || {},
        status: 'initiated',
        createdAt: new Date(),
        clientData: {
            email: submission.email,
            phone: submission.phone,
            formData: submission.formData
        }
    });

    return {
        solutionStarted: true,
        solutionId: config.solutionId,
        parameters: config.parameters,
        timestamp: new Date()
    };
}

async function handleConditionNode(node: WorkflowNode, submission: FunnelSubmission) {
    const config = node.data.config;

    // Evaluate condition
    const fieldValue = getFieldValue(submission, config.field);
    const result = evaluateCondition(fieldValue, config.operator, config.value);

    return {
        conditionEvaluated: true,
        field: config.field,
        operator: config.operator,
        expectedValue: config.value,
        actualValue: fieldValue,
        result,
        timestamp: new Date()
    };
}

// ==================== QUICK DESTINATION ====================

async function runQuickDestination(submission: FunnelSubmission, funnel: any) {
    functions.logger.info('Running quick destination for submission', { submissionId: submission.id });

    // Default behavior when no workflow is configured
    // Send notification email to organization
    const orgDoc = await db.collection('organizations').doc(submission.organizationId).get();
    if (orgDoc.exists) {
        // const org = orgDoc.data();

        // Create a simple notification
        await db.collection('notifications').add({
            organizationId: submission.organizationId,
            type: 'new_lead',
            title: 'Nuevo Lead Capturado',
            message: `Nuevo lead desde el funnel "${funnel.name}"`,
            data: {
                submissionId: submission.id,
                funnelId: submission.funnelId,
                email: submission.email,
                phone: submission.phone
            },
            read: false,
            createdAt: new Date()
        });
    }
}

// ==================== SIGNUP REGISTRATION ====================

async function registerSignup(submission: FunnelSubmission) {
    // Register the conversion for analytics
    await db.collection('funnel_events').add({
        userId: null, // Anonymous conversion
        funnelId: submission.funnelId,
        organizationId: submission.organizationId,
        event: 'conversion',
        source: submission.source,
        stage: 'conversion',
        metadata: {
            submissionId: submission.id,
            email: submission.email,
            formData: submission.formData
        },
        timestamp: new Date()
    });
}

// ==================== FUNNEL CREATE HANDLER ====================

export const onFunnelCreate = functions.firestore
    .document("funnels/{funnelId}")
    .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
        const funnel = change.after.data();
        const funnelId = context.params.funnelId;

        if (!funnel || !change.after.exists) {
            return; // Document was deleted
        }

        try {
            // Validate slug uniqueness
            await validateSlugUniqueness(funnel.organizationId, funnel.slug, funnelId);

            // Copy branding from organization
            await copyOrganizationBranding(funnel.organizationId, funnelId);

            functions.logger.info("Funnel created successfully", { funnelId, slug: funnel.slug });

        } catch (error) {
            functions.logger.error("Error processing funnel creation", {
                funnelId,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });// ==================== UTILITY FUNCTIONS ====================

async function validateSlugUniqueness(organizationId: string, slug: string, excludeFunnelId: string) {
    const existingFunnels = await db
        .collection('funnels')
        .where('organizationId', '==', organizationId)
        .where('slug', '==', slug)
        .get();

    const conflicts = existingFunnels.docs.filter((doc: admin.firestore.DocumentSnapshot) => doc.id !== excludeFunnelId);

    if (conflicts.length > 0) {
        throw new Error(`Slug "${slug}" is already in use`);
    }
}

async function copyOrganizationBranding(organizationId: string, funnelId: string) {
    const orgDoc = await db.collection('organizations').doc(organizationId).get();

    if (orgDoc.exists) {
        const org = orgDoc.data();

        await db.collection('funnels').doc(funnelId).update({
            branding: org?.branding || {}
        });
    }
}

async function logWorkflowAction(
    executionId: string,
    nodeId: string,
    status: 'started' | 'completed' | 'error',
    message: string,
    data?: any
) {
    const logEntry = {
        timestamp: new Date(),
        nodeId,
        action: `node_${status}`,
        status: status === 'error' ? 'error' : 'success',
        message,
        data: data || null
    };

    await db.collection('workflow_executions').doc(executionId).update({
        logs: FieldValue.arrayUnion(logEntry)
    });
}

function calculateNextExecutionTime(duration: number, unit: string): Date {
    const now = new Date();

    switch (unit) {
        case 'minutes':
            return new Date(now.getTime() + duration * 60 * 1000);
        case 'hours':
            return new Date(now.getTime() + duration * 60 * 60 * 1000);
        case 'days':
            return new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
        default:
            return new Date(now.getTime() + duration * 60 * 60 * 1000); // Default to hours
    }
}

function getFieldValue(submission: FunnelSubmission, fieldPath: string): any {
    const paths = fieldPath.split('.');
    let value: any = submission;

    for (const path of paths) {
        value = value?.[path];
    }

    return value;
}

function evaluateCondition(actualValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
        case 'equals':
            return actualValue === expectedValue;
        case 'not_equals':
            return actualValue !== expectedValue;
        case 'contains':
            return String(actualValue).includes(String(expectedValue));
        case 'greater_than':
            return Number(actualValue) > Number(expectedValue);
        case 'less_than':
            return Number(actualValue) < Number(expectedValue);
        case 'exists':
            return actualValue !== null && actualValue !== undefined;
        case 'not_exists':
            return actualValue === null || actualValue === undefined;
        default:
            return false;
    }
}

// ==================== VALIDATION FUNCTIONS ====================

async function isOrgOwnerOrAdmin(organizationId: string, userId: string): Promise<boolean> {
    const memberQuery = await db
        .collection('org_members')
        .where('organizationId', '==', organizationId)
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

    if (memberQuery.empty) {
        return false;
    }

    const member = memberQuery.docs[0].data();
    return ['owner', 'admin'].includes(member.role);
}

async function isMember(organizationId: string, userId: string): Promise<boolean> {
    const memberQuery = await db
        .collection('org_members')
        .where('organizationId', '==', organizationId)
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

    return !memberQuery.empty;
}

// ==================== CALLABLE FUNCTIONS ====================

export const validateFunnelAccess = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const { funnelId } = data;
    const userId = context.auth?.uid;

    if (!userId) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        const funnelDoc = await db.collection("funnels").doc(funnelId).get();

        if (!funnelDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Funnel not found");
        }

        const funnel = funnelDoc.data();
        const hasAccess = await isMember(funnel?.organizationId, userId);

        return { hasAccess };

    } catch (error) {
        functions.logger.error("Error validating funnel access", { funnelId, userId, error });
        throw new functions.https.HttpsError("internal", "Failed to validate access");
    }
}); export const triggerWorkflow = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const { workflowId, submissionId } = data;
    const userId = context.auth?.uid;

    if (!userId) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Get submission
        const submissionDoc = await db.collection("funnel_submissions").doc(submissionId).get();
        if (!submissionDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Submission not found");
        }

        const submission = submissionDoc.data() as FunnelSubmission;

        // Validate access
        const hasAccess = await isOrgOwnerOrAdmin(submission.organizationId, userId);
        if (!hasAccess) {
            throw new functions.https.HttpsError("permission-denied", "Insufficient permissions");
        }

        // Run workflow
        await runWorkflow(workflowId, submissionId, submission);

        return { success: true };

    } catch (error) {
        functions.logger.error("Error triggering workflow", { workflowId, submissionId, userId, error });
        throw new functions.https.HttpsError("internal", "Failed to trigger workflow");
    }
});