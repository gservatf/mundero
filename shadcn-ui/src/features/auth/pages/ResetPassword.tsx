import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/core/firebase/firebaseClient';
import { useHybridAuth } from '@/features/auth/hooks/useHybridAuth';

export default function ResetPassword() {
  const { isLoading, error, clearError } = useHybridAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResetError('');

    if (!email) {
      setResetError('Por favor ingresa tu email');
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getAuth(firebaseApp);
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setResetError(getErrorMessage(err.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No se encontró una cuenta con este email';
      case 'auth/invalid-email':
        return 'El formato del email no es válido';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      default:
        return 'Error al enviar el email de recuperación';
    }
  };

  const displayError = error || resetError;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20" />
        
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl relative z-10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Email Enviado</CardTitle>
            <CardDescription className="text-purple-100">
              Revisa tu bandeja de entrada
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-purple-200 mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
            
            <div className="space-y-3">
              <Link to="/login">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium">
                  Volver al Login
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                className="w-full text-purple-300 hover:text-white hover:bg-white/10"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
              >
                Enviar a otro email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" />
      
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-purple-100">
            Ingresa tu email para recibir un enlace de recuperación
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <Alert className="bg-red-500/20 border-red-400/30 text-red-100">
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-100">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                placeholder="tu@email.com"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Enlace de Recuperación'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-purple-200 text-sm">
              ¿Recordaste tu contraseña?{' '}
              <Link 
                to="/login" 
                className="text-purple-300 hover:text-white font-medium underline underline-offset-4"
              >
                Inicia sesión
              </Link>
            </p>
            <p className="text-purple-200 text-sm">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/register" 
                className="text-purple-300 hover:text-white font-medium underline underline-offset-4"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}