import { Link } from 'react-router';
import { Button } from '../components/ui/button';

export function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-gray-600 mb-4">Pagina no encontrada</p>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </main>
  );
}
