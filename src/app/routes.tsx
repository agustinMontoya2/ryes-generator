import { createBrowserRouter } from 'react-router';
import { BranchSelection } from './pages/BranchSelection';
import { BranchDashboard } from './pages/BranchDashboard';
import { Login } from './pages/Login';
import { RequireAuth } from './auth/RequireAuth';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
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
