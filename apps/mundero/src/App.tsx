import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { useAuth } from "@/hooks/useAuth";
import MessagesPage from "@/modules/chat/pages/Messages";
import DashboardLayout from "@/layouts/DashboardLayout";
import "./App.css";

function App() {
  const { isAuthenticated, loading } = useAuth();

  console.log("🎯 App render state:", { isAuthenticated, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-6 max-w-sm mx-auto px-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">MUNDERO Hub</h2>
            <p className="text-gray-600 text-lg">
              Inicializando tu red profesional...
            </p>
            <div className="text-sm text-gray-500">
              v1.1 • Firebase v3 • Grupo Servat
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-blue-600 font-medium">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <Router>
        <Routes>
          {/* Ruta de login */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />

          {/* Rutas protegidas con layout */}
          {isAuthenticated ? (
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/messages" element={<MessagesPage />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
