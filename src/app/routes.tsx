import { createBrowserRouter } from 'react-router';
import { RyesSelection } from './pages/RyesSelection';
import { RyesDashboard } from './pages/RyesDashboard';
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
        Component: RyesSelection,
      },
      {
        path: '/ryes/:id',
        Component: RyesDashboard,
      },
    ],
  },
]);
