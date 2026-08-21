import { Link } from 'react-router';
import { useBranches } from '../hooks/queries';
import { toErrorMessage } from '../api/client';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { PageHero } from '../components/PageHero';
import { ChevronRight, Loader2, MapPin, Store } from 'lucide-react';

export function BranchSelection() {
  const { data: branches = [], isLoading, error } = useBranches();

  return (
    <AppShell className="flex flex-col gap-7">
      <TopBar />

      <PageHero
        eyebrow="Sucursales"
        title="Elegí la sucursal a gestionar"
        subtitle="Seleccioná el laboratorio desde el que querés operar."
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Cargando sucursales…</span>
        </div>
      ) : error ? (
        <div className="rounded-[16px] border-[1.5px] border-dashed border-destructive/40 bg-card p-8 text-center">
          <p className="text-sm text-destructive">{toErrorMessage(error)}</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Reintentá en unos segundos.</p>
        </div>
      ) : branches.length === 0 ? (
        <div className="rounded-[16px] border-[1.5px] border-dashed border-border bg-card p-8 text-center">
          <div className="mx-auto mb-3 flex size-[58px] items-center justify-center rounded-[17px] bg-muted text-muted-foreground">
            <Store className="size-6" />
          </div>
          <h4 className="font-display text-[15px] font-bold">No hay sucursales</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Comunicate con el administrador para dar de alta una sucursal.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {branches.map((branch) => (
            <Link
              key={branch.id}
              to={`/branches/${branch.id}`}
              className="group flex items-center gap-3.5 rounded-[16px] border border-border bg-card p-3.5 shadow-[0_1px_2px_oklch(22%_0.02_250/0.04),0_2px_8px_oklch(22%_0.02_250/0.05)] transition-all hover:-translate-y-px hover:border-border hover:shadow-[0_2px_4px_oklch(22%_0.02_250/0.05),0_12px_28px_oklch(22%_0.02_250/0.09)]"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-accent text-accent-foreground">
                <MapPin className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold">{branch.location}</p>
                <p className="text-[12.5px] text-muted-foreground">Sucursal</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
