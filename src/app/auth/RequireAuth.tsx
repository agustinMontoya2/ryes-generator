import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

function FullScreenLoader() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="text-sm">Cargando…</span>
      </div>
    </main>
  );
}

export function RequireAuth() {
  const { status } = useAuth();

  if (status === 'loading') return <FullScreenLoader />;

  if (status !== 'authenticated') return <Navigate to="/login" replace />;

  return <Outlet />;
}
