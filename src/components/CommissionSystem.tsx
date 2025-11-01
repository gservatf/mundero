import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiUser,
  FiCheck,
  FiClock,
  FiX,
  FiDownload,
  FiEye,
  FiFilter,
  FiSearch,
  FiBarChart,
  FiPieChart,
} from "react-icons/fi";
import { useMockAuth } from "../hooks/useMockData";
import toast from "react-hot-toast";

interface Commission {
  id: string;
  referral: {
    name: string;
    company: string;
    avatar: string;
  };
  service: {
    name: string;
    type: "legalty" | "we_consulting" | "portales" | "pitahaya";
    color: string;
  };
  amount: number;
  percentage: number;
  status: "pending" | "approved" | "paid" | "rejected";
  date: string;
  paymentDate?: string;
  description: string;
  contractValue: number;
}

interface CommissionStats {
  totalEarned: number;
  pendingAmount: number;
  thisMonth: number;
  growth: number;
  totalReferrals: number;
  conversionRate: number;
}

const CommissionSystem = () => {
  const { user } = useMockAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const [stats] = useState<CommissionStats>({
    totalEarned: 8750.5,
    pendingAmount: 2450.0,
    thisMonth: 1890.75,
    growth: 23.5,
    totalReferrals: 28,
    conversionRate: 67.8,
  });

  const [commissions] = useState<Commission[]>([
    {
      id: "1",
      referral: {
        name: "Carlos Mendoza",
        company: "Constructora Lima SAC",
        avatar:
          "https://ui-avatars.com/api/?name=Carlos+Mendoza&background=f59e0b&color=fff",
      },
      service: {
        name: "Legalty Pro",
        type: "legalty",
        color: "bg-blue-500",
      },
      amount: 750.0,
      percentage: 15,
      status: "paid",
      date: "2024-01-15",
      paymentDate: "2024-01-30",
      description:
        "Implementación completa de sistema legal para gestión de contratos",
      contractValue: 5000.0,
    },
    {
      id: "2",
      referral: {
        name: "Ana Rodriguez",
        company: "StartupTech",
        avatar:
          "https://ui-avatars.com/api/?name=Ana+Rodriguez&background=8b5cf6&color=fff",
      },
      service: {
        name: "We Consulting",
        type: "we_consulting",
        color: "bg-green-500",
      },
      amount: 1200.0,
      percentage: 20,
      status: "approved",
      date: "2024-01-20",
      description: "Consultoría estratégica para transformación digital",
      contractValue: 6000.0,
    },
    {
      id: "3",
      referral: {
        name: "Roberto Silva",
        company: "Innovación Corp",
        avatar:
          "https://ui-avatars.com/api/?name=Roberto+Silva&background=6366f1&color=fff",
      },
      service: {
        name: "Portales Web",
        type: "portales",
        color: "bg-purple-500",
      },
      amount: 500.0,
      percentage: 12.5,
      status: "pending",
      date: "2024-01-25",
      description: "Desarrollo de portal corporativo con integración CRM",
      contractValue: 4000.0,
    },
    {
      id: "4",
      referral: {
        name: "María González",
        company: "Consulting Pro EIRL",
        avatar:
          "https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff",
      },
      service: {
        name: "Pitahaya Analytics",
        type: "pitahaya",
        color: "bg-orange-500",
      },
      amount: 900.0,
      percentage: 18,
      status: "pending",
      date: "2024-01-28",
      description:
        "Implementación de sistema de analytics y business intelligence",
      contractValue: 5000.0,
    },
    {
      id: "5",
      referral: {
        name: "Diego Morales",
        company: "TechSolutions SAC",
        avatar:
          "https://ui-avatars.com/api/?name=Diego+Morales&background=ef4444&color=fff",
      },
      service: {
        name: "Legalty Enterprise",
        type: "legalty",
        color: "bg-blue-500",
      },
      amount: 1500.0,
      percentage: 15,
      status: "paid",
      date: "2024-01-10",
      paymentDate: "2024-01-25",
      description: "Suite completa de herramientas legales para empresa grande",
      contractValue: 10000.0,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "approved":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <FiCheck className="w-4 h-4" />;
      case "approved":
        return <FiClock className="w-4 h-4" />;
      case "pending":
        return <FiClock className="w-4 h-4" />;
      case "rejected":
        return <FiX className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagado";
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return "Pendiente";
    }
  };

  const filteredCommissions = commissions.filter((commission) => {
    const matchesFilter =
      activeFilter === "all" || commission.status === activeFilter;
    const matchesSearch =
      commission.referral.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      commission.service.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      commission.referral.company
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportData = () => {
    toast.success("Exportando datos de comisiones...");
  };

  const handleRequestPayment = (commissionId: string) => {
    toast.success("Solicitud de pago enviada correctamente");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Sistema de Comisiones
          </h3>
          <p className="text-gray-600">
            Gestiona y monitorea tus comisiones por referidos
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg">
            <FiBarChart className="w-4 h-4" />
            <span>Ver Reportes</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium text-sm">Total Ganado</p>
              <p className="text-3xl font-bold text-green-900">
                ${stats.totalEarned.toLocaleString()}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <FiTrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600 text-sm font-medium">
                  +{stats.growth}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium text-sm">
                Pendiente de Pago
              </p>
              <p className="text-3xl font-bold text-blue-900">
                ${stats.pendingAmount.toLocaleString()}
              </p>
              <p className="text-blue-600 text-sm">3 comisiones</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FiClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-medium text-sm">Este Mes</p>
              <p className="text-3xl font-bold text-purple-900">
                ${stats.thisMonth.toLocaleString()}
              </p>
              <p className="text-purple-600 text-sm">5 referidos convertidos</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 font-medium text-sm">
                Tasa Conversión
              </p>
              <p className="text-3xl font-bold text-orange-900">
                {stats.conversionRate}%
              </p>
              <p className="text-orange-600 text-sm">
                {stats.totalReferrals} referidos totales
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <FiPieChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por referido, empresa o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {["all", "pending", "approved", "paid"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeFilter === filter
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {filter === "all" ? "Todos" : getStatusLabel(filter)}
                </button>
              ))}
            </div>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los períodos</option>
              <option value="thisMonth">Este mes</option>
              <option value="lastMonth">Mes pasado</option>
              <option value="thisYear">Este año</option>
            </select>
          </div>
        </div>
      </div>

      {/* Commissions List */}
      <div className="space-y-4">
        {filteredCommissions.map((commission) => (
          <motion.div
            key={commission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={commission.referral.avatar}
                    alt={commission.referral.name}
                    className="w-14 h-14 rounded-full ring-2 ring-gray-100"
                  />

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {commission.referral.name}
                      </h4>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        {commission.referral.company}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-4 h-4 rounded-full ${commission.service.color}`}
                      ></div>
                      <span className="font-medium text-gray-900">
                        {commission.service.name}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {commission.percentage}% comisión
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {commission.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>
                          Referido:{" "}
                          {new Date(commission.date).toLocaleDateString()}
                        </span>
                      </div>
                      {commission.paymentDate && (
                        <div className="flex items-center space-x-1">
                          <FiCheck className="w-4 h-4 text-green-500" />
                          <span>
                            Pagado:{" "}
                            {new Date(
                              commission.paymentDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <FiDollarSign className="w-4 h-4" />
                        <span>
                          Contrato: ${commission.contractValue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${commission.amount.toLocaleString()}
                    </p>
                    <div
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(commission.status)}`}
                    >
                      {getStatusIcon(commission.status)}
                      <span>{getStatusLabel(commission.status)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                      <FiEye className="w-4 h-4" />
                    </button>
                    {commission.status === "approved" && (
                      <button
                        onClick={() => handleRequestPayment(commission.id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Solicitar Pago
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCommissions.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron comisiones
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Aún no tienes comisiones registradas"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommissionSystem;
