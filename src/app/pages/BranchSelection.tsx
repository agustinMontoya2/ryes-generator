import { Link } from 'react-router';
import { ChevronRight, MapPin } from 'lucide-react';
import { mockBranches } from '../data/mockData';
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { PageHero } from '../components/PageHero';

export function BranchSelection() {
  return (
    <AppShell className="flex flex-col gap-7">
      <TopBar />

      <PageHero
        eyebrow="Sucursales"
        title="Elegí la sucursal a gestionar"
        subtitle="Seleccioná el laboratorio desde el que querés operar."
      />

      <div className="space-y-2.5">
        {mockBranches.map((branch) => (
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
    </AppShell>
  );
}
