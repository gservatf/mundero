import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { ExternalLink, Settings, Loader2, Grid3X3 } from 'lucide-react'
// import { collection, getDocs, orderBy, query, getFirestore } from 'firebase/firestore'
// import { app } from '../core/firebase/firebaseClient'
import { App } from '@/types'

// const db = getFirestore(app)

interface AppGridProps {
  userRoles?: string[]
}

const LoadingCard = () => (
  <Card className="animate-pulse">
    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
      <div className="flex items-center space-x-3 flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    </CardContent>
  </Card>
)

export function AppGrid({ userRoles = ['user'] }: AppGridProps) {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApps()
  }, [])

  const loadApps = async () => {
    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Skip Firestore for now - use fallback data
      console.log('📱 Using demo apps data (Firestore temporarily disabled)')
      
      setApps([
        {
          id: '1',
          name: 'LEGALITY360°',
          identifier: 'legality360',
          description: 'Sistema integral de gestión legal y compliance. Administra contratos, documentos legales y procesos de cumplimiento normativo.',
          icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=legality&backgroundColor=3b82f6',
          app_url: 'https://legality360.servat.com',
          roles: ['admin', 'legal', 'user'],
          version: '2.1.0',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'SERVAT Portal',
          identifier: 'servat-portal',
          description: 'Portal corporativo del Grupo Servat. Accede a recursos humanos, noticias corporativas y herramientas de colaboración.',
          icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=servat&backgroundColor=10b981',
          app_url: 'https://portal.servat.com',
          roles: ['admin', 'employee', 'user'],
          version: '1.5.2',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Analytics Dashboard',
          identifier: 'analytics',
          description: 'Dashboard de análisis y métricas empresariales. Visualiza KPIs, reportes financieros y tendencias de negocio.',
          icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=analytics&backgroundColor=8b5cf6',
          app_url: 'https://analytics.servat.com',
          roles: ['admin', 'analyst'],
          version: '1.2.1',
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Project Manager',
          identifier: 'projects',
          description: 'Gestión de proyectos y tareas. Organiza equipos, asigna recursos y da seguimiento a los objetivos corporativos.',
          icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=projects&backgroundColor=f59e0b',
          app_url: 'https://projects.servat.com',
          roles: ['admin', 'manager', 'user'],
          version: '3.0.1',
          created_at: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Error loading apps:', error)
      // Use demo data as fallback
      setApps([])
    } finally {
      setLoading(false)
    }
  }

  const hasAccess = (app: App) => {
    return userRoles.some(role => app.roles.includes(role)) || userRoles.includes('admin')
  }

  if (loading) {
    return (
      <div className="min-h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[400px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Aplicaciones Disponibles</h3>
          <p className="text-sm text-gray-600">
            {apps.filter(hasAccess).length} de {apps.length} aplicaciones accesibles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <Card key={app.id} className={`transition-all hover:shadow-xl hover:scale-105 duration-200 ${!hasAccess(app) ? 'opacity-60 grayscale' : 'bg-gradient-to-br from-white to-gray-50'}`}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-3">
              <div className="flex items-center space-x-3 flex-1">
                <img
                  src={app.icon_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${app.name}`}
                  alt={app.name}
                  className="w-12 h-12 rounded-xl shadow-md"
                />
                <div>
                  <CardTitle className="text-lg font-bold">{app.name}</CardTitle>
                  <p className="text-sm text-gray-500 font-medium">v{app.version}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="opacity-60 hover:opacity-100">
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">{app.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {app.roles.map((role) => (
                  <span
                    key={role}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      userRoles.includes(role) || userRoles.includes('admin')
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {role}
                  </span>
                ))}
              </div>

              <Button
                className={`w-full font-medium transition-all duration-200 ${
                  hasAccess(app) 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                disabled={!hasAccess(app)}
                onClick={() => hasAccess(app) && window.open(app.app_url, '_blank')}
              >
                {hasAccess(app) ? (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Aplicación
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 mr-2" />
                    Sin Acceso
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {apps.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Grid3X3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay aplicaciones disponibles</h3>
          <p className="text-gray-600">Contacta al administrador para obtener acceso</p>
        </div>
      )}
    </div>
  )
}