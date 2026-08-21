import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import type { Service, ServiceInput } from '../types';
import { ApiError, toErrorMessage } from '../api/client';
import { getServiceByName } from '../api/services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Briefcase } from 'lucide-react';

interface ServiceFormProps {
  service: Service | null;
  branchId: string;
  onSubmit: (service: ServiceInput) => void;
  onCancel: () => void;
}

export function ServiceForm({ service, branchId, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(service?.name || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setName(service?.name || '');
    setPrice(service?.price?.toString() || '');
  }, [service]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Por favor ingrese el nombre del servicio');
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Ingrese un precio valido');
      return;
    }

    if (service) {
      onSubmit({ id: service.id, name: name.trim(), price: priceNum });
      return;
    }

    setChecking(true);
    try {
      const existing = await getServiceByName(name.trim(), branchId);
      toast.error(`Ya existe un servicio con ese nombre: ${existing.name} ($${existing.price})`);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        onSubmit({ name: name.trim(), price: priceNum });
      } else {
        toast.error(toErrorMessage(err));
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-accent text-accent-foreground">
              <Briefcase className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {service ? 'Editar Servicio' : 'Nuevo Servicio'}
              </DialogTitle>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {service
                  ? 'Actualizá el precio de lista del servicio.'
                  : 'Cargá un nuevo servicio con su precio de lista.'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Servicio</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corona de porcelana"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej: 25000"
              required
            />
          </div>

          <DialogFooter className="flex gap-2 pt-4 sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={checking}>
              {checking ? 'Verificando…' : service ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
