import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

export function RequireAuth() {
  const { status } = useAuth();

  if (status !== 'authenticated') return <Navigate to="/login" replace />;

  return <Outlet />;
}
