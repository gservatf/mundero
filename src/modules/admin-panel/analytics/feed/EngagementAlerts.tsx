import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Star,
  Target,
  Activity,
  RefreshCw,
  X,
  Eye,
  Clock,
  Filter,
} from "lucide-react";
import { behaviorService, Alert, AlertType } from "./behaviorService.ts";

interface EngagementAlertsProps {
  companyId?: string;
  maxAlerts?: number;
  autoRefresh?: boolean;
  className?: string;
}

interface AlertDisplayProps {
  alert: Alert;
  onDismiss: (alertId: string) => void;
  onView: (alert: Alert) => void;
}

const AlertDisplay: React.FC<AlertDisplayProps> = ({
  alert,
  onDismiss,
  onView,
}) => {
  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "growth":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "drop":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case "topUser":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "topCompany":
        return <Building2 className="w-5 h-5 text-purple-500" />;
      case "anomaly":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "milestone":
        return <Target className="w-5 h-5 text-indigo-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (
    priority: "low" | "medium" | "high" | "critical",
  ) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (
    priority: "low" | "medium" | "high" | "critical",
  ) => {
    switch (priority) {
      case "critical":
        return "Crítica";
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Normal";
    }
  };

  const getTypeLabel = (type: AlertType) => {
    switch (type) {
      case "growth":
        return "Crecimiento";
      case "drop":
        return "Descenso";
      case "topUser":
        return "Usuario Destacado";
      case "topCompany":
        return "Empresa Destacada";
      case "anomaly":
        return "Anomalía";
      case "milestone":
        return "Hito Alcanzado";
      default:
        return "Alerta";
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 1) return "Ahora";
      if (diffMins < 60) return `Hace ${diffMins}m`;
      if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`;
      return date.toLocaleDateString();
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border-l-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
        alert.priority === "critical"
          ? "border-l-red-500 bg-red-50"
          : alert.priority === "high"
            ? "border-l-orange-500 bg-orange-50"
            : alert.priority === "medium"
              ? "border-l-yellow-500 bg-yellow-50"
              : "border-l-blue-500 bg-blue-50"
      }`}
      onClick={() => onView(alert)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate">
                {alert.title}
              </h4>
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(alert.priority)}`}
              >
                {getPriorityLabel(alert.priority)}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {getTypeLabel(alert.type)}
              </Badge>
            </div>

            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {alert.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(alert.timestamp)}
              </span>

              {alert.metadata?.entity && (
                <span className="flex items-center gap-1">
                  {alert.type === "topUser" ? (
                    <Users className="w-3 h-3" />
                  ) : (
                    <Building2 className="w-3 h-3" />
                  )}
                  {alert.metadata.entity}
                </span>
              )}

              {alert.metadata?.value !== undefined && (
                <span className="font-medium">
                  {typeof alert.metadata.value === "number"
                    ? alert.metadata.value.toLocaleString()
                    : alert.metadata.value}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(alert);
            }}
            className="w-8 h-8 p-0"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(alert.id);
            }}
            className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const EngagementAlerts: React.FC<EngagementAlertsProps> = ({
  companyId,
  maxAlerts = 10,
  autoRefresh = true,
  className = "",
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterType, setFilterType] = useState<AlertType | "all">("all");
  const [filterPriority, setFilterPriority] = useState<
    "low" | "medium" | "high" | "critical" | "all"
  >("all");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const alertsList = await behaviorService.getAlerts(companyId, maxAlerts);
      setAlerts(alertsList);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewAlerts = async () => {
    try {
      await behaviorService.generateAlerts();
      await loadAlerts(); // Recargar después de generar
    } catch (error) {
      console.error("Error generating alerts:", error);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await behaviorService.dismissAlert(alertId);
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      setFilteredAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  };

  const filterAlerts = () => {
    let filtered = [...alerts];

    if (filterType !== "all") {
      filtered = filtered.filter((alert) => alert.type === filterType);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((alert) => alert.priority === filterPriority);
    }

    // Ordenar por prioridad y fecha
    filtered.sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      const priorityDiff =
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);

      if (priorityDiff !== 0) return priorityDiff;

      // Si tienen la misma prioridad, ordenar por fecha (más reciente primero)
      const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
      const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
      return bTime - aTime;
    });

    setFilteredAlerts(filtered);
  };

  useEffect(() => {
    loadAlerts();

    if (autoRefresh) {
      const interval = setInterval(loadAlerts, 2 * 60 * 1000); // Cada 2 minutos
      return () => clearInterval(interval);
    }
  }, [companyId, maxAlerts, autoRefresh]);

  useEffect(() => {
    filterAlerts();
  }, [alerts, filterType, filterPriority]);

  useEffect(() => {
    // Listener en tiempo real para nuevas alertas
    const unsubscribe = behaviorService.onNewAlert((newAlert: Alert) => {
      setAlerts((prev) => [newAlert, ...prev.slice(0, maxAlerts - 1)]);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [maxAlerts]);

  const alertCounts = {
    total: alerts.length,
    critical: alerts.filter((a) => a.priority === "critical").length,
    high: alerts.filter((a) => a.priority === "high").length,
    medium: alerts.filter((a) => a.priority === "medium").length,
    low: alerts.filter((a) => a.priority === "low").length,
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas de Engagement
            {companyId && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Building2 className="w-4 h-4" />
                Empresa específica
              </span>
            )}
            {alertCounts.critical > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alertCounts.critical} críticas
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateNewAlerts}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <Activity className="w-4 h-4" />
              Generar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadAlerts}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap items-center">
          <Filter className="w-4 h-4 text-gray-500" />

          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AlertType | "all")}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">Todos los tipos</option>
            <option value="growth">Crecimiento</option>
            <option value="drop">Descenso</option>
            <option value="topUser">Usuario Destacado</option>
            <option value="topCompany">Empresa Destacada</option>
            <option value="anomaly">Anomalía</option>
            <option value="milestone">Hito</option>
          </select>

          {/* Filtro por prioridad */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">Todas las prioridades</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-lg font-bold">{alertCounts.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-red-50 rounded p-2">
            <div className="text-lg font-bold text-red-600">
              {alertCounts.critical}
            </div>
            <div className="text-xs text-gray-500">Críticas</div>
          </div>
          <div className="bg-orange-50 rounded p-2">
            <div className="text-lg font-bold text-orange-600">
              {alertCounts.high}
            </div>
            <div className="text-xs text-gray-500">Altas</div>
          </div>
          <div className="bg-yellow-50 rounded p-2">
            <div className="text-lg font-bold text-yellow-600">
              {alertCounts.medium}
            </div>
            <div className="text-xs text-gray-500">Medias</div>
          </div>
          <div className="bg-blue-50 rounded p-2">
            <div className="text-lg font-bold text-blue-600">
              {alertCounts.low}
            </div>
            <div className="text-xs text-gray-500">Bajas</div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Cargando alertas...
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay alertas que mostrar</p>
            <p className="text-sm">
              Las alertas aparecerán aquí cuando se detecten patrones relevantes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredAlerts.map((alert) => (
                <AlertDisplay
                  key={alert.id}
                  alert={alert}
                  onDismiss={dismissAlert}
                  onView={setSelectedAlert}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>

      {/* Modal de detalle de alerta */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalle de Alerta</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <strong>Título:</strong> {selectedAlert.title}
                </div>
                <div>
                  <strong>Descripción:</strong> {selectedAlert.description}
                </div>
                <div>
                  <strong>Tipo:</strong> {selectedAlert.type}
                </div>
                <div>
                  <strong>Prioridad:</strong> {selectedAlert.priority}
                </div>
                {selectedAlert.metadata && (
                  <div>
                    <strong>Metadata:</strong>
                    <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
                      {JSON.stringify(selectedAlert.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => dismissAlert(selectedAlert.id)}
                  className="flex-1"
                >
                  Descartar
                </Button>
                <Button
                  onClick={() => setSelectedAlert(null)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default EngagementAlerts;
