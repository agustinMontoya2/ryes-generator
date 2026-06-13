import { Dentist } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Pencil, Trash2, User } from 'lucide-react';

interface DentistListProps {
  dentists: Dentist[];
  onEdit: (dentist: Dentist) => void;
  onDelete: (dentistId: string) => void;
}

export function DentistList({ dentists, onEdit, onDelete }: DentistListProps) {
  return (
    <div className="space-y-3">
      {dentists.map((dentist) => (
        <Card key={dentist.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">
                  Dr. {dentist.name} {dentist.lastname}
                </h3>
                <p className="text-sm text-gray-600">Odontólogo</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(dentist)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(dentist.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {dentists.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay odontólogos registrados</p>
        </Card>
      )}
    </div>
  );
}
