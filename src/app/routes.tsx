import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { RequireAuth } from './auth/RequireAuth';
import { RequireAdmin } from './auth/RequireAdmin';
import { Loader2 } from 'lucide-react';

const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() =>
  import('./pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })),
);
const ResetPassword = lazy(() =>
  import('./pages/ResetPassword').then((m) => ({ default: m.ResetPassword })),
);
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));
const BranchSelection = lazy(() =>
  import('./pages/BranchSelection').then((m) => ({ default: m.BranchSelection })),
);
const BranchDashboard = lazy(() =>
  import('./pages/BranchDashboard').then((m) => ({ default: m.BranchDashboard })),
);
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
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
    path: '/register',
    element: (
      <SuspenseWrapper>
        <Register />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/forgot',
    element: (
      <SuspenseWrapper>
        <ForgotPassword />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <SuspenseWrapper>
        <ResetPassword />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <SuspenseWrapper>
        <ResetPassword />
      </SuspenseWrapper>
    ),
  },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: '/admin',
        element: (
          <SuspenseWrapper>
            <Admin />
          </SuspenseWrapper>
        ),
      },
    ],
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
