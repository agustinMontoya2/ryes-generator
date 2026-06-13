import { createBrowserRouter } from 'react-router';
import { RyesSelection } from './pages/RyesSelection';
import { RyesDashboard } from './pages/RyesDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RyesSelection,
  },
  {
    path: '/ryes/:id',
    Component: RyesDashboard,
  },
]);
