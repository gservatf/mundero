import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiHome,
  FiCheck,
  FiX,
  FiEye,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUserCheck,
  FiAlertCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiUsers,
  FiLink,
  FiSave,
  FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";

interface Company {
  id: string;
  ruc: string;
  nombre: string;
  razonSocial: string;
  sector: string;
  direccion: string;
  telefono: string;
  email: string;
  representanteLegal: string;
  fechaRegistro: string;
  status: "en_proceso" | "validada" | "rechazada";
  empleados: number;
  logo?: string;
  driveUrl?: string;
  sitioWeb?: string;
  descripcion?: string;
  notasContexto?: string;
  empresaInteres?: string;
  validatedBy?: string;
  validatedDate?: string;
  rejectionReason?: string;
}

interface CompanyRole {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: "admin" | "manager" | "employee" | "viewer";
  requestedRole: "admin" | "manager" | "employee" | "viewer";
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

const CompanyManagement = () => {
  const [activeTab, setActiveTab] = useState<"companies" | "roles">(
    "companies",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [driveUrl, setDriveUrl] = useState("");

  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "1",
      ruc: "20123456789",
      nombre: "Constructora Lima SAC",
      razonSocial: "Constructora Lima Sociedad Anónima Cerrada",
      sector: "Construcción",
      direccion: "Av. Javier Prado Este 4200, San Isidro, Lima",
      telefono: "+51 1 234-5678",
      email: "contacto@constructoralima.com",
      representanteLegal: "Carlos Mendoza Pérez",
      fechaRegistro: "2024-01-15",
      status: "en_proceso",
      empleados: 150,
      logo: "https://ui-avatars.com/api/?name=Constructora+Lima&background=3b82f6&color=fff",
      descripcion:
        "Empresa especializada en construcción de obras civiles y edificaciones comerciales.",
      empresaInteres: "We Consulting",
      notasContexto:
        "Buscamos expandir nuestros servicios de consultoría en gestión de proyectos de construcción. Tenemos varios proyectos grandes en pipeline y necesitamos optimizar nuestros procesos.",
    },
    {
      id: "2",
      ruc: "20987654321",
      nombre: "TechSolutions SAC",
      razonSocial: "Technology Solutions Sociedad Anónima Cerrada",
      sector: "Tecnología",
      direccion: "Jr. Las Begonias 441, San Isidro, Lima",
      telefono: "+51 1 987-6543",
      email: "info@techsolutions.pe",
      representanteLegal: "Ana Rodriguez Silva",
      fechaRegistro: "2024-01-20",
      status: "validada",
      empleados: 85,
      logo: "https://ui-avatars.com/api/?name=TechSolutions&background=10b981&color=fff",
      driveUrl: "https://drive.google.com/drive/folders/1abc123def456",
      validatedBy: "Admin MUNDERO",
      validatedDate: "2024-01-25",
      sitioWeb: "https://www.techsolutions.pe",
      descripcion:
        "Desarrollo de software y soluciones tecnológicas innovadoras.",
      empresaInteres: "Legalty",
      notasContexto:
        "Estamos interesados en integrar servicios legales automatizados en nuestras soluciones de software. Queremos ofrecer a nuestros clientes herramientas legales digitales.",
    },
    {
      id: "3",
      ruc: "20456789123",
      nombre: "Consulting Pro EIRL",
      razonSocial:
        "Consulting Pro Empresa Individual de Responsabilidad Limitada",
      sector: "Consultoría",
      direccion: "Av. El Derby 254, Santiago de Surco, Lima",
      telefono: "+51 1 456-7890",
      email: "contacto@consultingpro.pe",
      representanteLegal: "Roberto Silva Martínez",
      fechaRegistro: "2024-01-25",
      status: "rechazada",
      empleados: 25,
      logo: "https://ui-avatars.com/api/?name=Consulting+Pro&background=8b5cf6&color=fff",
      rejectionReason:
        "Documentación incompleta. Falta vigencia de poderes actualizada.",
      descripcion:
        "Servicios de consultoría empresarial y asesoría estratégica.",
      empresaInteres: "Portales",
      notasContexto:
        "Queremos desarrollar una plataforma web para ofrecer nuestros servicios de consultoría de manera digital y llegar a más clientes.",
    },
  ]);

  const [companyRoles] = useState<CompanyRole[]>([
    {
      id: "1",
      companyId: "1",
      userId: "user1",
      userName: "María González",
      userEmail: "maria@constructoralima.com",
      role: "employee",
      requestedRole: "manager",
      status: "pending",
      requestDate: "2024-01-28",
    },
    {
      id: "2",
      companyId: "2",
      userId: "user2",
      userName: "Diego Morales",
      userEmail: "diego@techsolutions.pe",
      role: "viewer",
      requestedRole: "admin",
      status: "pending",
      requestDate: "2024-01-29",
    },
    {
      id: "3",
      companyId: "1",
      userId: "user3",
      userName: "Carmen Vega",
      userEmail: "carmen@constructoralima.com",
      role: "employee",
      requestedRole: "manager",
      status: "approved",
      requestDate: "2024-01-20",
      approvedBy: "Admin",
      approvedDate: "2024-01-22",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validada":
        return "bg-green-100 text-green-700 border-green-200";
      case "en_proceso":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rechazada":
        return "bg-red-100 text-red-700 border-red-200";
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
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
      case "validada":
      case "approved":
        return <FiCheck className="w-4 h-4" />;
      case "en_proceso":
      case "pending":
        return <FiAlertCircle className="w-4 h-4" />;
      case "rechazada":
      case "rejected":
        return <FiX className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "validada":
        return "Validada";
      case "en_proceso":
        return "En Proceso";
      case "rechazada":
        return "Rechazada";
      case "approved":
        return "Aprobada";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazada";
      default:
        return "En Proceso";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "manager":
        return "Gerente";
      case "employee":
        return "Empleado";
      case "viewer":
        return "Visualizador";
      default:
        return role;
    }
  };

  const handleValidateCompany = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? {
              ...company,
              status: "validada",
              validatedBy: "Admin MUNDERO",
              validatedDate: new Date().toISOString().split("T")[0],
            }
          : company,
      ),
    );
    toast.success("Empresa validada correctamente");
  };

  const handleRejectCompany = (companyId: string, reason?: string) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? {
              ...company,
              status: "rechazada",
              rejectionReason:
                reason || "Documentación no cumple con los requisitos",
            }
          : company,
      ),
    );
    toast.error("Empresa rechazada");
  };

  const handleSaveDriveUrl = (companyId: string) => {
    if (!driveUrl.trim()) {
      toast.error("Por favor ingresa una URL válida");
      return;
    }

    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId ? { ...company, driveUrl: driveUrl } : company,
      ),
    );

    setEditingCompany(null);
    setDriveUrl("");
    toast.success("URL de Drive guardada correctamente");
  };

  const handleApproveRole = (roleId: string) => {
    toast.success("Rol aprobado correctamente");
  };

  const handleRejectRole = (roleId: string) => {
    toast.error("Solicitud de rol rechazada");
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.ruc.includes(searchTerm) ||
      company.representanteLegal
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      company.empresaInteres?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRoles = companyRoles.filter((role) => {
    const matchesSearch =
      role.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Gestión de Empresas y Roles
          </h3>
          <p className="text-gray-600">
            Administra empresas registradas, documentación y solicitudes de
            roles
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
            <FiDownload className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium text-sm">
                Empresas Registradas
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {companies.length}
              </p>
              <p className="text-blue-600 text-sm">
                {companies.filter((c) => c.status === "validada").length}{" "}
                validadas
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FiHome className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 font-medium text-sm">En Proceso</p>
              <p className="text-3xl font-bold text-yellow-900">
                {companies.filter((c) => c.status === "en_proceso").length}
              </p>
              <p className="text-yellow-600 text-sm">Pendientes validación</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-medium text-sm">
                Solicitudes de Rol
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {companyRoles.filter((r) => r.status === "pending").length}
              </p>
              <p className="text-purple-600 text-sm">Por aprobar</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <FiUserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium text-sm">
                Total Empleados
              </p>
              <p className="text-3xl font-bold text-green-900">
                {companies.reduce((sum, c) => sum + c.empleados, 0)}
              </p>
              <p className="text-green-600 text-sm">En plataforma</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("companies")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "companies"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Empresas ({companies.length})
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "roles"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Solicitudes de Rol (
              {companyRoles.filter((r) => r.status === "pending").length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={
                  activeTab === "companies"
                    ? "Buscar empresas, RUC, representante, empresa de interés..."
                    : "Buscar usuarios, email..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="all">Todos los estados</option>
                {activeTab === "companies" ? (
                  <>
                    <option value="en_proceso">En Proceso</option>
                    <option value="validada">Validada</option>
                    <option value="rechazada">Rechazada</option>
                  </>
                ) : (
                  <>
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "companies" && (
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={company.logo}
                        alt={company.nombre}
                        className="w-16 h-16 rounded-xl ring-2 ring-gray-200"
                      />

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {company.nombre}
                          </h4>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            RUC: {company.ruc}
                          </span>
                          <div
                            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(company.status)}`}
                          >
                            {getStatusIcon(company.status)}
                            <span>{getStatusLabel(company.status)}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">
                          {company.razonSocial}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <FiHome className="w-4 h-4" />
                            <span>{company.sector}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiMapPin className="w-4 h-4" />
                            <span>{company.direccion}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiPhone className="w-4 h-4" />
                            <span>{company.telefono}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiMail className="w-4 h-4" />
                            <span>{company.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiUsers className="w-4 h-4" />
                            <span>{company.empleados} empleados</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiCalendar className="w-4 h-4" />
                            <span>
                              Registrado:{" "}
                              {new Date(
                                company.fechaRegistro,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {company.descripcion && (
                          <p className="text-gray-700 mb-3 italic">
                            "{company.descripcion}"
                          </p>
                        )}

                        {/* Información de contexto e interés */}
                        {(company.empresaInteres || company.notasContexto) && (
                          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                              <FiFileText className="w-4 h-4" />
                              <span>Contexto e Interés</span>
                            </h5>
                            {company.empresaInteres && (
                              <p className="text-blue-800 text-sm mb-2">
                                <strong>Empresa de interés:</strong>{" "}
                                {company.empresaInteres}
                              </p>
                            )}
                            {company.notasContexto && (
                              <p className="text-blue-800 text-sm">
                                <strong>Notas:</strong> {company.notasContexto}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Drive URL Section */}
                        <div className="mb-4 p-4 bg-white rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                              <FiLink className="w-4 h-4" />
                              <span>Documentación en Drive</span>
                            </h5>
                            {editingCompany?.id !== company.id && (
                              <button
                                onClick={() => {
                                  setEditingCompany(company);
                                  setDriveUrl(company.driveUrl || "");
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {editingCompany?.id === company.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="url"
                                value={driveUrl}
                                onChange={(e) => setDriveUrl(e.target.value)}
                                placeholder="https://drive.google.com/drive/folders/..."
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                              />
                              <button
                                onClick={() => handleSaveDriveUrl(company.id)}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <FiSave className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCompany(null);
                                  setDriveUrl("");
                                }}
                                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              {company.driveUrl ? (
                                <a
                                  href={company.driveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-sm break-all"
                                >
                                  {company.driveUrl}
                                </a>
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  No se ha configurado URL de Drive
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {company.status === "validada" &&
                          company.validatedBy && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-green-800 text-sm">
                                <strong>Validada por:</strong>{" "}
                                {company.validatedBy} el{" "}
                                {new Date(
                                  company.validatedDate!,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                        {company.status === "rechazada" &&
                          company.rejectionReason && (
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-red-800 text-sm">
                                <strong>Motivo de rechazo:</strong>{" "}
                                {company.rejectionReason}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors">
                        <FiEye className="w-4 h-4" />
                      </button>
                      {company.status === "en_proceso" && (
                        <>
                          <button
                            onClick={() => handleValidateCompany(company.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Validar
                          </button>
                          <button
                            onClick={() => handleRejectCompany(company.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "roles" && (
            <div className="space-y-4">
              {filteredRoles.map((role) => {
                const company = companies.find((c) => c.id === role.companyId);
                return (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <FiUserCheck className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-bold text-gray-900 text-lg">
                              {role.userName}
                            </h4>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              {role.userEmail}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <span className="text-gray-700">
                              <strong>Empresa:</strong> {company?.nombre}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              RUC: {company?.ruc}
                            </span>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div>
                              <strong>Rol actual:</strong>{" "}
                              {getRoleLabel(role.role)}
                            </div>
                            <div>
                              <strong>Rol solicitado:</strong>{" "}
                              {getRoleLabel(role.requestedRole)}
                            </div>
                            <div>
                              <strong>Fecha solicitud:</strong>{" "}
                              {new Date(role.requestDate).toLocaleDateString()}
                            </div>
                          </div>

                          {role.status === "approved" && role.approvedBy && (
                            <div className="mt-2 text-sm text-green-600">
                              Aprobado por {role.approvedBy} el{" "}
                              {new Date(
                                role.approvedDate!,
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(role.status)}`}
                        >
                          {getStatusIcon(role.status)}
                          <span>{getStatusLabel(role.status)}</span>
                        </div>
                        {role.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveRole(role.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRejectRole(role.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty States */}
          {activeTab === "companies" && filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <FiHome className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron empresas
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Aún no hay empresas registradas"}
              </p>
            </div>
          )}

          {activeTab === "roles" && filteredRoles.length === 0 && (
            <div className="text-center py-12">
              <FiUserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron solicitudes
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "No hay solicitudes de rol pendientes"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyManagement;
