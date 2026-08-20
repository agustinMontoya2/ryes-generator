import { createBrowserRouter } from 'react-router';
import { BranchSelection } from './pages/BranchSelection';
import { BranchDashboard } from './pages/BranchDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Admin } from './pages/Admin';
import { RequireAuth } from './auth/RequireAuth';
import { RequireAdmin } from './auth/RequireAdmin';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/forgot',
    Component: ForgotPassword,
  },
  {
    path: '/reset-password',
    Component: ResetPassword,
  },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: '/admin',
        Component: Admin,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        Component: BranchSelection,
      },
      {
        path: '/branches/:id',
        Component: BranchDashboard,
      },
    ],
  },
]);
