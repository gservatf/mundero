// Solution Detail Component
// FASE 7.0 - SOLUCIONES EMPRESARIALES

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  Activity,
  ExternalLink,
  Settings,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import useSolutionsStore from "../store/useSolutionsStore";
import { solutionsService } from "../services/solutionsService";
import type { Solution, SolutionEvent } from "../types";

interface SolutionDetailProps {
  solution: Solution;
  onBack: () => void;
  onEdit?: (solution: Solution) => void;
}

export const SolutionDetail: React.FC<SolutionDetailProps> = ({
  solution,
  onBack,
  onEdit,
}) => {
  const { orgSolutions, fetchOrgSolutions } = useSolutionsStore();
  const [events, setEvents] = useState<SolutionEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadSolutionEvents();
  }, [solution.key]);

  const loadSolutionEvents = async () => {
    setLoadingEvents(true);
    try {
      const solutionEvents = await solutionsService.getSolutionEvents(
        solution.key,
        undefined,
        50,
      );
      setEvents(solutionEvents);
    } catch (error) {
      console.error("Failed to load solution events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      assessment: "bg-blue-100 text-blue-800",
      hr: "bg-green-100 text-green-800",
      marketing: "bg-purple-100 text-purple-800",
      analytics: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "view":
        return "👁️";
      case "signup":
        return "📝";
      case "redirect":
        return "🔗";
      case "conversion":
        return "✅";
      case "error":
        return "❌";
      default:
        return "📊";
    }
  };

  const stats = {
    totalViews: events.filter((e) => e.event === "view").length,
    totalSignups: events.filter((e) => e.event === "signup").length,
    totalConversions: events.filter((e) => e.event === "conversion").length,
    totalErrors: events.filter((e) => e.event === "error").length,
  };

  const conversionRate =
    stats.totalViews > 0
      ? ((stats.totalConversions / stats.totalViews) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {solution.name}
            </h1>
            <p className="text-gray-600">{solution.key}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(solution)}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Solution
            </Button>
          )}
          <a
            href={solution.routeReader}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Solution
          </a>
        </div>
      </div>

      {/* Status and Category */}
      <div className="flex items-center space-x-4">
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            solution.active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              solution.active ? "bg-green-400" : "bg-gray-400"
            }`}
          ></div>
          <span className="text-sm font-medium">
            {solution.active ? "Active" : "Inactive"}
          </span>
        </div>
        <Badge
          className={getCategoryColor(solution.category)}
          variant="secondary"
        >
          {solution.category}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {solution.description}
            </p>
          </Card>

          {/* Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Route
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {solution.routeReader}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created
                </label>
                <p className="text-gray-900">
                  {solution.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-gray-900">
                  {solution.updatedAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Allowed Organizations
                </label>
                <p className="text-gray-900">
                  {solution.allowedOrgs.length} organizations
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalViews}
                  </p>
                </div>
                <div className="text-2xl">👁️</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Signups</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalSignups}
                  </p>
                </div>
                <div className="text-2xl">📝</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalConversions}
                  </p>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {conversionRate}%
                  </p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="organizations">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Allowed Organizations
            </h3>
            <div className="space-y-3">
              {solution.allowedOrgs.map((orgId) => (
                <div
                  key={orgId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{orgId}</span>
                  </div>
                  <Badge variant="secondary">Allowed</Badge>
                </div>
              ))}
              {solution.allowedOrgs.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No organizations have access to this solution.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Views</span>
                  <span className="font-semibold">{stats.totalViews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Signups</span>
                  <span className="font-semibold">{stats.totalSignups}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Conversions</span>
                  <span className="font-semibold">
                    {stats.totalConversions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Errors</span>
                  <span className="font-semibold text-red-600">
                    {stats.totalErrors}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-semibold text-green-600">
                      {conversionRate}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Event Distribution</h3>
              <div className="space-y-3">
                {Object.entries(stats).map(([key, value]) => {
                  const total = Object.values(stats).reduce(
                    (sum, val) => sum + val,
                    0,
                  );
                  const percentage =
                    total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm capitalize">
                          {key.replace("total", "").toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
            {loadingEvents ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No events recorded for this solution yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <div className="text-2xl">{getEventIcon(event.event)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">
                          {event.event}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {event.orgId}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {event.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {event.metadata && (
                      <div className="text-xs text-gray-500">
                        <Activity className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
