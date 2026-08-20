import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { CircleCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_RESET_TOKEN, forgotPassword } from '../api/mock';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AuthLayout } from '../components/AuthLayout';

export function ForgotPassword() {
  const [credential, setCredential] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!credential.trim()) {
      setError('Ingresá tu email o usuario');
      toast.error('Ingresá tu email o usuario');
      return;
    }

    setSubmitting(true);
    setError(null);

    await forgotPassword({ credential: credential.trim() });
    setSentTo(credential.trim());
    setSubmitting(false);
  };

  return (
    <AuthLayout
      footer={
        sentTo ? undefined : (
          <Button variant="link" size="sm" asChild className="h-auto px-0.5">
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        )
      }
    >
      {sentTo ? (
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-[16px] bg-[oklch(92%_0.08_155)] text-[oklch(32%_0.1_155)]">
            <CircleCheck className="size-7" />
          </div>
          <h1 className="mt-4 font-display text-[22px] font-extrabold tracking-[-0.02em]">
            Enlace enviado
          </h1>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">
            Si la cuenta <b className="text-foreground">{sentTo}</b> existe, enviamos un enlace a tu
            correo para restablecer la contraseña.
          </p>
          <p className="mt-4 rounded-[12px] border border-border bg-muted px-3 py-2.5 text-[12.5px] leading-5 text-muted-foreground">
            Demo: abrí{' '}
            <Link
              to={`/reset-password?token=${DEMO_RESET_TOKEN}`}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              /reset-password?token={DEMO_RESET_TOKEN}
            </Link>{' '}
            para probar el restablecimiento.
          </p>
          <Button type="button" className="mt-5 w-full" asChild>
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      ) : (
        <>
          <h1 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">
            Restablecer contraseña
          </h1>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Ingresá tu email o usuario y te enviaremos un enlace si existe una cuenta.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="fg-credential">Email o usuario</Label>
              <Input
                id="fg-credential"
                type="text"
                placeholder="ej: operador@lab-cv.com o operador"
                autoComplete="username"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                aria-invalid={!!error}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              <Mail className="size-4" />
              {submitting ? 'Enviando…' : 'Enviar enlace'}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
