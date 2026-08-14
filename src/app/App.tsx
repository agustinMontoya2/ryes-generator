import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './auth/AuthContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster position="top-center" richColors />
    </>
  );
}
