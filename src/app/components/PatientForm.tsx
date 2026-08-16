import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Patient, PatientInput } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { UserCheck } from 'lucide-react';

interface PatientFormProps {
  patient: Patient | null;
  onSubmit: (patient: PatientInput) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, onSubmit, onCancel }: PatientFormProps) {
  const [fullname, setFullname] = useState(patient?.fullname || '');
  const [dni, setDni] = useState(patient?.dni?.toString() || '');

  useEffect(() => {
    setFullname(patient?.fullname || '');
    setDni(patient?.dni?.toString() || '');
  }, [patient]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: patient?.id,
      fullname,
      dni: Number(dni),
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-accent text-accent-foreground">
              <UserCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </DialogTitle>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {patient
                  ? 'Actualizá los datos del paciente.'
                  : 'Registrá un nuevo paciente en la agenda.'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <DialogFooter className="flex gap-2 pt-4 sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {patient ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
