import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { AppGrid } from "@/components/AppGrid";
import { ProfileCard } from "@/components/ProfileCard";
import { useAuth } from "@/hooks/useAuth";
import { Users, Grid3X3, Settings, LogOut, Bell, Search } from "lucide-react";

export function Home() {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("apps");

  const handleLogout = async () => {
    await logout();
  };

  const userRoles = profile?.skills || ["user", "employee"]; // Using skills as roles for demo

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MUNDERO</h1>
                  <span className="text-xs text-gray-500 font-medium">
                    v1.1 • Grupo Servat
                  </span>
                </div>
              </div>

              {/* Quick Search */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar aplicaciones..."
                  className="bg-transparent text-sm outline-none w-48"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>

              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRoles.join(", ")}
                  </p>
                </div>
                <img
                  src={
                    user?.photoURL ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`
                  }
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)]">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido de vuelta,{" "}
            {user?.displayName?.split(" ")[0] || "Usuario"}
          </h2>
          <p className="text-gray-600 text-lg">
            Tu red profesional y portal universal de aplicaciones está listo
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-1">
            <TabsTrigger
              value="apps"
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="font-medium">Aplicaciones</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3"
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Mi Perfil</span>
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg py-3"
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">Administración</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apps" className="space-y-6 min-h-[600px]">
            <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Panel de Aplicaciones
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      Accede a todas tus herramientas de trabajo
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Sistema activo</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AppGrid userRoles={userRoles} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 min-h-[600px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProfileCard
                profile={profile || undefined}
                isOwnProfile={true}
                onEdit={() => console.log("Edit profile")}
              />

              <div className="space-y-6">
                <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      Estadísticas del Usuario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">
                          4
                        </div>
                        <div className="text-sm text-gray-600">
                          Apps Disponibles
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">
                          {userRoles.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Roles Activos
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Último acceso
                        </span>
                        <span className="font-semibold text-green-600">
                          Ahora
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Sesiones esta semana
                        </span>
                        <span className="font-semibold">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Apps más usada
                        </span>
                        <span className="font-semibold">LEGALITY360°</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          app: "LEGALITY360°",
                          action: "Revisión de contratos",
                          time: "Hace 2 horas",
                        },
                        {
                          app: "SERVAT Portal",
                          action: "Actualización de perfil",
                          time: "Ayer",
                        },
                        {
                          app: "Analytics",
                          action: "Consulta de reportes",
                          time: "Hace 3 días",
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {activity.app}
                            </p>
                            <p className="text-sm text-gray-600">
                              {activity.action}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {activity.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6 min-h-[600px]">
            <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Panel de Administración
                </CardTitle>
                <p className="text-gray-600">
                  Gestiona usuarios, roles y configuraciones del sistema
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Gestión de Usuarios",
                      desc: "Administrar cuentas y permisos",
                      icon: Users,
                      color: "blue",
                    },
                    {
                      title: "Configuración de Apps",
                      desc: "Configurar aplicaciones disponibles",
                      icon: Grid3X3,
                      color: "green",
                    },
                    {
                      title: "Roles y Permisos",
                      desc: "Definir niveles de acceso",
                      icon: Settings,
                      color: "purple",
                    },
                  ].map((item, index) => (
                    <Card
                      key={index}
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-white to-gray-50"
                    >
                      <div
                        className={`w-12 h-12 bg-${item.color}-100 rounded-lg flex items-center justify-center mb-4`}
                      >
                        <item.icon
                          className={`w-6 h-6 text-${item.color}-600`}
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{item.desc}</p>
                      <Button disabled variant="outline" className="w-full">
                        Próximamente
                      </Button>
                    </Card>
                  ))}
                </div>

                <div className="mt-8 text-center py-8 bg-gray-50 rounded-xl">
                  <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Funciones Administrativas
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    Las herramientas de administración estarán disponibles en la
                    próxima versión. Contacta al equipo técnico para
                    configuraciones avanzadas.
                  </p>
                  <Button disabled className="bg-gray-300">
                    Acceso Restringido
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
