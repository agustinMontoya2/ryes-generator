import { useState, useEffect } from 'react';
import { Patient } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { X } from 'lucide-react';

interface PatientFormProps {
  patient: Patient | null;
  onSubmit: (patient: Partial<Patient>) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, onSubmit, onCancel }: PatientFormProps) {
  const [fullname, setFullname] = useState(patient?.fullname || '');
  const [dni, setDni] = useState(patient?.dni?.toString() || '');

  useEffect(() => {
    setFullname(patient?.fullname || '');
    setDni(patient?.dni?.toString() || '');
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: patient?.id,
      fullname,
      dni: Number(dni),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 mb-0 md:mb-4 rounded-t-xl md:rounded-xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Nombre Completo</Label>
            <Input
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Ej: María González"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              type="number"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 35123456"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {patient ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
