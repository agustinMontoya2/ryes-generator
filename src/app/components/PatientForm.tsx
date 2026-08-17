import { useEffect, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { toast } from 'sonner';
import type { Patient, PatientInput } from '../types';
import { toErrorMessage } from '../api/client';
import { listPatients } from '../api/patients';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface PatientFormProps {
  patient: Patient | null;
  branchId: string;
  onSubmit: (patient: PatientInput) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, branchId, onSubmit, onCancel }: PatientFormProps) {
  const isEditing = Boolean(patient);

  const [fullname, setFullname] = useState(patient?.fullname || '');
  const [dni, setDni] = useState(patient?.dni?.toString() || '');

  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Patient | null>(null);

  useEffect(() => {
    setFullname(patient?.fullname || '');
    setDni(patient?.dni?.toString() || '');
    setSelectedMatch(null);
    setSuggestions([]);
    setShowSuggestions(false);
  }, [patient]);

  useEffect(() => {
    if (isEditing) return;

    const dniRaw = dni.trim();
    if (!dniRaw) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await listPatients({ branchId, search: dniRaw, limit: 10 });
        if (controller.signal.aborted) return;
        setSuggestions(res.data);
        const dniNumber = Number(dniRaw);
        const exact = res.data.find((p) => p.dni === dniNumber);
        if (exact) {
          setSelectedMatch(exact);
          setFullname(exact.fullname);
          setShowSuggestions(false);
          setActiveSuggestion(-1);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        toast.error(toErrorMessage(err));
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [dni, branchId, isEditing]);

  const selectMatch = (match: Patient) => {
    setSelectedMatch(match);
    setDni(match.dni.toString());
    setFullname(match.fullname);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleDniKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      selectMatch(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!fullname.trim() || !dni.trim()) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    const dniNumber = Number(dni);
    if (isNaN(dniNumber) || dniNumber <= 0) {
      toast.error('Ingrese un DNI válido');
      return;
    }

    if (selectedMatch) {
      toast.error(`Ya existe un paciente con ese DNI: ${selectedMatch.fullname}`);
      return;
    }

    onSubmit({
      id: patient?.id,
      fullname: fullname.trim(),
      dni: dniNumber,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{patient ? 'Editar Paciente' : 'Nuevo Paciente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              type="number"
              min="1"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="patient-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activeSuggestion >= 0
                  ? `patient-suggestion-${suggestions[activeSuggestion]?.id}`
                  : undefined
              }
              value={dni}
              onChange={(e) => {
                const value = e.target.value;
                setDni(value);
                if (selectedMatch && String(selectedMatch.dni) !== value) {
                  setSelectedMatch(null);
                  setFullname('');
                }
                setShowSuggestions(true);
              }}
              onKeyDown={handleDniKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
              placeholder="Ej: 35123456"
              required
              autoComplete="off"
              disabled={isEditing}
            />
            {!isEditing && showSuggestions && dni.trim() && (
              <div
                id="patient-suggestions"
                role="listbox"
                className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
              >
                {searching ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((match, index) => (
                    <div
                      key={match.id}
                      id={`patient-suggestion-${match.id}`}
                      role="option"
                      aria-selected={index === activeSuggestion}
                      className={`px-3 py-2 cursor-pointer ${
                        index === activeSuggestion ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectMatch(match);
                      }}
                      onMouseEnter={() => setActiveSuggestion(index)}
                    >
                      {match.fullname} — DNI {match.dni}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-blue-600">
                    Sin resultados. Se creará un nuevo paciente.
                  </div>
                )}
              </div>
            )}
            {selectedMatch && (
              <p className="text-sm text-amber-600">
                Ya existe un paciente con ese DNI: {selectedMatch.fullname}. No se puede agregar
                duplicado.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullname">Nombre Completo</Label>
            <Input
              id="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Ej: María González"
              required
              disabled={Boolean(selectedMatch)}
            />
          </div>

          <DialogFooter className="flex gap-2 pt-4 sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={Boolean(selectedMatch)}>
              {patient ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
