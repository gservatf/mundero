import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ExternalLink, Lock, Clock, CheckCircle, Grid3X3, XCircle, AlertCircle } from 'lucide-react';
import { mockApps, MockAppStatus } from '../mockData';

interface AppGridProps {
  className?: string;
}

const AppGrid = ({ className }: AppGridProps) => {
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [apps, setApps] = useState(mockApps);

  const handleRequestAccess = async () => {
    if (!selectedApp) return;

    // Simulate request submission
    setApps(prevApps => 
      prevApps.map(app => 
        app.id === selectedApp.id 
          ? { ...app, access_status: 'pending' as MockAppStatus }
          : app
      )
    );

    setIsRequestDialogOpen(false);
    setRequestMessage('');
    setSelectedApp(null);
  };

  const getAppIcon = (iconUrl: string, appName: string) => {
    // Create gradient based on app name for consistent colors
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600', 
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-teal-500 to-cyan-600'
    ];
    const gradientIndex = appName.length % gradients.length;
    
    return (
      <div className={`w-12 h-12 bg-gradient-to-br ${gradients[gradientIndex]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
        {appName.charAt(0)}
      </div>
    );
  };

  const getAppStatus = (app: any) => {
    switch (app.access_status) {
      case 'granted':
        return {
          status: 'granted',
          label: app.user_role ? `Acceso: ${app.user_role}` : 'Acceso concedido',
          color: 'bg-green-500',
          badgeVariant: 'default' as const,
          icon: CheckCircle
        };
      case 'pending':
        return {
          status: 'pending',
          label: 'Solicitud pendiente',
          color: 'bg-yellow-500',
          badgeVariant: 'secondary' as const,
          icon: Clock
        };
      case 'denied':
        return {
          status: 'denied',
          label: 'Acceso denegado',
          color: 'bg-red-500',
          badgeVariant: 'destructive' as const,
          icon: XCircle
        };
      default:
        return {
          status: 'no-access',
          label: 'Sin acceso',
          color: 'bg-gray-500',
          badgeVariant: 'outline' as const,
          icon: Lock
        };
    }
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Grid3X3 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Aplicaciones MUNDERO</h2>
        </div>
        <p className="text-muted-foreground">
          Accede a todas las aplicaciones del Grupo Servat desde un solo lugar
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {apps.map((app) => {
          const status = getAppStatus(app);
          const StatusIcon = status.icon;

          return (
            <Card 
              key={app.id} 
              className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 hover:border-primary/20"
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-3">
                  {/* App Icon with Status Indicator */}
                  <div className="relative">
                    {getAppIcon(app.icon_url, app.name)}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${status.color} rounded-full flex items-center justify-center border-2 border-white shadow-sm`}>
                      <StatusIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  {/* App Name */}
                  <div className="text-center min-h-[3rem] flex flex-col justify-center">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {app.name}
                    </h3>
                    <Badge variant={status.badgeVariant} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>

                  {/* App Description */}
                  <p className="text-xs text-muted-foreground text-center line-clamp-2 min-h-[2rem]">
                    {app.description}
                  </p>

                  {/* Action Button */}
                  <div className="w-full">
                    {app.access_status === 'granted' ? (
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                        asChild
                      >
                        <a 
                          href={app.app_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Abrir
                        </a>
                      </Button>
                    ) : app.access_status === 'pending' ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50" 
                        disabled
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                      </Button>
                    ) : app.access_status === 'denied' ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full border-red-500 text-red-600 hover:bg-red-50"
                        disabled
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Denegado
                      </Button>
                    ) : (
                      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                            onClick={() => setSelectedApp(app)}
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            Solicitar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getAppIcon(selectedApp?.icon_url || '', selectedApp?.name || '')}
                              Solicitar acceso a {selectedApp?.name}
                            </DialogTitle>
                            <DialogDescription>
                              {selectedApp?.description}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="message">Mensaje (opcional)</Label>
                              <Textarea
                                id="message"
                                placeholder="Explica por qué necesitas acceso a esta aplicación..."
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                                className="mt-1"
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setIsRequestDialogOpen(false);
                                  setRequestMessage('');
                                  setSelectedApp(null);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button 
                                onClick={handleRequestAccess}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                              >
                                Enviar solicitud
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Con acceso</p>
              <p className="text-2xl font-bold text-green-600">
                {apps.filter(app => app.access_status === 'granted').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {apps.filter(app => app.access_status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Sin acceso</p>
              <p className="text-2xl font-bold text-gray-600">
                {apps.filter(app => app.access_status === 'no-access').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Total apps</p>
              <p className="text-2xl font-bold text-blue-600">{apps.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppGrid;