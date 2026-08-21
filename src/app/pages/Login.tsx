import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthLayout } from '../components/AuthLayout';

function getRedirectPath(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const from = (state as { from?: unknown }).from;
    if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
      return from;
    }
  }
  return '/';
}

export function Login() {
  const { status, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = getRedirectPath(location.state);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError(null);

    if (!credential.trim() || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setSubmitting(true);

    try {
      await login(credential, password);
      navigate(redirectTo, { replace: true });
    } catch {
      setError('Credenciales inválidas');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      footer={
        <>
          <span>¿No tenés cuenta?</span>
          <Button variant="link" size="sm" asChild className="h-auto px-0.5">
            <Link to="/register">Crear cuenta</Link>
          </Button>
        </>
      }
    >
      <h1 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">
        Bienvenido de nuevo
      </h1>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">
        Ingresá con tu cuenta para gestionar los trabajos del laboratorio.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="login-credential">Email o usuario</Label>
          <Input
            id="login-credential"
            type="text"
            placeholder="ej: operador@lab-cv.com o operador"
            autoComplete="username"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
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
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          <LogIn className="size-4" />
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </Button>

        <div className="flex justify-center">
          <Button type="button" variant="link" size="sm" asChild className="h-auto px-0.5">
            <Link to="/forgot">¿Olvidaste tu contraseña?</Link>
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
