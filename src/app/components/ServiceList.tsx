import { Service } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

export function ServiceList({ services, onEdit, onDelete }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No hay servicios registrados</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <Card key={service.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-gray-600">
                ${service.price.toLocaleString('es-AR')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(service)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(service.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
