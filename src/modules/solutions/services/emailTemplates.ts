// Email Templates for Solutions and Funnels
// FASE 7.0 - SOLUCIONES EMPRESARIALES

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export const emailTemplates: Record<string, EmailTemplate> = {
  // Solution Access Request Email
  solution_access_request: {
    id: "solution_access_request",
    name: "Solution Access Request",
    subject: "New Solution Access Request - {{solutionKey}}",
    htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h1 style="color: #333; margin: 0;">Solution Access Request</h1>
                </div>
                
                <div style="padding: 20px; background: white; border-radius: 8px; border: 1px solid #e9ecef;">
                    <p>A new solution access request has been submitted:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Organization:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{organizationId}}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Solution:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{solutionKey}}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Reason:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{reason}}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Requested At:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{requestedAt}}</td>
                        </tr>
                    </table>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{actionUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Review Access Request
                        </a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
                    <p>Mundero Platform - Solution Management</p>
                </div>
            </div>
        `,
    textContent: `
Solution Access Request

Organization: {{organizationId}}
Solution: {{solutionKey}}
Reason: {{reason}}
Requested At: {{requestedAt}}

Review this request: {{actionUrl}}

---
Mundero Platform - Solution Management
        `,
    variables: [
      "organizationId",
      "solutionKey",
      "reason",
      "requestedAt",
      "actionUrl",
    ],
  },

  // Funnel Completion Email
  funnel_completion: {
    id: "funnel_completion",
    name: "Funnel Completion Notification",
    subject: "New Submission: {{funnelName}}",
    htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">New Funnel Submission</h1>
                </div>
                
                <div style="padding: 20px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; border-top: none;">
                    <p>A new submission has been received for your funnel:</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h2 style="margin: 0 0 10px 0; color: #333;">{{funnelName}}</h2>
                        <p style="margin: 0; color: #6c757d;">Submitted on {{submittedAt}}</p>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Submission ID:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{submissionId}}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Organization:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{organizationId}}</td>
                        </tr>
                    </table>
                    
                    {{#if responses}}
                    <div style="margin: 20px 0;">
                        <h3 style="color: #333; margin-bottom: 10px;">Submitted Data:</h3>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                            {{#each responses}}
                            <p style="margin: 5px 0;"><strong>{{@key}}:</strong> {{this}}</p>
                            {{/each}}
                        </div>
                    </div>
                    {{/if}}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{viewUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            View Full Submission
                        </a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
                    <p>Mundero Platform - Funnel Management</p>
                </div>
            </div>
        `,
    textContent: `
New Funnel Submission

Funnel: {{funnelName}}
Submitted: {{submittedAt}}
Submission ID: {{submissionId}}
Organization: {{organizationId}}

{{#if responses}}
Submitted Data:
{{#each responses}}
{{@key}}: {{this}}
{{/each}}
{{/if}}

View full submission: {{viewUrl}}

---
Mundero Platform - Funnel Management
        `,
    variables: [
      "funnelName",
      "submittedAt",
      "submissionId",
      "organizationId",
      "responses",
      "viewUrl",
    ],
  },

  // Lead Welcome Email
  lead_welcome: {
    id: "lead_welcome",
    name: "Lead Welcome Email",
    subject: "Welcome to {{organizationName}} - Next Steps",
    htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">Welcome!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your interest in {{organizationName}}</p>
                </div>
                
                <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; border-top: none;">
                    <p>Hello {{name}},</p>
                    
                    <p>Thank you for completing our {{solutionName}}. We've received your information and our team will be in touch shortly.</p>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #333;">What happens next?</h3>
                        <ol style="margin: 0; padding-left: 20px; color: #555;">
                            <li style="margin: 8px 0;">Our team will review your submission</li>
                            <li style="margin: 8px 0;">We'll contact you within 24-48 hours</li>
                            <li style="margin: 8px 0;">We'll schedule a consultation if appropriate</li>
                        </ol>
                    </div>
                    
                    <p>In the meantime, feel free to explore our other resources:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{resourcesUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
                            View Resources
                        </a>
                        <a href="{{contactUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
                            Contact Us
                        </a>
                    </div>
                    
                    <p style="margin-top: 30px;">Best regards,<br>The {{organizationName}} Team</p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
                    <p>{{organizationName}} | Powered by Mundero</p>
                </div>
            </div>
        `,
    textContent: `
Welcome to {{organizationName}}!

Hello {{name}},

Thank you for completing our {{solutionName}}. We've received your information and our team will be in touch shortly.

What happens next?
1. Our team will review your submission
2. We'll contact you within 24-48 hours
3. We'll schedule a consultation if appropriate

In the meantime, feel free to explore our resources: {{resourcesUrl}}
Or contact us directly: {{contactUrl}}

Best regards,
The {{organizationName}} Team

---
{{organizationName}} | Powered by Mundero
        `,
    variables: [
      "name",
      "organizationName",
      "solutionName",
      "resourcesUrl",
      "contactUrl",
    ],
  },

  // HR New Postulant Email
  hr_new_postulant: {
    id: "hr_new_postulant",
    name: "HR New Postulant Notification",
    subject: "New Job Application - {{position}}",
    htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #6f42c1; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">New Job Application</h1>
                </div>
                
                <div style="padding: 20px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; border-top: none;">
                    <p>A new job application has been submitted:</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h2 style="margin: 0 0 10px 0; color: #333;">{{candidateName}}</h2>
                        <p style="margin: 0; color: #6c757d;">Applied for: {{position}}</p>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Email:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{email}}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Phone:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{phone}}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Experience:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{experience}}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Applied At:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">{{appliedAt}}</td>
                        </tr>
                    </table>
                    
                    {{#if additionalInfo}}
                    <div style="margin: 20px 0;">
                        <h3 style="color: #333; margin-bottom: 10px;">Additional Information:</h3>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                            <p style="margin: 0; white-space: pre-line;">{{additionalInfo}}</p>
                        </div>
                    </div>
                    {{/if}}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{reviewUrl}}" style="background: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Review Application
                        </a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
                    <p>HR Management System - Powered by Mundero</p>
                </div>
            </div>
        `,
    textContent: `
New Job Application

Candidate: {{candidateName}}
Position: {{position}}
Email: {{email}}
Phone: {{phone}}
Experience: {{experience}}
Applied: {{appliedAt}}

{{#if additionalInfo}}
Additional Information:
{{additionalInfo}}
{{/if}}

Review application: {{reviewUrl}}

---
HR Management System - Powered by Mundero
        `,
    variables: [
      "candidateName",
      "position",
      "email",
      "phone",
      "experience",
      "appliedAt",
      "additionalInfo",
      "reviewUrl",
    ],
  },
};

// Email service interface
export interface EmailService {
  send(template: string, to: string, data: Record<string, any>): Promise<void>;
  sendRaw(to: string, subject: string, content: string): Promise<void>;
}

// Template renderer utility
export class EmailTemplateRenderer {
  static render(
    templateId: string,
    data: Record<string, any>,
  ): { subject: string; html: string; text: string } {
    const template = emailTemplates[templateId];
    if (!template) {
      throw new Error(`Email template '${templateId}' not found`);
    }

    return {
      subject: this.interpolate(template.subject, data),
      html: this.interpolate(template.htmlContent, data),
      text: this.interpolate(template.textContent, data),
    };
  }

  private static interpolate(
    template: string,
    data: Record<string, any>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }
}

export default emailTemplates;
