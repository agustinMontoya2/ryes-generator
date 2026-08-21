import type { Service } from '../types';
import { Button } from './ui/button';
import { Briefcase, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

export function ServiceList({ services, onEdit, onDelete }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="rounded-[16px] border-[1.5px] border-dashed border-border bg-card p-8 text-center">
        <div className="mx-auto mb-3 flex size-[58px] items-center justify-center rounded-[17px] bg-muted text-muted-foreground">
          <Briefcase className="size-6" />
        </div>
        <h4 className="font-display text-[15px] font-bold">No hay servicios</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Cargá el precio de lista de los servicios del laboratorio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex items-center justify-between gap-3 rounded-[16px] border border-border bg-card p-3.5 shadow-[0_1px_2px_oklch(22%_0.02_250/0.04),0_2px_8px_oklch(22%_0.02_250/0.05)]"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-muted text-muted-foreground">
              <Briefcase className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-display text-[15px] font-bold">{service.name}</h3>
              <p className="text-[12.5px] text-muted-foreground">Precio de lista</p>
            </div>
          </div>
          <p className="shrink-0 font-display text-[15px] font-bold">
            {formatCurrency(service.price)}
          </p>
          <div className="flex shrink-0 gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Editar servicio ${service.name}`}
              onClick={() => onEdit(service)}
            >
              <Edit2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Eliminar servicio ${service.name}`}
              onClick={() => onDelete(service.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
