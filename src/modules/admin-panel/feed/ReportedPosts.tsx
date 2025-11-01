import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timestamp } from "firebase/firestore";
import {
  AlertTriangle,
  User,
  Calendar,
  MessageCircle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import {
  moderationService,
  type PostReport,
  type AdminInfo,
} from "./services/moderationService";
import { FeedPost } from "../../user-panel/services/feedService";
import { formatTimeAgo } from "../../../lib/utils";

// Helper function to safely convert timestamps
const safeTimestampToDate = (timestamp: Timestamp | any): Date => {
  if (!timestamp) return new Date();

  // Check if it's a Firestore Timestamp with toDate method
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }

  // Check if it's already a Date
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Try to convert as a number (Unix timestamp)
  if (typeof timestamp === "number") {
    return new Date(timestamp);
  }

  // Try to convert as a string
  if (typeof timestamp === "string") {
    return new Date(timestamp);
  }

  // If all else fails, return current date
  return new Date();
};

interface ReportedPostsProps {
  adminInfo: AdminInfo;
}

interface ReportWithPost extends PostReport {
  post?: FeedPost;
}

interface FilterState {
  status: PostReport["status"] | "all";
  reason: PostReport["reason"] | "all";
  searchText: string;
  dateRange: { start: Date | null; end: Date | null };
}

export const ReportedPosts: React.FC<ReportedPostsProps> = ({ adminInfo }) => {
  const [reports, setReports] = useState<ReportWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportWithPost | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    reason: "all",
    searchText: "",
    dateRange: { start: null, end: null },
  });

  // Load reports
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      let allReports = await moderationService.getReports({
        status: filters.status !== "all" ? filters.status : undefined,
        limit: 100,
      });

      // Apply additional filters
      if (filters.reason !== "all") {
        allReports = allReports.filter(
          (report) => report.reason === filters.reason,
        );
      }

      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        allReports = allReports.filter(
          (report) =>
            report.reporterName.toLowerCase().includes(searchLower) ||
            report.description.toLowerCase().includes(searchLower) ||
            report.postId.toLowerCase().includes(searchLower),
        );
      }

      // Fetch associated posts for context
      const reportsWithPosts = await Promise.all(
        allReports.map(async (report) => {
          try {
            const posts = await moderationService.getPostsForModeration({
              limit: 1,
            });
            const post = posts.find((p) => p.id === report.postId);
            return { ...report, post };
          } catch {
            return { ...report, post: undefined };
          }
        }),
      );

      setReports(reportsWithPosts);
    } catch (error) {
      console.error("❌ Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Handle report review
  const handleReportReview = async (
    reportId: string,
    decision: {
      status: "reviewed" | "dismissed" | "action_taken";
      actionTaken?: string;
    },
  ) => {
    try {
      setActionLoading(reportId);
      await moderationService.reviewReport(reportId, adminInfo, decision);
      await loadReports();
      setSelectedReport(null);
    } catch (error) {
      console.error("❌ Error reviewing report:", error);
      alert("Error al revisar el reporte. Intenta nuevamente.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter handlers
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      reason: "all",
      searchText: "",
      dateRange: { start: null, end: null },
    });
  };

  // Get status badge
  const getStatusBadge = (status: PostReport["status"]) => {
    const config = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pendiente",
        icon: Clock,
      },
      reviewed: {
        color: "bg-blue-100 text-blue-800",
        label: "Revisado",
        icon: Eye,
      },
      dismissed: {
        color: "bg-gray-100 text-gray-800",
        label: "Descartado",
        icon: XCircle,
      },
      action_taken: {
        color: "bg-green-100 text-green-800",
        label: "Acción Tomada",
        icon: CheckCircle,
      },
    };

    const { color, label, icon: Icon } = config[status];
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Get reason badge
  const getReasonBadge = (reason: PostReport["reason"]) => {
    const config = {
      spam: { color: "bg-red-100 text-red-800", label: "Spam" },
      inappropriate: {
        color: "bg-orange-100 text-orange-800",
        label: "Inapropiado",
      },
      harassment: { color: "bg-purple-100 text-purple-800", label: "Acoso" },
      misinformation: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Desinformación",
      },
      copyright: {
        color: "bg-blue-100 text-blue-800",
        label: "Derechos de Autor",
      },
      other: { color: "bg-gray-100 text-gray-800", label: "Otro" },
    };

    const { color, label } = config[reason];
    return <Badge className={color}>{label}</Badge>;
  };

  // Format time
  const formatReportTime = (timestamp: any) => {
    if (!timestamp) return "Fecha desconocida";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatTimeAgo(date);
  };

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Publicaciones Reportadas
          </h2>
          <p className="text-gray-600">
            Gestiona los reportes y denuncias de usuarios
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            <ChevronDown
              className={`h-4 w-4 ml-2 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadReports}
            disabled={loading}
          >
            <Clock
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Texto, usuario o ID..."
                      value={filters.searchText}
                      onChange={(e) =>
                        handleFilterChange({ searchText: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange({
                        status: e.target.value as FilterState["status"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendientes</option>
                    <option value="reviewed">Revisados</option>
                    <option value="dismissed">Descartados</option>
                    <option value="action_taken">Acción Tomada</option>
                  </select>
                </div>

                {/* Reason Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo
                  </label>
                  <select
                    value={filters.reason}
                    onChange={(e) =>
                      handleFilterChange({
                        reason: e.target.value as FilterState["reason"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="spam">Spam</option>
                    <option value="inappropriate">Inapropiado</option>
                    <option value="harassment">Acoso</option>
                    <option value="misinformation">Desinformación</option>
                    <option value="copyright">Derechos de Autor</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <AlertTriangle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron reportes
            </h3>
            <p className="text-gray-600">
              No hay reportes que coincidan con los filtros aplicados.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <div className="p-6">
                    {/* Report Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            {getReasonBadge(report.reason)}
                            {getStatusBadge(report.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {report.reporterName}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatReportTime(report.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Report Description */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Descripción del reporte:
                      </h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {report.description}
                      </p>
                    </div>

                    {/* Post Context */}
                    {report.post && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Publicación reportada:
                        </h4>
                        <div className="text-sm text-blue-800">
                          <p className="mb-2">
                            <strong>Autor:</strong> {report.post.authorName}
                          </p>
                          <p className="mb-2">
                            <strong>Contenido:</strong>{" "}
                            {report.post.content.text?.substring(0, 200) +
                              (report.post.content.text &&
                              report.post.content.text.length > 200
                                ? "..."
                                : "")}
                          </p>
                          <p>
                            <strong>Estado actual:</strong>{" "}
                            {report.post.isVisible === false
                              ? "Oculto"
                              : "Visible"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Review Info */}
                    {report.status !== "pending" && (
                      <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Información de revisión:
                        </h4>
                        <div className="text-sm text-gray-700">
                          <p>
                            <strong>Revisado por:</strong>{" "}
                            {report.reviewedBy || "Desconocido"}
                          </p>
                          {report.reviewedAt && (
                            <p>
                              <strong>Fecha de revisión:</strong>{" "}
                              {new Date(
                                report.reviewedAt.toDate(),
                              ).toLocaleString("es-ES")}
                            </p>
                          )}
                          {report.actionTaken && (
                            <p>
                              <strong>Acción tomada:</strong>{" "}
                              {report.actionTaken}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {report.status === "pending" && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleReportReview(report.id, {
                                status: "dismissed",
                                actionTaken: "No se requiere acción",
                              })
                            }
                            disabled={actionLoading === report.id}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Descartar
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleReportReview(report.id, {
                                status: "reviewed",
                                actionTaken: "Revisado sin acción específica",
                              })
                            }
                            disabled={actionLoading === report.id}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Marcar como Revisado
                          </Button>

                          <Button
                            size="sm"
                            onClick={() =>
                              handleReportReview(report.id, {
                                status: "action_taken",
                                actionTaken: "Acción de moderación aplicada",
                              })
                            }
                            disabled={actionLoading === report.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Acción Tomada
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detalle del Reporte
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>ID del Reporte:</strong>
                      <p className="font-mono text-gray-600">
                        {selectedReport.id}
                      </p>
                    </div>
                    <div>
                      <strong>ID de la Publicación:</strong>
                      <p className="font-mono text-gray-600">
                        {selectedReport.postId}
                      </p>
                    </div>
                    <div>
                      <strong>Reportado por:</strong>
                      <p>{selectedReport.reporterName}</p>
                      <p className="text-gray-500">
                        {selectedReport.reporterEmail}
                      </p>
                    </div>
                    <div>
                      <strong>Fecha del reporte:</strong>
                      <p>
                        {safeTimestampToDate(
                          selectedReport.createdAt,
                        ).toLocaleString("es-ES")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <strong>Descripción completa:</strong>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>

                  {selectedReport.post && (
                    <div>
                      <strong>Contenido de la publicación:</strong>
                      <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="mb-2">
                          <strong>Autor:</strong>{" "}
                          {selectedReport.post.authorName}
                        </p>
                        <p>{selectedReport.post.content.text}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
