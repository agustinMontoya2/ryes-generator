import type { Patient } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
}

export function PatientList({ patients, onEdit, onDelete }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No hay pacientes registrados</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {patients.map((patient) => (
        <Card key={patient.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">{patient.fullname}</h3>
              <p className="text-sm text-gray-600">DNI: {patient.dni}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={`Editar paciente ${patient.fullname}`}
                onClick={() => onEdit(patient)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Eliminar paciente ${patient.fullname}`}
                onClick={() => onDelete(patient.id)}
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
