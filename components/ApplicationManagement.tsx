import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiGrid,
  FiPlus,
  FiKey,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
  FiX,
  FiSettings,
  FiTrash2,
  FiPause,
  FiPlay,
  FiLink,
  FiShield,
  FiActivity,
  FiCalendar,
  FiGlobe,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import toast from "react-hot-toast";

interface IntegratedApp {
  id: string;
  nombre: string;
  slug: string;
  urlBase: string;
  apiKey: string;
  apiSecret: string;
  permisos: string[];
  estado: "activo" | "pausado" | "revocado";
  fechaCreacion: string;
  ultimaSincronizacion?: string;
  descripcion?: string;
  logoUrl?: string;
  webhooksConfigured: number;
  requestsCount: number;
}

interface NewAppForm {
  nombre: string;
  urlBase: string;
  descripcion: string;
  permisos: string[];
}

const ApplicationManagement = () => {
  const [apps, setApps] = useState<IntegratedApp[]>([
    {
      id: "1",
      nombre: "Legalty",
      slug: "legalty",
      urlBase: "https://api.legalty.app",
      apiKey: "app_b0d1c97f-2f6d-44c9-a38b-2fa2dc38f451",
      apiSecret: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
      permisos: ["user.read", "lead.converted", "commission.sync"],
      estado: "activo",
      fechaCreacion: "2024-01-15",
      ultimaSincronizacion: "2024-01-30T10:30:00Z",
      descripcion: "Plataforma de servicios legales automatizados",
      logoUrl:
        "https://ui-avatars.com/api/?name=Legalty&background=3b82f6&color=fff",
      webhooksConfigured: 3,
      requestsCount: 1247,
    },
    {
      id: "2",
      nombre: "We Consulting",
      slug: "weconsulting",
      urlBase: "https://api.weconsulting.pe",
      apiKey: "app_f3e2d1c0-9b8a-7654-3210-fedcba987654",
      apiSecret: "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4",
      permisos: ["user.read", "user.write", "company.sync"],
      estado: "activo",
      fechaCreacion: "2024-01-20",
      ultimaSincronizacion: "2024-01-29T15:45:00Z",
      descripcion: "Servicios de consultoría empresarial y gestión",
      logoUrl:
        "https://ui-avatars.com/api/?name=We+Consulting&background=10b981&color=fff",
      webhooksConfigured: 2,
      requestsCount: 856,
    },
    {
      id: "3",
      nombre: "Portales",
      slug: "portales",
      urlBase: "https://api.portales.dev",
      apiKey: "app_a9b8c7d6-e5f4-3210-9876-543210fedcba",
      apiSecret: "p0o9i8u7y6t5r4e3w2q1a0s9d8f7g6h5j4k3l2z1x0c9v8b7n6m5",
      permisos: ["user.read", "portal.create"],
      estado: "pausado",
      fechaCreacion: "2024-01-25",
      ultimaSincronizacion: "2024-01-28T09:15:00Z",
      descripcion: "Desarrollo de portales web y aplicaciones",
      logoUrl:
        "https://ui-avatars.com/api/?name=Portales&background=8b5cf6&color=fff",
      webhooksConfigured: 1,
      requestsCount: 234,
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState<string | null>(null);
  const [newAppCredentials, setNewAppCredentials] = useState<{
    apiKey: string;
    apiSecret: string;
  } | null>(null);
  const [formData, setFormData] = useState<NewAppForm>({
    nombre: "",
    urlBase: "",
    descripcion: "",
    permisos: [],
  });

  const availablePermissions = [
    {
      id: "user.read",
      label: "Leer usuarios",
      description: "Acceso de lectura a datos de usuarios",
    },
    {
      id: "user.write",
      label: "Escribir usuarios",
      description: "Crear y modificar usuarios",
    },
    {
      id: "company.read",
      label: "Leer empresas",
      description: "Acceso a datos de empresas",
    },
    {
      id: "company.sync",
      label: "Sincronizar empresas",
      description: "Sincronización bidireccional de empresas",
    },
    {
      id: "lead.converted",
      label: "Leads convertidos",
      description: "Notificar conversiones de leads",
    },
    {
      id: "commission.sync",
      label: "Sincronizar comisiones",
      description: "Gestión de comisiones y pagos",
    },
    {
      id: "webhook.send",
      label: "Enviar webhooks",
      description: "Capacidad de enviar notificaciones",
    },
    {
      id: "analytics.read",
      label: "Leer analytics",
      description: "Acceso a métricas y estadísticas",
    },
  ];

  const generateApiCredentials = () => {
    const apiKey = `app_${crypto.randomUUID()}`;
    const apiSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return { apiKey, apiSecret };
  };

  const handleCreateApp = () => {
    if (
      !formData.nombre ||
      !formData.urlBase ||
      formData.permisos.length === 0
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const credentials = generateApiCredentials();
    const newApp: IntegratedApp = {
      id: crypto.randomUUID(),
      nombre: formData.nombre,
      slug: formData.nombre.toLowerCase().replace(/\s+/g, ""),
      urlBase: formData.urlBase,
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      permisos: formData.permisos,
      estado: "activo",
      fechaCreacion: new Date().toISOString().split("T")[0],
      descripcion: formData.descripcion,
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nombre)}&background=6366f1&color=fff`,
      webhooksConfigured: 0,
      requestsCount: 0,
    };

    setApps((prev) => [...prev, newApp]);
    setNewAppCredentials(credentials);
    setFormData({ nombre: "", urlBase: "", descripcion: "", permisos: [] });
    toast.success("Aplicación registrada exitosamente");
  };

  const handleTogglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(permissionId)
        ? prev.permisos.filter((p) => p !== permissionId)
        : [...prev.permisos, permissionId],
    }));
  };

  const handleChangeStatus = (
    appId: string,
    newStatus: "activo" | "pausado" | "revocado",
  ) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, estado: newStatus } : app,
      ),
    );

    const statusMessages = {
      activo: "Aplicación activada",
      pausado: "Aplicación pausada",
      revocado: "Aplicación revocada",
    };

    toast.success(statusMessages[newStatus]);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado al portapapeles`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-green-100 text-green-700 border-green-200";
      case "pausado":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "revocado":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "activo":
        return <FiCheck className="w-4 h-4" />;
      case "pausado":
        return <FiPause className="w-4 h-4" />;
      case "revocado":
        return <FiX className="w-4 h-4" />;
      default:
        return <FiSettings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Gestión de Aplicaciones
          </h3>
          <p className="text-gray-600">
            Administra aplicaciones integradas, API Keys y permisos
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          <FiPlus className="w-5 h-5" />
          <span className="font-medium">Registrar Nueva App</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium">Apps Registradas</p>
              <p className="text-3xl font-bold text-blue-900">{apps.length}</p>
              <p className="text-blue-600 text-sm">
                {apps.filter((a) => a.estado === "activo").length} activas
              </p>
            </div>
            <FiGrid className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-green-900">
                {apps
                  .reduce((sum, app) => sum + app.requestsCount, 0)
                  .toLocaleString()}
              </p>
              <p className="text-green-600 text-sm">Este mes</p>
            </div>
            <FiActivity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-medium">Webhooks Activos</p>
              <p className="text-3xl font-bold text-purple-900">
                {apps.reduce((sum, app) => sum + app.webhooksConfigured, 0)}
              </p>
              <p className="text-purple-600 text-sm">Configurados</p>
            </div>
            <FiLink className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 font-medium">Apps Pausadas</p>
              <p className="text-3xl font-bold text-orange-900">
                {apps.filter((a) => a.estado === "pausado").length}
              </p>
              <p className="text-orange-600 text-sm">Requieren atención</p>
            </div>
            <FiPause className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-bold text-gray-900">Aplicaciones Integradas</h4>
        </div>

        <div className="p-6 space-y-4">
          {apps.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={app.logoUrl}
                    alt={app.nombre}
                    className="w-16 h-16 rounded-xl ring-2 ring-gray-200"
                  />

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {app.nombre}
                      </h4>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {app.slug}
                      </span>
                      <div
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(app.estado)}`}
                      >
                        {getStatusIcon(app.estado)}
                        <span className="capitalize">{app.estado}</span>
                      </div>
                    </div>

                    {app.descripcion && (
                      <p className="text-gray-700 mb-3">{app.descripcion}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <FiGlobe className="w-4 h-4" />
                        <span>{app.urlBase}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiActivity className="w-4 h-4" />
                        <span>
                          {app.requestsCount.toLocaleString()} requests
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiLink className="w-4 h-4" />
                        <span>{app.webhooksConfigured} webhooks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="w-4 h-4" />
                        <span>
                          Creado:{" "}
                          {new Date(app.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>
                      {app.ultimaSincronizacion && (
                        <div className="flex items-center space-x-2">
                          <FiCheck className="w-4 h-4 text-green-500" />
                          <span>
                            Última sync:{" "}
                            {new Date(
                              app.ultimaSincronizacion,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* API Credentials */}
                    <div className="mb-4 p-4 bg-white rounded-lg border">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                        <FiKey className="w-4 h-4" />
                        <span>Credenciales API</span>
                      </h5>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key
                          </label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                              {app.apiKey}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(app.apiKey, "API Key")
                              }
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              <FiCopy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Secret
                          </label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                              {showApiSecret === app.id
                                ? app.apiSecret
                                : "••••••••••••••••••••••••••••••••"}
                            </code>
                            <button
                              onClick={() =>
                                setShowApiSecret(
                                  showApiSecret === app.id ? null : app.id,
                                )
                              }
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              {showApiSecret === app.id ? (
                                <FiEyeOff className="w-4 h-4" />
                              ) : (
                                <FiEye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                copyToClipboard(app.apiSecret, "API Secret")
                              }
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              <FiCopy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                        <FiShield className="w-4 h-4" />
                        <span>Permisos</span>
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {app.permisos.map((permiso) => (
                          <span
                            key={permiso}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                          >
                            {permiso}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {app.estado === "activo" && (
                    <button
                      onClick={() => handleChangeStatus(app.id, "pausado")}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Pausar
                    </button>
                  )}
                  {app.estado === "pausado" && (
                    <button
                      onClick={() => handleChangeStatus(app.id, "activo")}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Activar
                    </button>
                  )}
                  <button
                    onClick={() => handleChangeStatus(app.id, "revocado")}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Revocar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create App Modal */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Registrar Nueva Aplicación
                  </h2>
                  <p className="text-blue-100">
                    Genera credenciales API automáticamente
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewAppCredentials(null);
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {newAppCredentials ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FiCheck className="w-6 h-6 text-green-600" />
                      <h3 className="font-bold text-green-900">
                        ¡Aplicación creada exitosamente!
                      </h3>
                    </div>
                    <p className="text-green-700 text-sm">
                      Guarda estas credenciales en un lugar seguro. No podrás
                      verlas nuevamente.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-mono text-sm">
                          {newAppCredentials.apiKey}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(newAppCredentials.apiKey, "API Key")
                          }
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Secret
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-mono text-sm break-all">
                          {newAppCredentials.apiSecret}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              newAppCredentials.apiSecret,
                              "API Secret",
                            )
                          }
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        Endpoint de Validación
                      </h4>
                      <code className="block text-sm text-yellow-800 bg-yellow-100 p-2 rounded">
                        POST
                        https://api.mundero.mgx.world/api/integraciones/validar
                      </code>
                      <p className="text-yellow-700 text-sm mt-2">
                        Usa este endpoint con el header: Authorization: Bearer{" "}
                        {newAppCredentials.apiKey}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewAppCredentials(null);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Aplicación *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Ej: Legalty, We Consulting"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Base *
                      </label>
                      <input
                        type="url"
                        value={formData.urlBase}
                        onChange={(e) =>
                          setFormData({ ...formData, urlBase: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="https://api.ejemplo.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descripcion: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Describe brevemente la aplicación y su propósito..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permisos de Acceso *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.permisos.includes(permission.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onClick={() => handleTogglePermission(permission.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                formData.permisos.includes(permission.id)
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {formData.permisos.includes(permission.id) && (
                                <FiCheck className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {permission.label}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateApp}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Generar API Key & Crear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ApplicationManagement;
