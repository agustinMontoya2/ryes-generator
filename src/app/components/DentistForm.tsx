import { useState } from 'react';
import { Dentist } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { X } from 'lucide-react';

interface DentistFormProps {
  dentist?: Dentist | null;
  onSubmit: (dentist: Partial<Dentist>) => void;
  onCancel: () => void;
}

export function DentistForm({ dentist, onSubmit, onCancel }: DentistFormProps) {
  const [formData, setFormData] = useState({
    name: dentist?.name || '',
    lastname: dentist?.lastname || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.lastname.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    onSubmit({
      id: dentist?.id,
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {dentist ? 'Editar Odontólogo' : 'Nuevo Odontólogo'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Roberto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname">Apellido *</Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
                placeholder="Ej: Sánchez"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {dentist ? 'Guardar Cambios' : 'Agregar Odontólogo'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
