import React, { useEffect, useState } from "react";
import AuthFlow from "../../../components/AuthFlow";
import { useQuizStore } from "../state/useQuizStore";

export const SolutionGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { clearSession } = useQuizStore();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Get current user from localStorage or context
        const currentUser = localStorage.getItem("currentUser");

        if (!currentUser) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const user = JSON.parse(currentUser);

        // Check if user has org_solutions permission
        const hasOrgSolutions =
          user.permissions?.includes("org_solutions") ||
          user.role === "admin" ||
          user.role === "super_admin";

        if (!hasOrgSolutions) {
          // Clear any existing CEPS session if no access
          clearSession();
        }

        setHasAccess(hasOrgSolutions);
      } catch (error) {
        console.error("Error checking CEPS access:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [clearSession]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso Restringido
            </h2>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder a la Solución CEPS. Esta
              herramienta requiere permisos organizacionales especiales.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>¿Necesitas acceso?</strong>
                    <br />
                    Contacta a tu administrador para solicitar permisos de
                    "org_solutions".
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <AuthFlow />;
  }

  return <>{children}</>;
};
