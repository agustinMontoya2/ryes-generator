import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

export function RequireAdmin() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">Cargando…</span>
        </div>
      </main>
    );
  }

  if (status !== 'authenticated' || !user?.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
