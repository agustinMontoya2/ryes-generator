import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './auth/AuthContext';
import { BRAND_NAME } from './config/brand';
import { Toaster } from './components/ui/sonner';

export default function App() {
  useEffect(() => {
    document.title = BRAND_NAME;
  }, []);

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster position="top-center" richColors />
    </>
  );
}
