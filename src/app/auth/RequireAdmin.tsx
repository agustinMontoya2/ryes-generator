import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';
import { FullScreenLoader } from '../components/FullScreenLoader';

export function RequireAdmin() {
  const { status, user } = useAuth();

  if (status === 'loading') return <FullScreenLoader />;

  if (status !== 'authenticated' || !user?.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
