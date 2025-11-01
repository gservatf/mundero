import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timestamp } from "firebase/firestore";
import {
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  MessageCircle,
  Heart,
  Share2,
  User,
  Building,
  Calendar,
  MapPin,
  ExternalLink,
  AlertTriangle,
  MoreVertical,
  Clock,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  moderationService,
  type AdminInfo,
} from "./services/moderationService";
import { FeedPost } from "../../user-panel/services/feedService";
import { formatTimeAgo } from "../../../lib/utils";

interface FeedItemCardProps {
  post: FeedPost;
  onActionComplete: () => void;
  adminInfo: AdminInfo;
}

interface ActionState {
  type: "hide" | "restore" | "delete" | "view_details" | null;
  loading: boolean;
  reason: string;
}

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

export const FeedItemCard: React.FC<FeedItemCardProps> = ({
  post,
  onActionComplete,
  adminInfo,
}) => {
  const [actionState, setActionState] = useState<ActionState>({
    type: null,
    loading: false,
    reason: "",
  });
  const [showDetails, setShowDetails] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  // Handle moderation actions
  const handleAction = async (action: "hide" | "restore" | "delete") => {
    setActionState({ type: action, loading: true, reason: "" });
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!actionState.type) return;

    try {
      setActionState((prev) => ({ ...prev, loading: true }));

      switch (actionState.type) {
        case "hide":
          await moderationService.hidePost(
            post.id,
            adminInfo,
            actionState.reason,
          );
          break;
        case "restore":
          await moderationService.restorePost(
            post.id,
            adminInfo,
            actionState.reason,
          );
          break;
        case "delete":
          if (
            window.confirm(
              "¿Estás seguro de que quieres eliminar esta publicación permanentemente?",
            )
          ) {
            await moderationService.deletePost(
              post.id,
              adminInfo,
              actionState.reason,
            );
          } else {
            setActionState({ type: null, loading: false, reason: "" });
            setShowActionModal(false);
            return;
          }
          break;
      }

      onActionComplete();
      setShowActionModal(false);
      setActionState({ type: null, loading: false, reason: "" });
    } catch (error) {
      console.error("❌ Error performing action:", error);
      alert("Error al realizar la acción. Intenta nuevamente.");
    } finally {
      setActionState((prev) => ({ ...prev, loading: false }));
    }
  };

  const cancelAction = () => {
    setActionState({ type: null, loading: false, reason: "" });
    setShowActionModal(false);
  };

  // Status badge
  const getStatusBadge = () => {
    if (post.hasReports) {
      return (
        <Badge variant="destructive" className="flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Reportado
        </Badge>
      );
    }

    if (post.isVisible === false) {
      return (
        <Badge variant="secondary" className="flex items-center">
          <EyeOff className="h-3 w-3 mr-1" />
          Oculto
        </Badge>
      );
    }

    return (
      <Badge
        variant="default"
        className="flex items-center bg-green-100 text-green-800"
      >
        <Eye className="h-3 w-3 mr-1" />
        Visible
      </Badge>
    );
  };

  // Format content for display
  const formatContent = (text: string) => {
    if (text.length <= 200) return text;
    return text.substring(0, 200) + "...";
  };

  // Get time since creation
  const getTimeSince = () => {
    if (!post.createdAt) return "Fecha desconocida";

    const date = safeTimestampToDate(post.createdAt);
    return formatTimeAgo(date);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {post.authorName.charAt(0).toUpperCase()}
              </div>

              {/* Author Info */}
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">
                    {post.authorName}
                  </h3>
                  {getStatusBadge()}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {post.companyName && (
                    <div className="flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      {post.companyName}
                    </div>
                  )}

                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {getTimeSince()}
                  </div>

                  {post.appSource && (
                    <div className="flex items-center">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {post.appSource}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-gray-900 whitespace-pre-wrap">
              {formatContent(post.content.text || "")}
            </p>

            {/* Media Content */}
            {post.content.media && post.content.media.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {post.content.media.slice(0, 4).map((media, index) => (
                  <div
                    key={index}
                    className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video"
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={media.name || "Media"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ExternalLink className="h-8 w-8 text-gray-400" />
                        <span className="text-xs text-gray-500 ml-2">
                          {media.type}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between mb-4 py-2 border-t border-gray-100">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {post.engagement?.likes || 0} likes
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {post.engagement?.comments || 0} comentarios
              </div>
              <div className="flex items-center">
                <Share2 className="h-4 w-4 mr-1" />
                {post.engagement?.shares || 0} compartidos
              </div>
            </div>

            {/* Post ID for reference */}
            <div className="text-xs text-gray-400 font-mono">
              ID: {post.id.substring(0, 8)}...
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              {post.isVisible !== false ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction("hide")}
                  disabled={actionState.loading}
                  className="flex items-center text-yellow-600 hover:text-yellow-700"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ocultar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction("restore")}
                  disabled={actionState.loading}
                  className="flex items-center text-green-600 hover:text-green-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction("delete")}
                disabled={actionState.loading}
                className="flex items-center text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ver Detalle
            </Button>
          </div>

          {/* Additional Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-100"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Autor ID:</strong>
                    <p className="text-gray-600 font-mono">{post.authorId}</p>
                  </div>

                  {post.companyId && (
                    <div>
                      <strong className="text-gray-700">Company ID:</strong>
                      <p className="text-gray-600 font-mono">
                        {post.companyId}
                      </p>
                    </div>
                  )}

                  <div>
                    <strong className="text-gray-700">Creado:</strong>
                    <p className="text-gray-600">
                      {post.createdAt
                        ? safeTimestampToDate(post.createdAt).toLocaleString(
                            "es-ES",
                          )
                        : "Fecha desconocida"}
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-700">
                      Última actualización:
                    </strong>
                    <p className="text-gray-600">
                      {post.updatedAt
                        ? safeTimestampToDate(post.updatedAt).toLocaleString(
                            "es-ES",
                          )
                        : "No actualizado"}
                    </p>
                  </div>
                </div>

                {/* Moderation Info */}
                {(post.moderatedAt || post.moderatedBy) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Información de Moderación
                    </h4>
                    <div className="text-sm text-yellow-700">
                      {post.moderatedBy && (
                        <p>
                          <strong>Moderado por:</strong> {post.moderatedBy}
                        </p>
                      )}
                      {post.moderatedAt && (
                        <p>
                          <strong>Fecha:</strong>{" "}
                          {safeTimestampToDate(post.moderatedAt).toLocaleString(
                            "es-ES",
                          )}
                        </p>
                      )}
                      {post.moderationReason && (
                        <p>
                          <strong>Razón:</strong> {post.moderationReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Reports Info */}
                {post.hasReports && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Esta publicación ha sido reportada
                    </h4>
                    <div className="text-sm text-red-700">
                      {post.lastReportedAt && (
                        <p>
                          <strong>Último reporte:</strong>{" "}
                          {safeTimestampToDate(
                            post.lastReportedAt,
                          ).toLocaleString("es-ES")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={cancelAction}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar{" "}
                {actionState.type === "hide"
                  ? "Ocultar"
                  : actionState.type === "restore"
                    ? "Restaurar"
                    : "Eliminar"}{" "}
                Publicación
              </h3>

              <p className="text-gray-600 mb-4">
                {actionState.type === "hide" &&
                  "La publicación será ocultada del feed pero no eliminada."}
                {actionState.type === "restore" &&
                  "La publicación será visible nuevamente en el feed."}
                {actionState.type === "delete" &&
                  "Esta acción no se puede deshacer. La publicación será eliminada permanentemente."}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón (opcional):
                </label>
                <textarea
                  value={actionState.reason}
                  onChange={(e) =>
                    setActionState((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe la razón de esta acción..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelAction}
                  disabled={actionState.loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmAction}
                  disabled={actionState.loading}
                  className={
                    actionState.type === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : actionState.type === "hide"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-green-600 hover:bg-green-700"
                  }
                >
                  {actionState.loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    `${
                      actionState.type === "hide"
                        ? "Ocultar"
                        : actionState.type === "restore"
                          ? "Restaurar"
                          : "Eliminar"
                    }`
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
