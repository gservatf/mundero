import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { AdminSettings } from '../components/AdminSettings';
import UserManagement from '../components/UserManagement';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';
import { StoriesCarousel } from '../components/StoriesCarousel';
// Onboarding System Components
import { OnboardingFeedBanner, OnboardingTasksCard } from '../src/modules/user-panel/onboarding/OnboardingFeedBanner';
import { OnboardingFeedContent } from '../src/modules/user-panel/onboarding/OnboardingFeedContent';
import { useOnboardingProgress } from '../src/modules/user-panel/onboarding/useOnboardingProgress';
import {
  FiUsers,
  FiSettings,
  FiLogOut,
  FiGrid,
  FiMessageCircle,
  FiCamera,
  FiBarChart,
  FiShield,
  FiTrendingUp,
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiAward,
  FiExternalLink
} from 'react-icons/fi';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const navigate = useNavigate();

  // Onboarding System Integration
  const { progress: onboardingProgress, loading: onboardingLoading } = useOnboardingProgress();

  // Determinar si el usuario es Super Admin
  const isSuperAdmin = user?.email === 'admin@mundero.net' || user?.email === 'superadmin@gruposervat.com' || user?.role === 'SUPER_ADMIN';

  // Determinar si el usuario tiene acceso a integraciones profesionales
  const hasIntegrationsAccess = user?.integrations_access && user.integrations_access.length > 0;

  // Determinar si el usuario tiene acceso al panel administrativo
  const hasAdminAccess = user?.role && ['super_admin', 'admin', 'auditor', 'soporte', 'dev'].includes(user.role);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowMobileChat(true);
  };

  const handleBackToChats = () => {
    setSelectedChatId(null);
    setShowMobileChat(false);
  };

  const handleGoToAdminMessages = () => {
    navigate('/admin/messages');
  };

  const logoElement = () => {
    if (settings?.branding?.logoUrl) {
      return (
        <img
          src={settings.branding.logoUrl}
          alt="MUNDERO Logo"
          className="w-10 h-10 object-contain rounded-lg"
        />
      );
    }

    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
        <span className="text-lg font-bold text-white">M</span>
      </div>
    );
  };

  const appTitle = settingsLoading ? 'MUNDERO Hub' : (settings?.general?.title || 'MUNDERO Hub');
  const welcomePhrase = settingsLoading ? 'Conecta. Accede. Evoluciona.' : (settings?.general?.welcomePhrase || 'Conecta. Accede. Evoluciona.');

  // Professional feed content for users with integrations access
  const renderProfessionalFeed = () => {
    if (!hasIntegrationsAccess) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiShield className="w-5 h-5" />
              Feed Profesional
            </CardTitle>
            <CardDescription>
              Accede a contenido profesional exclusivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FiShield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">
                No tienes acceso a integraciones profesionales
              </p>
              <p className="text-sm text-gray-500">
                Contacta al administrador para obtener acceso
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Professional Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5" />
              Actualizaciones Profesionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.integrations_access?.includes('legalty') && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FiShield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Legalty - Nuevos documentos</p>
                      <p className="text-sm text-gray-600">3 contratos pendientes de revisión</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Nuevo</Badge>
                </div>
              )}

              {user?.integrations_access?.includes('we-consulting') && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <FiBarChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">We Consulting - Reporte mensual</p>
                      <p className="text-sm text-gray-600">Análisis de rendimiento disponible</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Próxima reunión</p>
                    <p className="text-sm text-gray-600">Revisión trimestral - Mañana 10:00 AM</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Programado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiAward className="w-5 h-5" />
              Métricas Profesionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FiFileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Documentos</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FiTrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">+24%</p>
                <p className="text-sm text-gray-600">Crecimiento</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <FiCalendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-purple-600">8</p>
                <p className="text-sm text-gray-600">Reuniones</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <FiDollarSign className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold text-orange-600">$45K</p>
                <p className="text-sm text-gray-600">Ingresos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {logoElement()}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{appTitle}</h1>
                <p className="text-sm text-gray-600 hidden sm:block">{welcomePhrase}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-600">Hola,</span>
                <span className="font-medium text-gray-900">
                  {user?.display_name || user?.email?.split('@')[0]}
                </span>
                {hasIntegrationsAccess && (
                  <Badge variant="secondary" className="ml-2">
                    Profesional
                  </Badge>
                )}
                {hasAdminAccess && (
                  <Badge variant="outline" className="ml-2">
                    Admin
                  </Badge>
                )}
              </div>

              {hasAdminAccess && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2"
                >
                  <FiSettings className="w-4 h-4" />
                  <span className="hidden sm:inline">Panel Admin</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <FiCamera className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <FiMessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Mensajes</span>
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center gap-2">
              <FiGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Aplicaciones</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <FiUsers className="w-4 h-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <FiSettings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Onboarding Banner - Solo mostrar si el progreso < 100% */}
              {!onboardingLoading && onboardingProgress && onboardingProgress.completionPercentage < 100 && (
                <OnboardingFeedBanner />
              )}

              {/* Stories Carousel */}
              <StoriesCarousel />

              {/* Feed principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Contenido según el estado del onboarding */}
                  {!onboardingLoading && onboardingProgress && onboardingProgress.completionPercentage < 100 ? (
                    <OnboardingFeedContent />
                  ) : hasIntegrationsAccess ? (
                    renderProfessionalFeed()
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FiBarChart className="w-5 h-5" />
                          Actividad Reciente
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div>
                              <p className="font-medium">Nuevo usuario registrado</p>
                              <p className="text-sm text-gray-600">juan.perez@empresa.com</p>
                            </div>
                            <Badge>Nuevo</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium">Sistema actualizado</p>
                              <p className="text-sm text-gray-600">Nuevas funcionalidades disponibles</p>
                            </div>
                            <Badge variant="secondary">Activo</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Mini Tasks Card de Onboarding */}
                  {!onboardingLoading && onboardingProgress && onboardingProgress.completionPercentage < 100 && (
                    <OnboardingTasksCard />
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Estadísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usuarios activos</span>
                        <span className="font-semibold">142</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aplicaciones</span>
                        <span className="font-semibold">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Integraciones</span>
                        <span className="font-semibold">12</span>
                      </div>
                      {hasIntegrationsAccess && (
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Acceso profesional</span>
                          <Badge className="bg-green-100 text-green-800">Activo</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {hasIntegrationsAccess && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FiShield className="w-5 h-5" />
                          Acceso Profesional
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {user?.integrations_access?.map((integration) => (
                          <div key={integration} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{integration.replace('-', ' ')}</span>
                            <Badge className="bg-blue-100 text-blue-800">Activo</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Admin Messages Access Card */}
              {hasAdminAccess && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <FiShield className="w-5 h-5" />
                      Sistema de Mensajes Administrativo
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                      Accede al sistema completo de mensajes del panel administrativo con funciones avanzadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleGoToAdminMessages}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      Ir a Mensajes Administrativos
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Basic Chat Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Lista de chats - oculta en móvil cuando hay chat seleccionado */}
                <div className={`lg:col-span-1 ${showMobileChat ? 'hidden lg:block' : 'block'}`}>
                  <Card className="h-full">
                    <ChatList
                      onChatSelect={handleChatSelect}
                      selectedChatId={selectedChatId || undefined}
                    />
                  </Card>
                </div>

                {/* Ventana de chat - se muestra en móvil cuando hay chat seleccionado */}
                <div className={`lg:col-span-2 ${!showMobileChat ? 'hidden lg:block' : 'block'}`}>
                  <Card className="h-full">
                    {selectedChatId ? (
                      <ChatWindow
                        chatId={selectedChatId}
                        onBack={handleBackToChats}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <FiMessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>Selecciona una conversación</p>
                          <p className="text-sm">para comenzar a chatear</p>
                          {hasAdminAccess && (
                            <p className="text-sm mt-2 text-blue-600">
                              O usa el <button onClick={handleGoToAdminMessages} className="underline">sistema administrativo</button> para funciones avanzadas
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Apps Tab */}
          <TabsContent value="apps">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <Card className={`hover:shadow-lg transition-shadow ${hasIntegrationsAccess && user?.integrations_access?.includes('legalty') ? 'cursor-pointer' : 'opacity-50'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FiShield className="w-5 h-5 text-white" />
                    </div>
                    Legalty
                    {hasIntegrationsAccess && user?.integrations_access?.includes('legalty') && (
                      <Badge className="bg-green-100 text-green-800 ml-auto">Activo</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Plataforma legal empresarial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    disabled={!hasIntegrationsAccess || !user?.integrations_access?.includes('legalty')}
                  >
                    {hasIntegrationsAccess && user?.integrations_access?.includes('legalty') ? 'Acceder' : 'Sin acceso'}
                  </Button>
                </CardContent>
              </Card>

              <Card className={`hover:shadow-lg transition-shadow ${hasIntegrationsAccess && user?.integrations_access?.includes('we-consulting') ? 'cursor-pointer' : 'opacity-50'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <FiBarChart className="w-5 h-5 text-white" />
                    </div>
                    We Consulting
                    {hasIntegrationsAccess && user?.integrations_access?.includes('we-consulting') && (
                      <Badge className="bg-green-100 text-green-800 ml-auto">Activo</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Consultoría empresarial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    disabled={!hasIntegrationsAccess || !user?.integrations_access?.includes('we-consulting')}
                  >
                    {hasIntegrationsAccess && user?.integrations_access?.includes('we-consulting') ? 'Acceder' : 'Sin acceso'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                      <FiGrid className="w-5 h-5 text-white" />
                    </div>
                    Más aplicaciones
                  </CardTitle>
                  <CardDescription>
                    Próximamente disponibles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full" disabled>
                    Próximamente
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UserManagement />
            </motion.div>
          </TabsContent>

          {/* Admin Tab - Solo para Super Admins */}
          {isSuperAdmin && (
            <TabsContent value="admin">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AdminSettings />
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};