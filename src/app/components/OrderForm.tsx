import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { toast } from 'sonner';
import type {
  Dentist,
  DentistInput,
  Order,
  OrderInput,
  Patient,
  PatientInput,
  Service,
} from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ClipboardList } from 'lucide-react';
import { sumServices } from '../utils/orders';
import { formatCurrency } from '../utils/format';
import {
  findNameOnlyPatient,
  findPatientByDni,
  findPatientByDniOnly,
  findPatientsByName,
  hasExactNamePatient,
  resolvePatient,
} from '../utils/patients';
import { cn } from './ui/utils';

interface OrderFormProps {
  order?: Order | null;
  patients: Patient[];
  dentists: Dentist[];
  services: Service[];
  onSubmit: (order: OrderInput) => void;
  onCancel: () => void;
  onAddPatient: (patient: PatientInput) => Patient;
  onAddDentist: (dentist: DentistInput) => Dentist;
}

export function OrderForm({
  order,
  patients,
  dentists,
  services,
  onSubmit,
  onCancel,
  onAddPatient,
  onAddDentist,
}: OrderFormProps) {
  const [formData, setFormData] = useState({
    patientDni: order?.patient.dni?.toString() || '',
    patientName: order?.patient.fullname || '',
    dentistName: order ? `${order.dentist.name} ${order.dentist.lastname}` : '',
    dispatchDate: order?.dispatchDate || new Date().toISOString().split('T')[0],
    dueDate: order?.dueDate || '',
    lab: order?.lab || 'Lab Central',
    selectedServices: order?.services.map((s) => s.id) || [],
  });

  const [patientSuggestions, setPatientSuggestions] = useState<Patient[]>([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [activePatientSuggestion, setActivePatientSuggestion] = useState(-1);
  const dniInputRef = useRef<HTMLInputElement>(null);
  const [dentistSuggestions, setDentistSuggestions] = useState<Dentist[]>([]);
  const [showDentistSuggestions, setShowDentistSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  useEffect(() => {
    if (formData.patientName.trim().length > 0) {
      setPatientSuggestions(findPatientsByName(patients, formData.patientName));
      setActivePatientSuggestion(-1);
    } else {
      setPatientSuggestions([]);
      setActivePatientSuggestion(-1);
    }
  }, [formData.patientName, patients]);

  useEffect(() => {
    if (formData.dentistName.length > 0) {
      const filtered = dentists.filter((d) => {
        const fullName = `${d.name} ${d.lastname}`.toLowerCase();
        return fullName.includes(formData.dentistName.toLowerCase());
      });
      setDentistSuggestions(filtered);
      setActiveSuggestion(-1);
    } else {
      setDentistSuggestions([]);
      setActiveSuggestion(-1);
    }
  }, [formData.dentistName, dentists]);

  const selectPatient = (patient: Patient) => {
    setFormData((prev) => ({
      ...prev,
      patientName: patient.fullname,
      patientDni: patient.dni?.toString() || '',
    }));
    setShowPatientSuggestions(false);
    setActivePatientSuggestion(-1);
  };

  const handlePatientKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (patientSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActivePatientSuggestion((i) => (i + 1) % patientSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActivePatientSuggestion(
        (i) => (i - 1 + patientSuggestions.length) % patientSuggestions.length,
      );
    } else if (e.key === 'Enter' && activePatientSuggestion >= 0) {
      e.preventDefault();
      selectPatient(patientSuggestions[activePatientSuggestion]);
    } else if (e.key === 'Escape') {
      setShowPatientSuggestions(false);
      setActivePatientSuggestion(-1);
    }
  };

  const selectDentist = (dentist: Dentist) => {
    setFormData((prev) => ({
      ...prev,
      dentistName: `${dentist.name} ${dentist.lastname}`,
    }));
    setShowDentistSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleDentistKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (dentistSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => (i + 1) % dentistSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => (i - 1 + dentistSuggestions.length) % dentistSuggestions.length);
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      selectDentist(dentistSuggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowDentistSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const selectedServices = services.filter((s) => formData.selectedServices.includes(s.id));

    if (
      !formData.patientName.trim() ||
      !formData.dentistName ||
      selectedServices.length === 0
    ) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const parsedDni = parseInt(formData.patientDni);
    const dni = Number.isNaN(parsedDni) ? undefined : parsedDni;

    if (dni != null) {
      const owner = findPatientByDniOnly(patients, dni);
      const exact = findPatientByDni(patients, formData.patientName.trim(), dni);
      if (owner && !exact) {
        toast.error(`El DNI ${dni} ya pertenece a ${owner.fullname}.`);
        return;
      }
    }

    const patient = resolvePatient(patients, onAddPatient, formData.patientName.trim(), dni);

    let dentist: Dentist;
    const existingDentist = dentists.find(
      (d) => `${d.name} ${d.lastname}`.toLowerCase() === formData.dentistName.toLowerCase(),
    );

    if (existingDentist) {
      dentist = existingDentist;
    } else {
      const nameParts = formData.dentistName.trim().split(' ');
      const name = nameParts[0] || formData.dentistName;
      const lastname = nameParts.slice(1).join(' ') || '';
      dentist = onAddDentist({ name, lastname });
    }

    onSubmit({
      id: order?.id,
      patient,
      dentist,
      dispatchDate: formData.dispatchDate,
      dueDate: formData.dueDate,
      lab: formData.lab,
      services: selectedServices,
      status: order?.status || 'pending',
    });
  };

  const toggleService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const selectedServices = services.filter((s) => formData.selectedServices.includes(s.id));
  const totalPrice = sumServices(selectedServices);

  const trimmedName = formData.patientName.trim();
  const parsedDni = parseInt(formData.patientDni);
  const effectiveDni = Number.isNaN(parsedDni) ? undefined : parsedDni;
  const exactNameExists =
    trimmedName.length > 0 && hasExactNamePatient(patients, trimmedName);

  const exactMatch =
    trimmedName.length > 0 && effectiveDni != null
      ? findPatientByDni(patients, trimmedName, effectiveDni)
      : undefined;
  const dniOwner = effectiveDni != null ? findPatientByDniOnly(patients, effectiveDni) : undefined;
  const dniConflict = dniOwner != null && !exactMatch;

  let resolutionHint: string | null = null;
  if (trimmedName.length > 0) {
    if (exactMatch) {
      resolutionHint = `Se vinculará a ${exactMatch.fullname} (DNI ${effectiveDni}).`;
    } else if (dniConflict && dniOwner) {
      resolutionHint = `El DNI ${effectiveDni} ya pertenece a ${dniOwner.fullname}.`;
    } else if (effectiveDni != null) {
      resolutionHint = `Se creará un nuevo paciente con DNI ${effectiveDni}.`;
    } else {
      const nameOnly = findNameOnlyPatient(patients, trimmedName);
      resolutionHint = nameOnly
        ? `Se vinculará a ${nameOnly.fullname} (sin DNI). Para un homónimo, ingresá su DNI.`
        : 'Se creará un nuevo paciente sin DNI.';
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-accent text-accent-foreground">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {order ? 'Editar trabajo' : 'Nuevo trabajo'}
              </DialogTitle>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {order
                  ? 'Actualizá los datos de la orden de trabajo.'
                  : 'Registrá una nueva orden de trabajo para el laboratorio.'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative space-y-1.5">
            <Label htmlFor="patientName">Nombre del Paciente *</Label>
            <Input
              id="patientName"
              type="text"
              role="combobox"
              aria-expanded={showPatientSuggestions}
              aria-controls="patient-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activePatientSuggestion >= 0
                  ? `patient-suggestion-${patientSuggestions[activePatientSuggestion]?.id}`
                  : undefined
              }
              value={formData.patientName}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  patientName: e.target.value,
                }));
                setShowPatientSuggestions(true);
              }}
              onKeyDown={handlePatientKeyDown}
              onFocus={() => setShowPatientSuggestions(true)}
              placeholder="Ingrese nombre completo"
              required
              autoComplete="off"
            />
            {showPatientSuggestions && patientSuggestions.length > 0 && (
              <div
                id="patient-suggestions"
                role="listbox"
                className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-[12px] border border-border bg-popover p-1.5 shadow-[0_2px_4px_oklch(22%_0.02_250/0.05),0_12px_28px_oklch(22%_0.02_250/0.09)]"
              >
                {patientSuggestions.map((patient, index) => (
                  <div
                    key={patient.id}
                    id={`patient-suggestion-${patient.id}`}
                    role="option"
                    aria-selected={index === activePatientSuggestion}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-sm',
                      index === activePatientSuggestion ? 'bg-muted' : 'hover:bg-muted',
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectPatient(patient);
                    }}
                    onMouseEnter={() => setActivePatientSuggestion(index)}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-muted text-[11px] font-bold text-muted-foreground">
                      {patient.fullname
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase()}
                    </span>
                    <span className="truncate font-medium">{patient.fullname}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                      {patient.dni != null ? `DNI ${patient.dni}` : 'sin DNI'}
                    </span>
                  </div>
                ))}
                {trimmedName.length > 0 && (
                  <div
                    role="option"
                    aria-selected={activePatientSuggestion === patientSuggestions.length}
                    className={cn(
                      'mt-1 flex cursor-pointer items-center gap-2.5 rounded-[9px] border-t border-border px-2.5 py-2 text-sm',
                      activePatientSuggestion === patientSuggestions.length
                        ? 'bg-muted'
                        : 'hover:bg-muted',
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowPatientSuggestions(false);
                      setActivePatientSuggestion(-1);
                      if (exactNameExists) {
                        dniInputRef.current?.focus();
                      } else {
                        setFormData((prev) => ({ ...prev, patientName: trimmedName }));
                      }
                    }}
                    onMouseEnter={() => setActivePatientSuggestion(patientSuggestions.length)}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-accent text-accent-foreground">
                      +
                    </span>
                    <span className="truncate font-medium">
                      {exactNameExists
                        ? 'Es otra persona: cargá su DNI para crearlo'
                        : `Crear nuevo paciente "${trimmedName}"`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="patientDni">DNI del Paciente (opcional)</Label>
            <Input
              ref={dniInputRef}
              id="patientDni"
              type="number"
              value={formData.patientDni}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  patientDni: e.target.value,
                }))
              }
              placeholder="Ej: 35123456"
            />
            {resolutionHint && (
              <div
                className={cn(
                  'flex items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-[12.5px]',
                  dniConflict
                    ? 'bg-[oklch(95%_0.055_85)] text-[oklch(38%_0.09_70)]'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <span>{resolutionHint}</span>
                {dniConflict && dniOwner && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 shrink-0 border-[oklch(80%_0.08_75)] text-[oklch(38%_0.09_70)] hover:bg-[oklch(91%_0.06_85)]"
                    onClick={() => selectPatient(dniOwner)}
                  >
                    Vincular a {dniOwner.fullname}
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="relative space-y-1.5">
            <Label htmlFor="dentist">Odontólogo *</Label>
            <Input
              id="dentist"
              type="text"
              role="combobox"
              aria-expanded={showDentistSuggestions}
              aria-controls="dentist-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activeSuggestion >= 0
                  ? `dentist-suggestion-${dentistSuggestions[activeSuggestion]?.id}`
                  : undefined
              }
              value={formData.dentistName}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  dentistName: e.target.value,
                }));
                setShowDentistSuggestions(true);
              }}
              onKeyDown={handleDentistKeyDown}
              onFocus={() => setShowDentistSuggestions(true)}
              placeholder="Ingrese nombre del odontólogo"
              required
              autoComplete="off"
            />
            {showDentistSuggestions && dentistSuggestions.length > 0 && (
              <div
                id="dentist-suggestions"
                role="listbox"
                className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-[12px] border border-border bg-popover p-1.5 shadow-[0_2px_4px_oklch(22%_0.02_250/0.05),0_12px_28px_oklch(22%_0.02_250/0.09)]"
              >
                {dentistSuggestions.map((dentist, index) => (
                  <div
                    key={dentist.id}
                    id={`dentist-suggestion-${dentist.id}`}
                    role="option"
                    aria-selected={index === activeSuggestion}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-sm',
                      index === activeSuggestion ? 'bg-muted' : 'hover:bg-muted',
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectDentist(dentist);
                    }}
                    onMouseEnter={() => setActiveSuggestion(index)}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-muted text-[11px] font-bold text-muted-foreground">
                      Dr
                    </span>
                    <span className="truncate font-medium">
                      Dr. {dentist.name} {dentist.lastname}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dispatchDate">Fecha de Despacho *</Label>
              <Input
                id="dispatchDate"
                type="date"
                value={formData.dispatchDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dispatchDate: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Fecha de Entrega *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lab">Laboratorio</Label>
            <Input
              id="lab"
              value={formData.lab}
              onChange={(e) => setFormData((prev) => ({ ...prev, lab: e.target.value }))}
              placeholder="Nombre del laboratorio"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Servicios * (seleccione al menos uno)</Label>
            <div className="max-h-[220px] space-y-2 overflow-y-auto rounded-[12px] border border-border p-2.5">
              {services.map((service) => {
                const checked = formData.selectedServices.includes(service.id);
                return (
                  <div
                    key={service.id}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-[12px] border px-3 py-2.5 transition-colors',
                      checked
                        ? 'border-[oklch(70%_0.1_170)] bg-[oklch(96.5%_0.035_170)]'
                        : 'border-transparent hover:bg-muted',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={checked}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <label htmlFor={`service-${service.id}`} className="cursor-pointer text-sm">
                        {service.name}
                      </label>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(service.price)}</span>
                  </div>
                );
              })}
            </div>
            {totalPrice > 0 && (
              <div className="flex justify-between gap-3 border-t border-border pt-2.5 font-bold">
                <span>Total</span>
                <span className="font-display">{formatCurrency(totalPrice)}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 pt-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {order ? 'Guardar Cambios' : 'Crear Trabajo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
