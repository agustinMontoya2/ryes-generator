import type { Dentist } from '../types';
import { Button } from './ui/button';
import { Pencil, Trash2, Users } from 'lucide-react';

interface DentistListProps {
  dentists: Dentist[];
  onEdit: (dentist: Dentist) => void;
  onDelete: (dentistId: string) => void;
}

export function DentistList({ dentists, onEdit, onDelete }: DentistListProps) {
  if (dentists.length === 0) {
    return (
      <div className="rounded-[16px] border-[1.5px] border-dashed border-border bg-card p-8 text-center">
        <div className="mx-auto mb-3 flex size-[58px] items-center justify-center rounded-[17px] bg-muted text-muted-foreground">
          <Users className="size-6" />
        </div>
        <h4 className="font-display text-[15px] font-bold">No hay odontólogos</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Sumá profesionales para asignarlos a los trabajos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {dentists.map((dentist) => (
        <div
          key={dentist.id}
          className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-card p-3.5 shadow-[0_1px_2px_oklch(22%_0.02_250/0.04),0_2px_8px_oklch(22%_0.02_250/0.05)]"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-[oklch(93%_0.045_250)] text-[oklch(40%_0.09_250)]">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-display text-[15px] font-bold">
                Dr. {dentist.name} {dentist.lastname}
              </h3>
              <p className="text-[12.5px] text-muted-foreground">Odontólogo</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Editar odontólogo ${dentist.name} ${dentist.lastname}`}
              onClick={() => onEdit(dentist)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Eliminar odontólogo ${dentist.name} ${dentist.lastname}`}
              onClick={() => onDelete(dentist.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
