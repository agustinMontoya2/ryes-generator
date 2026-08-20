import { Pencil } from 'lucide-react';
import type { User } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface UserCardProps {
  user: User;
  onAssign: (user: User) => void;
}

function initials(username: string) {
  return username
    .split(/\s+|_|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function UserCard({ user, onAssign }: UserCardProps) {
  const admin = user.isSuperAdmin;
  const assigned = user.branches ?? [];

  return (
    <div className="rounded-[16px] border border-border bg-card p-4 shadow-[0_1px_2px_oklch(22%_0.02_250/0.04),0_2px_8px_oklch(22%_0.02_250/0.05)]">
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            admin
              ? 'bg-status-submitted-bg text-status-submitted-fg'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {initials(user.username)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-bold">{user.username}</p>
          <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
        </div>
        <Badge
          className={cn(
            'rounded-full border-0',
            admin
              ? 'bg-status-submitted-bg text-status-submitted-fg'
              : 'bg-status-completed-bg text-status-completed-fg',
          )}
        >
          {admin ? 'Superadmin' : 'Operador'}
        </Badge>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12.5px] font-bold text-muted-foreground">Sucursales asignadas</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {assigned.length ? (
              assigned.map((branch) => (
                <span
                  key={branch.id}
                  className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-semibold text-foreground"
                >
                  {branch.location}
                </span>
              ))
            ) : (
              <span className="text-[13px] text-muted-foreground">Ninguna</span>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => onAssign(user)}>
          <Pencil className="size-3.5" />
          Asignar
        </Button>
      </div>
    </div>
  );
}
