import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../auth/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function Login() {
  const { status, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError('Por favor complete todos los campos');
      toast.error('Por favor complete todos los campos');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
    } catch {
      setError('Correo o contraseña incorrectos');
      toast.error('Correo o contraseña incorrectos');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-sm p-8 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-center">Ryes</h1>
        <p className="text-sm text-muted-foreground text-center mt-1.5">
          Accedé a la gestión de tu laboratorio
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Correo electrónico</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="ej: operador@ryes.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Contraseña</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-5 pt-4 border-t border-border">
          Acceso demo: {DEMO_EMAIL} · {DEMO_PASSWORD}
        </p>
      </div>
    </main>
  );
}
