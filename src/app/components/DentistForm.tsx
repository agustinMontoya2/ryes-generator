import { useEffect, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { toast } from 'sonner';
import type { Dentist, DentistInput } from '../types';
import { toErrorMessage } from '../api/client';
import { listDentists } from '../api/dentists';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface DentistFormProps {
  dentist?: Dentist | null;
  branchId: string;
  onSubmit: (dentist: DentistInput) => void;
  onCancel: () => void;
}

export function DentistForm({ dentist, branchId, onSubmit, onCancel }: DentistFormProps) {
  const isEditing = Boolean(dentist);

  const [formData, setFormData] = useState({
    name: dentist?.name || '',
    lastname: dentist?.lastname || '',
  });

  const [suggestions, setSuggestions] = useState<Dentist[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedField, setFocusedField] = useState<'name' | 'lastname' | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Dentist | null>(null);

  const fullName = `${formData.name.trim()} ${formData.lastname.trim()}`.trim();

  useEffect(() => {
    if (isEditing) return;

    if (!fullName) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await listDentists({ branchId, search: fullName, limit: 10 });
        setSuggestions(res.data);
        const exact = res.data.find(
          (d) => `${d.name} ${d.lastname}`.toLowerCase() === fullName.toLowerCase(),
        );
        if (exact) {
          setSelectedMatch(exact);
          setFormData({ name: exact.name, lastname: exact.lastname });
          setShowSuggestions(false);
          setActiveSuggestion(-1);
        }
      } catch (err) {
        setSuggestions([]);
        toast.error(toErrorMessage(err));
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.name, formData.lastname, branchId, isEditing, fullName]);

  const selectMatch = (match: Dentist) => {
    setSelectedMatch(match);
    setFormData({ name: match.name, lastname: match.lastname });
    setShowSuggestions(false);
    setFocusedField(null);
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
      selectMatch(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const handleFocus = (field: 'name' | 'lastname') => {
    setShowSuggestions(true);
    setFocusedField(field);
  };

  const handleBlur = () => {
    setShowSuggestions(false);
    setFocusedField(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.lastname.trim()) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (selectedMatch) {
      toast.error(
        `Ya existe un odontólogo con ese nombre: ${selectedMatch.name} ${selectedMatch.lastname}`,
      );
      return;
    }

    onSubmit({
      id: dentist?.id,
      ...formData,
    });
  };

  const showDropdown = (field: 'name' | 'lastname') =>
    !isEditing && showSuggestions && focusedField === field && fullName.length > 0;

  const dropdownContent = (
    <div
      id="dentist-suggestions"
      role="listbox"
      className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
    >
      {searching ? (
        <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
      ) : suggestions.length > 0 ? (
        suggestions.map((match, index) => (
          <div
            key={match.id}
            id={`dentist-suggestion-${match.id}`}
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
            Dr. {match.name} {match.lastname}
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-blue-600">
          Sin resultados. Se creará un nuevo odontólogo.
        </div>
      )}
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dentist ? 'Editar Odontólogo' : 'Nuevo Odontólogo'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => {
                  if (selectedMatch && value !== selectedMatch.name) {
                    return { name: value, lastname: '' };
                  }
                  return { ...prev, name: value };
                });
                setSelectedMatch(null);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              placeholder="Ej: Roberto"
              required
              autoComplete="off"
            />
            {showDropdown('name') && dropdownContent}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="lastname">Apellido *</Label>
            <Input
              id="lastname"
              value={formData.lastname}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => {
                  if (selectedMatch && value !== selectedMatch.lastname) {
                    return { name: '', lastname: value };
                  }
                  return { ...prev, lastname: value };
                });
                setSelectedMatch(null);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => handleFocus('lastname')}
              onBlur={handleBlur}
              placeholder="Ej: Sánchez"
              required
              autoComplete="off"
            />
            {showDropdown('lastname') && dropdownContent}
          </div>

          {selectedMatch && (
            <p className="text-sm text-amber-600">
              Ya existe un odontólogo: {selectedMatch.name} {selectedMatch.lastname}. No se puede
              agregar duplicado.
            </p>
          )}

          <DialogFooter className="flex gap-3 pt-4 sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={Boolean(selectedMatch)}>
              {dentist ? 'Guardar Cambios' : 'Agregar Odontólogo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
