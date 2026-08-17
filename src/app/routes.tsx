import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RequireAuth } from './auth/RequireAuth';
import { Loader2 } from 'lucide-react';

const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const BranchSelection = lazy(() =>
  import('./pages/BranchSelection').then((m) => ({ default: m.BranchSelection })),
);
const BranchDashboard = lazy(() =>
  import('./pages/BranchDashboard').then((m) => ({ default: m.BranchDashboard })),
);
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Cargando...</span>
      </div>
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: (
          <SuspenseWrapper>
            <BranchSelection />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/branches/:id',
        element: (
          <SuspenseWrapper>
            <BranchDashboard />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFound />
      </SuspenseWrapper>
    ),
  },
]);
