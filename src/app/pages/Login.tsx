import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router';
import { Eye, EyeOff, KeyRound, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../auth/auth';
import { BRAND_NAME } from '../config/brand';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BrandTile } from '../components/BrandTile';

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

  const handleAutofill = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 p-6">
      <div className="flex flex-col items-center gap-2.5">
        <BrandTile size="lg" />
        <p className="font-display text-[22px] font-extrabold tracking-[-0.01em]">{BRAND_NAME}</p>
        <p className="text-[13px] text-muted-foreground">Gestión de laboratorio dental</p>
      </div>

      <div className="w-full max-w-[400px] rounded-[20px] border border-border bg-card p-6 shadow-[0_1px_2px_oklch(22%_0.02_250/0.04),0_12px_28px_oklch(22%_0.02_250/0.09)]">
        <h1 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">
          Bienvenido de nuevo
        </h1>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Ingresá con tu cuenta para gestionar los trabajos del laboratorio.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Correo electrónico</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="ej: operador@lab-cv.com"
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
        </form>

        <div className="mt-5 rounded-[14px] border border-border bg-muted p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                <KeyRound className="size-3.5" />
                Acceso demo
              </p>
              <p className="mt-1 text-[12.5px] text-foreground">
                {DEMO_EMAIL}
                <span className="mx-1 text-muted-foreground">·</span>
                {DEMO_PASSWORD}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAutofill}>
              Autocompletar
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
