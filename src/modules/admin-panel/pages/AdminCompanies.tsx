import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  FiGrid,
  FiCheck,
  FiX,
  FiUpload,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiLink,
  FiMinus,
} from "react-icons/fi";
import { adminCompanyService, AdminCompany } from "../services/adminFirebase";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { QueryDocumentSnapshot } from "firebase/firestore";

export const AdminCompanies: React.FC = () => {
  const { canAccess, user } = useAdminAuth();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagingDoc, setPagingDoc] = useState<QueryDocumentSnapshot | undefined>(
    undefined,
  );
  const [hasMore, setHasMore] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<AdminCompany | null>(
    null,
  );
  const [form, setForm] = useState<Partial<AdminCompany>>({
    name: "",
    type: "",
    country: "",
    status: "pending",
    apps: [],
  });

  // Available apps for linking
  const availableApps = [
    {
      id: "legality360",
      name: "Legality 360",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "we-consulting",
      name: "WE Consulting",
      color: "bg-green-100 text-green-800",
    },
    {
      id: "mundero-crm",
      name: "Mundero CRM",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "analytics-pro",
      name: "Analytics Pro",
      color: "bg-orange-100 text-orange-800",
    },
  ];

  useEffect(() => {
    if (canAccess("companies")) {
      loadCompanies();
    }
  }, [canAccess]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const {
        companies: companiesData,
        lastDoc,
        hasMore: more,
      } = await adminCompanyService.getCompaniesPaged(30);
      setCompanies(companiesData);
      setPagingDoc(lastDoc);
      setHasMore(more);
      setSearchTerm(""); // Clear search when reloading
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return loadCompanies();
    try {
      setLoading(true);
      const results = await adminCompanyService.searchCompanies(
        searchTerm.trim(),
      );
      setCompanies(results);
      setPagingDoc(undefined);
      setHasMore(false);
    } catch (error) {
      console.error("Error searching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    try {
      setLoading(true);
      const {
        companies: next,
        lastDoc,
        hasMore: more,
      } = await adminCompanyService.getCompaniesPaged(30, pagingDoc);
      setCompanies((prev) => [...prev, ...next]);
      setPagingDoc(lastDoc);
      setHasMore(more);
    } catch (error) {
      console.error("Error loading more companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCompany = async () => {
    try {
      if (editingCompany) {
        await adminCompanyService.updateCompany(editingCompany.id, form);
      } else {
        await adminCompanyService.createCompany(form);
      }
      setShowCreateModal(false);
      setEditingCompany(null);
      resetForm();
      await loadCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Error al guardar empresa");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "",
      country: "",
      status: "pending",
      apps: [],
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCompany(null);
    setShowCreateModal(true);
  };

  const openEditModal = (company: AdminCompany) => {
    setForm({
      name: company.name,
      type: company.type,
      country: company.country,
      status: company.status,
      apps: company.apps ?? [],
    });
    setEditingCompany(company);
    setShowCreateModal(true);
  };

  const handleStatusChange = async (
    company: AdminCompany,
    newStatus: AdminCompany["status"],
  ) => {
    try {
      let reason = "";
      if (newStatus === "inactive") {
        reason = prompt("Motivo de inactivación (opcional):") || "";
      }

      await adminCompanyService.changeCompanyStatus(
        company.id,
        newStatus,
        reason,
        { uid: user?.id!, email: user?.email! },
      );
      await loadCompanies();
    } catch (error) {
      console.error("Error changing company status:", error);
      alert("Error al cambiar estado de la empresa");
    }
  };

  const handleLinkApp = async (companyId: string, appId: string) => {
    try {
      await adminCompanyService.linkApp(companyId, appId);
      await loadCompanies();
    } catch (error) {
      console.error("Error linking app:", error);
      alert("Error al vincular aplicación");
    }
  };

  const handleUnlinkApp = async (companyId: string, appId: string) => {
    try {
      await adminCompanyService.unlinkApp(companyId, appId);
      await loadCompanies();
    } catch (error) {
      console.error("Error unlinking app:", error);
      alert("Error al desvincular aplicación");
    }
  };

  const filteredCompanies = companies.filter((company) => {
    return selectedStatus === "all" || company.status === selectedStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      approved: "Aprobada",
      pending: "Pendiente",
      rejected: "Rechazada",
      active: "Activa",
      inactive: "Inactiva",
    };
    return texts[status] || status;
  };

  const getAppBadgeColor = (appId: string) => {
    const app = availableApps.find((a) => a.id === appId);
    return app?.color || "bg-gray-100 text-gray-800";
  };

  const getAppName = (appId: string) => {
    const app = availableApps.find((a) => a.id === appId);
    return app?.name || appId;
  };

  if (!canAccess("companies")) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Empresas y Perfiles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona empresas registradas y sus perfiles corporativos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateModal}>
            <FiPlus className="mr-2 h-4 w-4" />
            Nueva Empresa
          </Button>
          <Button onClick={loadCompanies} disabled={loading} variant="outline">
            <FiRefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar empresas por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <FiSearch className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado:
              </Label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="pending">Pendientes</option>
                <option value="inactive">Inactivas</option>
              </select>
              <div className="text-sm text-gray-500">
                {filteredCompanies.length} empresas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiGrid className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Activas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.filter((c) => c.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pendientes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.filter((c) => c.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FiX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Inactivas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.filter((c) => c.status === "inactive").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : filteredCompanies.map((company) => (
              <Card
                key={company.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          <FiGrid className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {company.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(company.status)}>
                      {getStatusText(company.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="text-gray-900 dark:text-white">
                        {company.type || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">País:</span>
                      <span className="text-gray-900 dark:text-white">
                        {company.country || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Usuarios:</span>
                      <span className="text-gray-900 dark:text-white">
                        {company.usersCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Registro:</span>
                      <span className="text-gray-900 dark:text-white">
                        {company.createdAt?.toDate?.()?.toLocaleDateString() ||
                          "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Apps badges */}
                  {company.apps && company.apps.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Aplicaciones:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {company.apps.map((appId) => (
                          <Badge
                            key={appId}
                            className={`text-xs ${getAppBadgeColor(appId)}`}
                          >
                            {getAppName(appId)}
                            <button
                              onClick={() => handleUnlinkApp(company.id, appId)}
                              className="ml-1 text-xs hover:text-red-600"
                            >
                              <FiX className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(company)}
                    >
                      <FiEdit className="mr-1 h-4 w-4" />
                      Editar
                    </Button>

                    {company.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleStatusChange(company, "active")}
                      >
                        <FiCheck className="mr-1 h-4 w-4" />
                        Activar
                      </Button>
                    )}

                    {company.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleStatusChange(company, "inactive")}
                      >
                        <FiX className="mr-1 h-4 w-4" />
                        Suspender
                      </Button>
                    )}

                    {company.status === "inactive" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-yellow-600 hover:text-yellow-700"
                        onClick={() => handleStatusChange(company, "pending")}
                      >
                        <FiRefreshCw className="mr-1 h-4 w-4" />
                        Reactivar
                      </Button>
                    )}

                    {/* Link app dropdown */}
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const appId = prompt(
                            `Apps disponibles:\n${availableApps.map((a) => `${a.id}: ${a.name}`).join("\n")}\n\nIngresa el ID de la app a vincular:`,
                          );
                          if (
                            appId &&
                            availableApps.find((a) => a.id === appId)
                          ) {
                            handleLinkApp(company.id, appId);
                          }
                        }}
                      >
                        <FiLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Load more button */}
      {hasMore && !searchTerm && (
        <div className="text-center">
          <Button onClick={loadMore} disabled={loading} variant="outline">
            {loading ? (
              <>
                <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar más empresas"
            )}
          </Button>
        </div>
      )}

      {filteredCompanies.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FiGrid className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? `No se encontraron empresas para "${searchTerm}"`
                : "No se encontraron empresas"}
            </p>
            {searchTerm && (
              <Button
                onClick={loadCompanies}
                className="mt-4"
                variant="outline"
              >
                Ver todas las empresas
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingCompany ? "Editar Empresa" : "Nueva Empresa"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la empresa *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre de la empresa"
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de empresa</Label>
                <Input
                  id="type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="ej. Tecnología, Consultoría"
                />
              </div>

              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  placeholder="País"
                />
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as AdminCompany["status"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pendiente</option>
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveCompany} className="flex-1">
                  {editingCompany ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCompany(null);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
