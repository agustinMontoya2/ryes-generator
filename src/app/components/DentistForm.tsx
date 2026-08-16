import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import type { Dentist, DentistInput } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Users } from 'lucide-react';

interface DentistFormProps {
  dentist?: Dentist | null;
  onSubmit: (dentist: DentistInput) => void;
  onCancel: () => void;
}

export function DentistForm({ dentist, onSubmit, onCancel }: DentistFormProps) {
  const [formData, setFormData] = useState({
    name: dentist?.name || '',
    lastname: dentist?.lastname || '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.lastname.trim()) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    onSubmit({
      id: dentist?.id,
      ...formData,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-accent text-accent-foreground">
              <Users className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {dentist ? 'Editar Odontólogo' : 'Nuevo Odontólogo'}
              </DialogTitle>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {dentist
                  ? 'Actualizá los datos del profesional.'
                  : 'Sumá un nuevo profesional al laboratorio.'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Roberto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastname">Apellido *</Label>
            <Input
              id="lastname"
              value={formData.lastname}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastname: e.target.value }))}
              placeholder="Ej: Sánchez"
              required
            />
          </div>

          <DialogFooter className="flex gap-3 pt-4 sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {dentist ? 'Guardar Cambios' : 'Agregar Odontólogo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
