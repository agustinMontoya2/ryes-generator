import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { resetPassword } from '../api/mock';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthLayout } from '../components/AuthLayout';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!password || !confirm) {
      setError('Por favor complete todos los campos');
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await resetPassword({ token, password });
      toast.success('Contraseña actualizada');
      navigate('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos actualizar la contraseña';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      footer={
        <Button variant="link" size="sm" asChild className="h-auto px-0.5">
          <Link to="/login">Volver al inicio de sesión</Link>
        </Button>
      }
    >
      <h1 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">
        Restablecer contraseña
      </h1>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">
        Elegí una nueva contraseña para tu cuenta.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="pw-new">Nueva contraseña</Label>
          <Input
            id="pw-new"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pw-confirm">Repetir nueva contraseña</Label>
          <Input
            id="pw-confirm"
            type="password"
            placeholder="Repetí la nueva contraseña"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!!error}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          <KeyRound className="size-4" />
          {submitting ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
      </form>
    </AuthLayout>
  );
}
