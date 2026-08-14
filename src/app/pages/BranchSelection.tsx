import { Link } from 'react-router';
import { mockBranches } from '../data/mockData';
import { useAuth } from '../auth/AuthContext';
import { BRAND_NAME } from '../config/brand';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, ChevronRight, LogOut } from 'lucide-react';

export function BranchSelection() {
  const { logout } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={logout} className="absolute right-0 top-0">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{BRAND_NAME}</h1>
          <p className="text-gray-600">Selecciona una sucursal para gestionar</p>
        </header>

        <div className="space-y-3">
          {mockBranches.map((branch) => (
            <Link key={branch.id} to={`/branches/${branch.id}`}>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">{branch.location}</h2>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
