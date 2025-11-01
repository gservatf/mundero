// Solution Guard Component - Access Control
// FASE 7.0 - SOLUCIONES EMPRESARIALES

import React, { useEffect, useState } from "react";
import { Shield, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import useSolutionsStore from "../store/useSolutionsStore";
import type { SolutionAccess } from "../types";

interface SolutionGuardProps {
  organizationId: string;
  solutionKey: string;
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{
    access: SolutionAccess;
    organizationId: string;
    solutionKey: string;
  }>;
  onAccessDenied?: (reason: string, access: SolutionAccess) => void;
  trackView?: boolean;
}

export const SolutionGuard: React.FC<SolutionGuardProps> = ({
  organizationId,
  solutionKey,
  children,
  fallbackComponent: FallbackComponent,
  onAccessDenied,
  trackView = true,
}) => {
  const { validateAccess, trackEvent } = useSolutionsStore();
  const [access, setAccess] = useState<SolutionAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAccess();
  }, [organizationId, solutionKey]);

  const checkAccess = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessResult = await validateAccess(organizationId, solutionKey);
      setAccess(accessResult);

      if (accessResult.hasAccess && trackView) {
        // Track view event
        await trackEvent({
          solutionKey,
          orgId: organizationId,
          event: "view",
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        });
      } else if (!accessResult.hasAccess && onAccessDenied) {
        onAccessDenied(accessResult.reason || "unknown", accessResult);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate access",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Validating Access
          </h2>
          <p className="text-gray-600">
            Checking permissions for {solutionKey}...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Access Validation Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={checkAccess} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!access) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Access Information Unavailable
          </h2>
          <p className="text-gray-600">
            Unable to determine access permissions.
          </p>
        </Card>
      </div>
    );
  }

  if (!access.hasAccess) {
    if (FallbackComponent) {
      return (
        <FallbackComponent
          access={access}
          organizationId={organizationId}
          solutionKey={solutionKey}
        />
      );
    }

    return (
      <AccessDeniedComponent
        access={access}
        organizationId={organizationId}
        solutionKey={solutionKey}
      />
    );
  }

  // Access granted - render children
  return <>{children}</>;
};

// Default Access Denied Component
const AccessDeniedComponent: React.FC<{
  access: SolutionAccess;
  organizationId: string;
  solutionKey: string;
}> = ({ access, organizationId, solutionKey }) => {
  const getAccessDeniedContent = () => {
    switch (access.reason) {
      case "not_found":
        return {
          icon: <AlertTriangle className="w-16 h-16 text-orange-500" />,
          title: "Solution Not Found",
          description: `The solution "${solutionKey}" does not exist or has been removed.`,
          action: null,
        };

      case "not_enabled":
        return {
          icon: <Shield className="w-16 h-16 text-red-500" />,
          title: "Access Not Granted",
          description: access.solution
            ? `Your organization "${organizationId}" does not have access to "${access.solution.name}".`
            : `Access to "${solutionKey}" has not been granted to your organization.`,
          action: (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Contact your administrator to request access to this solution.
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:admin@mundero.com?subject=Solution Access Request&body=I would like to request access to the solution: ${solutionKey}">
                  Request Access
                </a>
              </Button>
            </div>
          ),
        };

      case "expired":
        return {
          icon: <Clock className="w-16 h-16 text-orange-500" />,
          title: "Access Expired",
          description: access.orgSolution?.expiresAt
            ? `Your access to "${access.solution?.name || solutionKey}" expired on ${access.orgSolution.expiresAt.toLocaleDateString()}.`
            : `Your access to this solution has expired.`,
          action: (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Contact your administrator to renew access to this solution.
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:admin@mundero.com?subject=Solution Access Renewal&body=I would like to renew access to the solution: ${solutionKey}">
                  Request Renewal
                </a>
              </Button>
            </div>
          ),
        };

      case "org_not_allowed":
        return {
          icon: <Shield className="w-16 h-16 text-red-500" />,
          title: "Organization Not Allowed",
          description: `Your organization "${organizationId}" is not in the allowed list for "${access.solution?.name || solutionKey}".`,
          action: (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                This solution is only available to specific organizations.
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:admin@mundero.com?subject=Solution Organization Access&body=I would like to request organization access for: ${solutionKey}">
                  Contact Support
                </a>
              </Button>
            </div>
          ),
        };

      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-gray-500" />,
          title: "Access Denied",
          description: "You do not have permission to access this solution.",
          action: null,
        };
    }
  };

  const { icon, title, description, action } = getAccessDeniedContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 text-center max-w-lg mx-auto">
        <div className="mb-6">{icon}</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

        {action && <div className="mb-6">{action}</div>}

        <div className="pt-6 border-t border-gray-200">
          <Button variant="ghost" asChild>
            <a href="/">Return to Dashboard</a>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SolutionGuard;
