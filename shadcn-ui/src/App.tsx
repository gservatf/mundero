import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';
import LoadingScreen from '@/components/LoadingScreen';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';
import ResetPassword from '@/features/auth/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isLoadingAuth, isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoadingAuth) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <div className="min-h-screen overflow-y-auto">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} 
              />
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
              />
              <Route 
                path="/register" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
              />
              <Route 
                path="/reset-password" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />} 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard/*" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
              />
              
              {/* Catch all route */}
              <Route 
                path="*" 
                element={<NotFound />} 
              />
            </Routes>
          </div>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;