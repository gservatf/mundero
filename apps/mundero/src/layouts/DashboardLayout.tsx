import { Outlet, Link, useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-bold text-blue-600 text-lg">
            MUNDERO Hub
          </Link>
          <nav className="flex gap-6 text-sm text-gray-700">
            <Link
              to="/"
              className={location.pathname === "/" ? "font-semibold text-blue-600" : ""}
            >
              Feed
            </Link>
            <Link
              to="/messages"
              className={location.pathname === "/messages" ? "font-semibold text-blue-600" : ""}
            >
              Mensajes
            </Link>
            <Link
              to="/apps"
              className={location.pathname === "/apps" ? "font-semibold text-blue-600" : ""}
            >
              Aplicaciones
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Hola, <b>Gabriel Servat</b></span>
          <button className="border px-3 py-1 rounded-md hover:bg-gray-100">Cerrar sesión</button>
        </div>
      </header>

      {/* 👇 Aquí renderiza las páginas hijas */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}