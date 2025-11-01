// Componente de historial de canjes
// Muestra el historial completo de recompensas canjeadas

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiClock,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiDownload,
  FiMail,
  FiPackage,
  FiZap,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import { Reward, RewardRedemption, RedemptionStatus } from "./types";

interface RedemptionHistoryProps {
  userId: string;
  redemptions: RewardRedemption[];
  rewards: Reward[];
}

export const RedemptionHistory: React.FC<RedemptionHistoryProps> = ({
  userId,
  redemptions,
  rewards,
}) => {
  const [statusFilter, setStatusFilter] = useState<RedemptionStatus | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const getRewardInfo = (rewardId: string) => {
    return rewards.find((r) => r.id === rewardId);
  };

  const getStatusColor = (status: RedemptionStatus) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: RedemptionStatus) => {
    switch (status) {
      case "delivered":
        return <FiCheck className="w-4 h-4" />;
      case "processing":
        return <FiRefreshCw className="w-4 h-4 animate-spin" />;
      case "pending":
        return <FiClock className="w-4 h-4" />;
      case "expired":
        return <FiX className="w-4 h-4" />;
      case "cancelled":
        return <FiX className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case "email":
        return <FiMail className="w-4 h-4" />;
      case "physical":
        return <FiPackage className="w-4 h-4" />;
      case "instant":
        return <FiZap className="w-4 h-4" />;
      default:
        return <FiDownload className="w-4 h-4" />;
    }
  };

  const filteredRedemptions = redemptions.filter((redemption) => {
    if (statusFilter !== "all" && redemption.status !== statusFilter) {
      return false;
    }

    if (searchQuery) {
      const reward = getRewardInfo(redemption.rewardId);
      if (!reward?.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "delivered", label: "Entregado" },
    { value: "processing", label: "Procesando" },
    { value: "pending", label: "Pendiente" },
    { value: "expired", label: "Expirado" },
    { value: "cancelled", label: "Cancelado" },
  ];

  if (redemptions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FiClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Sin canjes aún</h3>
        <p>Cuando canjees tu primera recompensa aparecerá aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Historial de Canjes
          </h2>
          <p className="text-gray-600">
            Gestiona y revisa tus recompensas canjeadas
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar canjes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as RedemptionStatus | "all")
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Canjes</p>
              <p className="text-2xl font-bold text-blue-900">
                {redemptions.length}
              </p>
            </div>
            <FiDownload className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Entregados</p>
              <p className="text-2xl font-bold text-green-900">
                {redemptions.filter((r) => r.status === "delivered").length}
              </p>
            </div>
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Procesando</p>
              <p className="text-2xl font-bold text-yellow-900">
                {redemptions.filter((r) => r.status === "processing").length}
              </p>
            </div>
            <FiRefreshCw className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">
                Puntos Gastados
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {redemptions
                  .reduce((sum, r) => sum + r.pointsSpent, 0)
                  .toLocaleString()}
              </p>
            </div>
            <FiZap className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Redemptions List */}
      <div className="space-y-4">
        {filteredRedemptions.map((redemption, index) => {
          const reward = getRewardInfo(redemption.rewardId);

          return (
            <motion.div
              key={redemption.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* Reward Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                  {reward?.icon || "🎁"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reward?.title || "Recompensa no encontrada"}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {reward?.description || "Descripción no disponible"}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        -{redemption.pointsSpent.toLocaleString()} pts
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(redemption.redeemedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Status and Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(redemption.status)}`}
                      >
                        {getStatusIcon(redemption.status)}
                        <span className="capitalize">{redemption.status}</span>
                      </span>

                      {redemption.deliveryInfo && (
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          {getDeliveryIcon(redemption.deliveryInfo.method)}
                          <span className="capitalize">
                            {redemption.deliveryInfo.method}
                          </span>
                        </div>
                      )}

                      {redemption.redemptionCode && (
                        <div className="text-xs text-gray-600">
                          Código:{" "}
                          <span className="font-mono font-medium">
                            {redemption.redemptionCode}
                          </span>
                        </div>
                      )}
                    </div>

                    {redemption.status === "delivered" &&
                      redemption.deliveredAt && (
                        <div className="text-xs text-green-600">
                          Entregado el{" "}
                          {new Date(
                            redemption.deliveredAt,
                          ).toLocaleDateString()}
                        </div>
                      )}
                  </div>

                  {/* Expiration */}
                  {redemption.expiresAt &&
                    redemption.status !== "delivered" && (
                      <div className="mt-2 text-xs text-orange-600">
                        Expira el{" "}
                        {new Date(redemption.expiresAt).toLocaleDateString()}
                      </div>
                    )}

                  {/* Tracking Info */}
                  {redemption.deliveryInfo?.trackingNumber && (
                    <div className="mt-2 text-xs text-blue-600">
                      Seguimiento:{" "}
                      <span className="font-mono">
                        {redemption.deliveryInfo.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredRedemptions.length === 0 && redemptions.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <FiFilter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No se encontraron canjes con los filtros aplicados</p>
        </div>
      )}
    </div>
  );
};

export default RedemptionHistory;
