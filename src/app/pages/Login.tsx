import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router';
import { Eye, EyeOff, KeyRound, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { ADMIN_EMAIL, ADMIN_PASSWORD, DEMO_EMAIL, DEMO_PASSWORD } from '../auth/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthLayout } from '../components/AuthLayout';

export function Login() {
  const { status, login } = useAuth();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!credential.trim() || !password) {
      setError('Por favor complete todos los campos');
      toast.error('Por favor complete todos los campos');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(credential, password);
    } catch {
      setError('Credenciales inválidas');
      toast.error('Credenciales inválidas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutofill = (demoEmail: string, demoPassword: string) => {
    setCredential(demoEmail);
    setPassword(demoPassword);
    setError(null);
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

      <div className="mt-5 rounded-[14px] border border-border bg-muted p-3.5">
        <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          <KeyRound className="size-3.5" />
          Cuentas demo
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-foreground">Operador</p>
              <p className="truncate text-[12px] text-muted-foreground">
                {DEMO_EMAIL}
                <span className="mx-1">·</span>
                {DEMO_PASSWORD}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAutofill(DEMO_EMAIL, DEMO_PASSWORD)}
            >
              Autocompletar
            </Button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-foreground">Administrador</p>
              <p className="truncate text-[12px] text-muted-foreground">
                {ADMIN_EMAIL}
                <span className="mx-1">·</span>
                {ADMIN_PASSWORD}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAutofill(ADMIN_EMAIL, ADMIN_PASSWORD)}
            >
              Autocompletar
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
