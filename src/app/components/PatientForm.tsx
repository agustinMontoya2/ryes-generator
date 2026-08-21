import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { Patient, PatientInput } from '../types';
import {
  findNameOnlyPatient,
  findPatientByDniOnly,
  findPatientsByName,
  normalizeName,
} from '../utils/patients';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { UserCheck } from 'lucide-react';
import { cn } from './ui/utils';

interface PatientFormProps {
  patient: Patient | null;
  patients: Patient[];
  onSubmit: (patient: PatientInput) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, patients, onSubmit, onCancel }: PatientFormProps) {
  const [fullname, setFullname] = useState(patient?.fullname || '');
  const [dni, setDni] = useState(patient?.dni?.toString() || '');
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const fullnameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullname(patient?.fullname || '');
    setDni(patient?.dni?.toString() || '');
    setError(null);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  }, [patient]);

  useEffect(() => {
    if (fullname.trim().length > 0) {
      setSuggestions(findPatientsByName(patients, fullname));
      setActiveSuggestion(-1);
    } else {
      setSuggestions([]);
      setActiveSuggestion(-1);
    }
  }, [fullname, patients]);

  const selectSuggestion = (suggested: Patient) => {
    setFullname(suggested.fullname);
    setDni(suggested.dni?.toString() || '');
    setError(null);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmed = fullname.trim();
    const parsedDni = parseInt(dni);
    const dniValue = Number.isNaN(parsedDni) ? undefined : parsedDni;

    if (dniValue != null) {
      const owner = findPatientByDniOnly(patients, dniValue);
      if (owner && owner.id !== patient?.id) {
        setError(
          normalizeName(owner.fullname) === normalizeName(trimmed)
            ? 'Ya existe un paciente con ese nombre y DNI.'
            : `Ese DNI ya pertenece a ${owner.fullname}.`,
        );
        return;
      }
    } else {
      const nameOnly = findNameOnlyPatient(patients, trimmed);
      if (nameOnly && nameOnly.id !== patient?.id) {
        setError('Ya existe un paciente sin DNI con ese nombre. Usá ese o ingresá un DNI.');
        return;
      }
    }

    onSubmit({
      id: patient?.id,
      fullname: trimmed,
      dni: dniValue,
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
          <div className="relative space-y-2">
            <Label htmlFor="fullname">Nombre Completo</Label>
            <Input
              ref={fullnameInputRef}
              id="fullname"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="patient-form-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activeSuggestion >= 0 ? `patient-form-suggestion-${suggestions[activeSuggestion]?.id}` : undefined
              }
              value={fullname}
              onChange={(e) => {
                setFullname(e.target.value);
                setError(null);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Ej: María González"
              required
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                id="patient-form-suggestions"
                role="listbox"
                className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-[12px] border border-border bg-popover p-1.5 shadow-[0_2px_4px_oklch(22%_0.02_250/0.05),0_12px_28px_oklch(22%_0.02_250/0.09)]"
              >
                {suggestions.map((suggested, index) => (
                  <div
                    key={suggested.id}
                    id={`patient-form-suggestion-${suggested.id}`}
                    role="option"
                    aria-selected={index === activeSuggestion}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-sm',
                      index === activeSuggestion ? 'bg-muted' : 'hover:bg-muted',
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(suggested);
                    }}
                    onMouseEnter={() => setActiveSuggestion(index)}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-muted text-[11px] font-bold text-muted-foreground">
                      {suggested.fullname
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase()}
                    </span>
                    <span className="truncate font-medium">{suggested.fullname}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                      {suggested.dni != null ? `DNI ${suggested.dni}` : 'sin DNI'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI (opcional)</Label>
            <Input
              id="dni"
              type="number"
              value={dni}
              onChange={(e) => {
                setDni(e.target.value);
                setError(null);
              }}
              placeholder="Ej: 35123456"
            />
            {dni.trim().length === 0 && (
              <p className="text-[12px] text-muted-foreground">
                Sin DNI, el paciente se identifica por su nombre.
              </p>
            )}
            {error && (
              <p className="rounded-[10px] bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
                {error}
              </p>
            )}
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
