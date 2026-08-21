import type { Patient } from '../types';
import { Button } from './ui/button';
import { Edit2, Trash2, UserCheck } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
}

function getInitials(fullname: string): string {
  return fullname
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function PatientList({ patients, onEdit, onDelete }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="rounded-[16px] border-[1.5px] border-dashed border-border bg-card p-8 text-center">
        <div className="mx-auto mb-3 flex size-[58px] items-center justify-center rounded-[17px] bg-muted text-muted-foreground">
          <UserCheck className="size-6" />
        </div>
        <h4 className="font-display text-[15px] font-bold">No hay pacientes</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Registrá pacientes para poder cargar trabajos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-card p-3.5 shadow-[0_1px_2px_oklch(22%_0.02_250/0.04),0_2px_8px_oklch(22%_0.02_250/0.05)]"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-accent font-display text-[13px] font-bold text-accent-foreground">
              {getInitials(patient.fullname)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-display text-[15px] font-bold">{patient.fullname}</h3>
              <p className="text-[12.5px] text-muted-foreground">
                {patient.dni != null ? `DNI: ${patient.dni}` : 'Sin DNI'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Editar paciente ${patient.fullname}`}
              onClick={() => onEdit(patient)}
            >
              <Edit2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Eliminar paciente ${patient.fullname}`}
              onClick={() => onDelete(patient.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
