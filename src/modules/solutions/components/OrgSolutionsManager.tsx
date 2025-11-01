// Organization Solutions Manager Component
// FASE 7.0 - SOLUCIONES EMPRESARIALES

import React, { useEffect, useState } from "react";
import { Shield, Clock, Users, Plus, Trash2, Settings } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import useSolutionsStore from "../store/useSolutionsStore";
import type { OrgSolution, Solution } from "../types";

interface OrgSolutionsManagerProps {
  organizationId: string;
  organizationName?: string;
  onGrantAccess?: () => void;
  showActions?: boolean;
}

export const OrgSolutionsManager: React.FC<OrgSolutionsManagerProps> = ({
  organizationId,
  organizationName,
  onGrantAccess,
  showActions = true,
}) => {
  const {
    solutions,
    orgSolutions,
    loading,
    error,
    fetchSolutions,
    fetchOrgSolutions,
    revokeSolutionAccess,
    clearError,
  } = useSolutionsStore();

  const [loadingRevoke, setLoadingRevoke] = useState<string | null>(null);

  useEffect(() => {
    fetchSolutions();
    fetchOrgSolutions(organizationId);
  }, [organizationId, fetchSolutions, fetchOrgSolutions]);

  const handleRevokeAccess = async (solutionKey: string) => {
    if (!confirm("Are you sure you want to revoke access to this solution?")) {
      return;
    }

    setLoadingRevoke(solutionKey);
    try {
      await revokeSolutionAccess(organizationId, solutionKey);
    } catch (error) {
      console.error("Failed to revoke access:", error);
    } finally {
      setLoadingRevoke(null);
    }
  };

  const getSolutionInfo = (solutionKey: string): Solution | undefined => {
    return solutions.find((s) => s.key === solutionKey);
  };

  const getAccessStatusColor = (orgSolution: OrgSolution) => {
    if (!orgSolution.enabled) return "bg-gray-100 text-gray-800";
    if (orgSolution.expiresAt && orgSolution.expiresAt < new Date())
      return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  const getAccessStatusText = (orgSolution: OrgSolution) => {
    if (!orgSolution.enabled) return "Disabled";
    if (orgSolution.expiresAt && orgSolution.expiresAt < new Date())
      return "Expired";
    return "Active";
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Solutions Access</h2>
          <p className="text-gray-600">
            {organizationName
              ? `${organizationName} (${organizationId})`
              : organizationId}
          </p>
        </div>
        {showActions && onGrantAccess && (
          <Button onClick={onGrantAccess}>
            <Plus className="w-4 h-4 mr-2" />
            Grant Access
          </Button>
        )}
      </div>

      {/* Active Solutions */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : orgSolutions.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            This organization doesn't have access to any solutions yet.
          </div>
          {showActions && onGrantAccess && (
            <Button onClick={onGrantAccess} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Grant First Access
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {orgSolutions.map((orgSolution) => {
            const solution = getSolutionInfo(orgSolution.solutionKey);
            const isExpired =
              orgSolution.expiresAt && orgSolution.expiresAt < new Date();
            const isRevokingThis = loadingRevoke === orgSolution.solutionKey;

            return (
              <Card key={orgSolution.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {solution?.name || orgSolution.solutionKey}
                      </h3>
                      <Badge
                        className={getAccessStatusColor(orgSolution)}
                        variant="secondary"
                      >
                        {getAccessStatusText(orgSolution)}
                      </Badge>
                    </div>

                    {solution?.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {solution.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4" />
                        <span>
                          Granted {orgSolution.grantedAt.toLocaleDateString()}
                        </span>
                      </div>

                      {orgSolution.expiresAt && (
                        <div
                          className={`flex items-center space-x-1 ${
                            isExpired ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span>
                            {isExpired ? "Expired" : "Expires"}{" "}
                            {orgSolution.expiresAt.toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {orgSolution.usage && (
                        <div className="flex items-center space-x-4">
                          <span>{orgSolution.usage.totalViews} views</span>
                          <span>
                            {orgSolution.usage.totalConversions} conversions
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {showActions && (
                    <div className="flex items-center space-x-2">
                      {solution?.routeReader && (
                        <a
                          href={solution.routeReader}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Open
                        </a>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Handle settings/edit
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRevokeAccess(orgSolution.solutionKey)
                        }
                        disabled={isRevokingThis}
                        className="text-red-600 hover:text-red-700"
                      >
                        {isRevokingThis ? (
                          <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Additional Settings */}
                {orgSolution.settings &&
                  Object.keys(orgSolution.settings).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Custom Settings
                      </h4>
                      <div className="bg-gray-50 rounded-md p-3">
                        <pre className="text-xs text-gray-600 overflow-x-auto">
                          {JSON.stringify(orgSolution.settings, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {orgSolutions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Access Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orgSolutions.filter((os) => os.enabled).length}
              </div>
              <div className="text-sm text-gray-600">Active Solutions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {
                  orgSolutions.filter(
                    (os) => os.expiresAt && os.expiresAt < new Date(),
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Expired Access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {orgSolutions.reduce(
                  (sum, os) => sum + (os.usage?.totalViews || 0),
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
