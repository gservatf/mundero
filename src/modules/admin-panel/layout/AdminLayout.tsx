import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth, AdminPermissions } from "../hooks/useAdminAuth";
import { Button } from "../../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import {
  FiHome,
  FiUsers,
  FiGrid,
  FiUserCheck,
  FiTarget,
  FiShield,
  FiSettings,
  FiBell,
  FiBarChart,
  FiMenu,
  FiX,
  FiLogOut,
  FiSun,
  FiMoon,
  FiMessageCircle,
} from "react-icons/fi";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, adminRole, canAccess, hasAccess } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiShield className="mx-auto h-12 w-12 text-gray-400" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Acceso Denegado
          </h1>
          <p className="mt-2 text-gray-600">
            No tienes permisos para acceder al panel administrativo.
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: FiHome,
      section: "dashboard" as keyof AdminPermissions,
    },
    {
      name: "Mensajes",
      href: "/admin/messages",
      icon: FiMessageCircle,
      section: "messages" as keyof AdminPermissions,
    },
    {
      name: "Usuarios y Roles",
      href: "/admin/users",
      icon: FiUsers,
      section: "users" as keyof AdminPermissions,
    },
    {
      name: "Empresas",
      href: "/admin/companies",
      icon: FiGrid,
      section: "companies" as keyof AdminPermissions,
    },
    {
      name: "API Manager",
      href: "/admin/apps",
      icon: FiGrid,
      section: "apps" as keyof AdminPermissions,
    },
    {
      name: "Referidos",
      href: "/admin/referrals",
      icon: FiUserCheck,
      section: "referrals" as keyof AdminPermissions,
    },
    {
      name: "Leads CRM",
      href: "/admin/leads",
      icon: FiTarget,
      section: "leads" as keyof AdminPermissions,
    },
    {
      name: "Seguridad",
      href: "/admin/security",
      icon: FiShield,
      section: "security" as keyof AdminPermissions,
    },
    {
      name: "Configuración",
      href: "/admin/config",
      icon: FiSettings,
      section: "config" as keyof AdminPermissions,
    },
    {
      name: "Notificaciones",
      href: "/admin/notifications",
      icon: FiBell,
      section: "notifications" as keyof AdminPermissions,
    },
    {
      name: "Analítica",
      href: "/admin/analytics",
      icon: FiBarChart,
      section: "analytics" as keyof AdminPermissions,
    },
  ].filter((item) => canAccess(item.section));

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: "bg-red-100 text-red-800",
      admin: "bg-blue-100 text-blue-800",
      auditor: "bg-yellow-100 text-yellow-800",
      soporte: "bg-green-100 text-green-800",
      dev: "bg-purple-100 text-purple-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <img
                src="/mundero-logo.png"
                alt="MUNDERO"
                className="h-8 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzM5OGVmNCIvPgo8dGV4dCB4PSIxNiIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NPC90ZXh0Pgo8L3N2Zz4K";
                }}
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Admin
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <FiX className="h-6 w-6" />
            </Button>
          </div>

          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User info at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photo_url} />
                <AvatarFallback>
                  {user?.display_name?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "A"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.display_name || user?.email}
                </p>
                <Badge
                  className={`text-xs ${getRoleBadgeColor(adminRole || "")}`}
                >
                  {adminRole}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <FiMenu className="h-6 w-6" />
                </Button>
                <h1 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white lg:ml-0">
                  Panel Administrativo MUNDERO
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? (
                    <FiSun className="h-5 w-5" />
                  ) : (
                    <FiMoon className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Implementar logout
                    navigate("/");
                  }}
                >
                  <FiLogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
