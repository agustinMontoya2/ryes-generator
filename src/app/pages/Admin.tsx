import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Store } from 'lucide-react';
import type { Branch, User } from '../types';
import { getBranches, getUsers } from '../api/mock';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { PageHero } from '../components/PageHero';
import { UserCard } from '../components/UserCard';
import { AdminBranchesDialog } from '../components/AdminBranchesDialog';
import { Button } from '../components/ui/button';

export function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [usersData, branchesData] = await Promise.all([getUsers(), getBranches()]);
    setUsers(usersData.data);
    setBranches(branchesData);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">Cargando…</span>
        </div>
      </main>
    );
  }

  return (
    <AppShell className="flex flex-col gap-7">
      <TopBar showBack subtitle="Panel superadmin" />

      <PageHero
        eyebrow="Administración"
        title="Usuarios"
        subtitle="Asigná sucursales a cada usuario para controlar su acceso."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <Store className="size-4" />
              Gestión de sucursales
            </Link>
          </Button>
        }
      />

      <div className="space-y-2.5">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onAssign={setAssigning} />
        ))}
      </div>

      {assigning && (
        <AdminBranchesDialog
          user={assigning}
          branches={branches}
          onClose={() => setAssigning(null)}
          onSaved={() => {
            setAssigning(null);
            void load();
          }}
        />
      )}
    </AppShell>
  );
}
