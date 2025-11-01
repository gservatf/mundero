import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiCheck,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useMockAuth } from "../hooks/useMockData";
import toast from "react-hot-toast";

interface AuthFlowProps {
  onAuthSuccess?: (user: any) => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthSuccess }) => {
  const { login } = useMockAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Simulated user test data
  const testUsers = [
    {
      email: "admin@mundero.net",
      password: "admin123",
      role: "admin",
      displayName: "Administrador MUNDERO",
      photoURL:
        "https://ui-avatars.com/api/?name=Admin+MUNDERO&background=3b82f6&color=fff",
    },
    {
      email: "user@mundero.net",
      password: "user123",
      role: "user",
      displayName: "Usuario Demo",
      photoURL:
        "https://ui-avatars.com/api/?name=Usuario+Demo&background=10b981&color=fff",
    },
    {
      email: "empresa@mundero.net",
      password: "empresa123",
      role: "company",
      displayName: "Empresa Demo",
      photoURL:
        "https://ui-avatars.com/api/?name=Empresa+Demo&background=8b5cf6&color=fff",
    },
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = "El nombre es requerido";
      }
      if (!formData.lastName) {
        newErrors.lastName = "El apellido es requerido";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (isLogin) {
        // Check test users for login
        const testUser = testUsers.find(
          (user) =>
            user.email === formData.email &&
            user.password === formData.password,
        );

        if (testUser) {
          const mockUser = {
            uid: `test-${testUser.role}`,
            email: testUser.email,
            displayName: testUser.displayName,
            photoURL: testUser.photoURL,
            role: testUser.role,
            rol: testUser.role, // Adding rol property to match interface
            emailVerified: true,
            empresa: {
              id: `empresa-${testUser.role}`,
              nombre:
                testUser.role === "admin"
                  ? "MUNDERO Admin"
                  : "Empresa Demo S.A.C.",
              ruc: testUser.role === "admin" ? "20000000001" : "20123456789",
            },
          };

          login(mockUser);
          toast.success(`¡Bienvenido ${testUser.displayName}!`);

          if (onAuthSuccess) {
            onAuthSuccess(mockUser);
          }
        } else {
          toast.error("Credenciales incorrectas. Usa los usuarios de prueba.");
        }
      } else {
        // Registration simulation
        const newUser = {
          uid: `test-${Date.now()}`,
          email: formData.email,
          displayName: `${formData.firstName} ${formData.lastName}`,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName + " " + formData.lastName)}&background=6366f1&color=fff`,
          role: "user",
          rol: "user", // Adding rol property to match interface
          emailVerified: false,
          empresa: {
            id: `empresa-${Date.now()}`,
            nombre: "Nueva Empresa",
            ruc: "20000000000",
          },
        };

        login(newUser);
        toast.success("¡Cuenta creada exitosamente!");

        if (onAuthSuccess) {
          onAuthSuccess(newUser);
        }
      }
    } catch (error) {
      toast.error("Error en la autenticación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);

    try {
      // Simulate Google OAuth delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful Google authentication
      const googleUser = {
        uid: "google-test-user",
        email: "usuario@gmail.com",
        displayName: "Usuario Google",
        photoURL:
          "https://ui-avatars.com/api/?name=Usuario+Google&background=ea4335&color=fff",
        role: "user",
        rol: "user", // Adding rol property to match interface
        emailVerified: true,
        provider: "google",
        empresa: {
          id: "empresa-google",
          nombre: "Google User Company",
          ruc: "20123456789",
        },
      };

      login(googleUser);
      toast.success("¡Autenticación con Google exitosa!");

      if (onAuthSuccess) {
        onAuthSuccess(googleUser);
      }
    } catch (error) {
      toast.error("Error en la autenticación con Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            MUNDERO
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? "Inicia sesión en tu cuenta" : "Crea tu cuenta nueva"}
          </p>
        </div>

        {/* Auth Form */}
        <motion.div
          layout
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8"
        >
          {/* Test Users Guide */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">
              👥 Usuarios de Prueba:
            </h4>
            <div className="space-y-1 text-sm text-blue-800">
              <div>
                <strong>Admin:</strong> admin@mundero.net / admin123
              </div>
              <div>
                <strong>Usuario:</strong> user@mundero.net / user123
              </div>
              <div>
                <strong>Empresa:</strong> empresa@mundero.net / empresa123
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Registration Fields */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Tu nombre"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Tu apellido"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full pl-12 pr-12 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirma tu contraseña"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </motion.div>
            )}

            {/* Terms and Conditions */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start space-x-3"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={(e) =>
                      handleInputChange("acceptTerms", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <label
                    htmlFor="acceptTerms"
                    className={`flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-colors ${
                      formData.acceptTerms
                        ? "bg-blue-600 border-blue-600"
                        : errors.acceptTerms
                          ? "border-red-500"
                          : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {formData.acceptTerms && (
                      <FiCheck className="w-3 h-3 text-white" />
                    )}
                  </label>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">
                    Acepto los{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      términos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      política de privacidad
                    </a>
                  </span>
                  {errors.acceptTerms && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {isLogin ? "Iniciando sesión..." : "Creando cuenta..."}
                  </span>
                </div>
              ) : isLogin ? (
                "Iniciar Sesión"
              ) : (
                "Crear Cuenta"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Google Auth */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 px-4 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Google</span>
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 MUNDERO. Todos los derechos reservados.</p>
          <p className="mt-1">
            Conectando profesionales y empresas en el ecosistema digital
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthFlow;
