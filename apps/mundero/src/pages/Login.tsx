import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Chrome, Loader2 } from 'lucide-react'

export function Login() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await login()
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <CardTitle className="text-2xl font-bold">MUNDERO</CardTitle>
          <p className="text-muted-foreground">
            Red profesional y portal de apps del Grupo Servat
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Chrome className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Utiliza tu cuenta de Google para acceder</p>
            <p className="mt-2">LEGALITY360° • SERVAT Portal • Más apps</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}