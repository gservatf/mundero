import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, Briefcase, Shield } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoadingAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">MUNDERO</h1>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            MUNDERO
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Red profesional y portal de aplicaciones del Grupo Servat
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Acceder
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Red Profesional</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Conecta con profesionales del Grupo Servat y expande tu red de contactos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Briefcase className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Portal de Apps</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Accede a todas las herramientas y aplicaciones corporativas desde un solo lugar.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-white">Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Autenticación segura con Google SSO y gestión avanzada de permisos.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;