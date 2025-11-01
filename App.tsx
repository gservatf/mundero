import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { GoogleOnlyAuth } from "./components/GoogleOnlyAuth";
import { Dashboard } from "./pages/Dashboard";
import { FunnelPage } from "./src/pages/FunnelPage";
import { LandingPage } from "./src/modules/landing";
import { AdminLayout } from "./src/modules/admin-panel/layout/AdminLayout";
import { AdminDashboard } from "./src/modules/admin-panel/pages/AdminDashboard";
import { AdminUsers } from "./src/modules/admin-panel/pages/AdminUsers";
import { AdminCompanies } from "./src/modules/admin-panel/pages/AdminCompanies";
import { AdminMessages } from "./src/modules/admin-panel/pages/AdminMessages";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg">Cargando MUNDERO Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" replace /> : <LandingPage />
            }
          />
          <Route
            path="/auth"
            element={
              user ? <Navigate to="/dashboard" replace /> : <GoogleOnlyAuth />
            }
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" replace />}
          />

          {/* Admin Panel Routes */}
          <Route
            path="/admin"
            element={user ? <AdminLayout /> : <Navigate to="/" replace />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>

          {/* Funnel Public Routes - Organization/Funnel slug pattern */}
          <Route path="/:orgSlug/:funnelSlug" element={<FunnelPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
