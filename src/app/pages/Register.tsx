import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { EMAIL_RE, isStrongPassword } from '../api/mock';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthLayout } from '../components/AuthLayout';

export function Register() {
  const navigate = useNavigate();
  const { status, register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!username.trim() || !email.trim() || !password || !confirm) {
      setError('Por favor complete todos los campos');
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (username.trim().length < 3 || username.trim().length > 30) {
      setError('El nombre de usuario debe tener entre 3 y 30 caracteres');
      toast.error('El nombre de usuario debe tener entre 3 y 30 caracteres');
      return;
    }

    if (!EMAIL_RE.test(email.trim())) {
      setError('Ingresá un correo válido');
      toast.error('Ingresá un correo válido');
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        'La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo',
      );
      toast.error(
        'La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo',
      );
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
      await register({ email: email.trim(), username: username.trim(), password });
      toast.success('Cuenta creada. ¡Bienvenido/a!');
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos crear la cuenta';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      footer={
        <>
          <span>¿Ya tenés cuenta?</span>
          <Button variant="link" size="sm" asChild className="h-auto px-0.5">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </>
      }
    >
      <h1 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">Crear cuenta</h1>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">
        Registrate para gestionar los trabajos del laboratorio.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="rg-username">Nombre de usuario</Label>
          <Input
            id="rg-username"
            type="text"
            placeholder="Ej: carla_diaz"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rg-email">Correo electrónico</Label>
          <Input
            id="rg-email"
            type="email"
            placeholder="ej: carla@lab-cv.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rg-pass">Contraseña</Label>
          <Input
            id="rg-pass"
            type="password"
            placeholder="Mínimo 8 caracteres, con mayúscula y símbolo"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rg-confirm">Repetir contraseña</Label>
          <Input
            id="rg-confirm"
            type="password"
            placeholder="Repetí tu contraseña"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!!error}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          <UserPlus className="size-4" />
          {submitting ? 'Registrando…' : 'Registrarme'}
        </Button>
      </form>
    </AuthLayout>
  );
}
