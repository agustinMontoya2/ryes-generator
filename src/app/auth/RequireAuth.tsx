import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthContext';
import { FullScreenLoader } from '../components/FullScreenLoader';

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoader />;

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
