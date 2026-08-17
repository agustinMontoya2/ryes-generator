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
import { toErrorMessage } from '../api/client';
import { listPatients } from '../api/patients';
import { listDentists } from '../api/dentists';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { sumServices } from '../utils/orders';
import { formatCurrency, toDateOnly } from '../utils/format';

interface OrderFormProps {
  order?: Order | null;
  branchId: string;
  services: Service[];
  servicesLoading?: boolean;
  onSubmit: (order: OrderInput) => void;
  onCancel: () => void;
}

export function OrderForm({
  order,
  branchId,
  services,
  servicesLoading = false,
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const [formData, setFormData] = useState({
    patientDni: order?.patient.dni.toString() || '',
    patientName: order?.patient.fullname || '',
    dentistName: order ? `${order.dentist.name} ${order.dentist.lastname}` : '',
    dispatchDate: toDateOnly(order?.dispatchDate ?? '') || new Date().toISOString().split('T')[0],
    dueDate: toDateOnly(order?.dueDate ?? ''),
    lab: order?.lab || 'Lab Central',
    selectedServices: order?.services.map((s) => s.id) || [],
  });

  const [existingPatient, setExistingPatient] = useState<Patient | null>(order?.patient ?? null);
  const [isPatientNameDisabled, setIsPatientNameDisabled] = useState(order ? true : false);

  const [patientSuggestions, setPatientSuggestions] = useState<Patient[]>([]);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [activePatientSuggestion, setActivePatientSuggestion] = useState(-1);
  const [patientSearching, setPatientSearching] = useState(false);

  const [dentistSuggestions, setDentistSuggestions] = useState<Dentist[]>([]);
  const [showDentistSuggestions, setShowDentistSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [dentistSearching, setDentistSearching] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(order?.dentist ?? null);

  const patientDniTouched = useRef(false);
  const dentistTouched = useRef(false);

  useEffect(() => {
    const dniRaw = formData.patientDni.trim();
    if (!patientDniTouched.current) return;

    if (!dniRaw) {
      setPatientSuggestions([]);
      setPatientSearching(false);
      return;
    }

    setPatientSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await listPatients({ branchId, search: dniRaw, limit: 10 });
        setPatientSuggestions(res.data);
        const dniNumber = parseInt(dniRaw);
        const exact = res.data.find((p) => p.dni === dniNumber);
        if (exact) {
          setExistingPatient(exact);
          setFormData((prev) => ({ ...prev, patientName: exact.fullname }));
          setIsPatientNameDisabled(true);
          setShowPatientSuggestions(false);
          setActivePatientSuggestion(-1);
        }
      } catch (err) {
        setPatientSuggestions([]);
        toast.error(toErrorMessage(err));
      } finally {
        setPatientSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.patientDni, branchId]);

  useEffect(() => {
    const name = formData.dentistName.trim();
    if (!dentistTouched.current) return;

    if (!name) {
      setDentistSuggestions([]);
      setDentistSearching(false);
      return;
    }

    setDentistSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await listDentists({ branchId, search: name, limit: 10 });
        setDentistSuggestions(res.data);
        const exact = res.data.find(
          (d) => `${d.name} ${d.lastname}`.toLowerCase() === name.toLowerCase(),
        );
        if (exact) {
          setFormData((prev) => ({
            ...prev,
            dentistName: `${exact.name} ${exact.lastname}`,
          }));
          setSelectedDentist(exact);
          setShowDentistSuggestions(false);
          setActiveSuggestion(-1);
        }
      } catch (err) {
        setDentistSuggestions([]);
        toast.error(toErrorMessage(err));
      } finally {
        setDentistSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.dentistName, branchId]);

  const selectPatient = (patient: Patient) => {
    setExistingPatient(patient);
    setFormData((prev) => ({
      ...prev,
      patientDni: patient.dni.toString(),
      patientName: patient.fullname,
    }));
    setIsPatientNameDisabled(true);
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
    setSelectedDentist(dentist);
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
      !formData.patientDni ||
      !formData.patientName ||
      !formData.dentistName ||
      selectedServices.length === 0
    ) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (formData.dispatchDate && formData.dueDate && formData.dueDate < formData.dispatchDate) {
      toast.error('La fecha de entrega no puede ser menor a la fecha de despacho');
      return;
    }

    const dentistInput: DentistInput = selectedDentist
      ? {
          id: selectedDentist.id,
          name: selectedDentist.name,
          lastname: selectedDentist.lastname,
        }
      : {
          name: formData.dentistName.trim().split(' ')[0] || formData.dentistName,
          lastname: formData.dentistName.trim().split(' ').slice(1).join(' ') || '',
        };

    const patientInput: PatientInput = existingPatient
      ? {
          id: existingPatient.id,
          fullname: existingPatient.fullname,
          dni: existingPatient.dni,
        }
      : {
          fullname: formData.patientName,
          dni: parseInt(formData.patientDni),
        };

    onSubmit({
      id: order?.id,
      patient: patientInput,
      dentist: dentistInput,
      serviceIds: formData.selectedServices,
      dispatchDate: formData.dispatchDate,
      dueDate: formData.dueDate,
      lab: formData.lab,
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

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? 'Editar Orden' : 'Nueva Orden'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="patientDni">DNI del Paciente *</Label>
            <Input
              id="patientDni"
              type="number"
              min="1"
              role="combobox"
              aria-expanded={showPatientSuggestions}
              aria-controls="patient-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activePatientSuggestion >= 0
                  ? `patient-suggestion-${patientSuggestions[activePatientSuggestion]?.id}`
                  : undefined
              }
              value={formData.patientDni}
              onChange={(e) => {
                patientDniTouched.current = true;
                const value = e.target.value;
                setFormData((prev) => {
                  const next = { ...prev, patientDni: value };
                  if (existingPatient && String(existingPatient.dni) !== value) {
                    next.patientName = '';
                  }
                  return next;
                });
                if (existingPatient && String(existingPatient.dni) !== value) {
                  setExistingPatient(null);
                  setIsPatientNameDisabled(false);
                }
                setShowPatientSuggestions(true);
              }}
              onKeyDown={handlePatientKeyDown}
              onFocus={() => setShowPatientSuggestions(true)}
              onBlur={() => setShowPatientSuggestions(false)}
              placeholder="Ingrese DNI"
              required
              autoComplete="off"
            />
            {showPatientSuggestions && formData.patientDni.trim() && (
              <div
                id="patient-suggestions"
                role="listbox"
                className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
              >
                {patientSearching ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
                ) : patientSuggestions.length > 0 ? (
                  patientSuggestions.map((patient, index) => (
                    <div
                      key={patient.id}
                      id={`patient-suggestion-${patient.id}`}
                      role="option"
                      aria-selected={index === activePatientSuggestion}
                      className={`px-3 py-2 cursor-pointer ${
                        index === activePatientSuggestion ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectPatient(patient);
                      }}
                      onMouseEnter={() => setActivePatientSuggestion(index)}
                    >
                      {patient.fullname} — DNI {patient.dni}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-blue-600">
                    DNI no encontrado. Se creará un nuevo paciente.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientName">Nombre del Paciente *</Label>
            <Input
              id="patientName"
              type="text"
              value={formData.patientName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  patientName: e.target.value,
                }))
              }
              placeholder="Ingrese nombre completo"
              required
              disabled={isPatientNameDisabled}
              className={isPatientNameDisabled ? 'bg-gray-100' : ''}
              onFocus={() => setShowPatientSuggestions(false)}
            />
            {existingPatient && (
              <p className="text-sm text-green-600">
                Paciente existente: {existingPatient.fullname}
              </p>
            )}
          </div>

          <div className="space-y-2 relative">
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
                dentistTouched.current = true;
                setFormData((prev) => ({
                  ...prev,
                  dentistName: e.target.value,
                }));
                setSelectedDentist(null);
                setShowDentistSuggestions(true);
              }}
              onKeyDown={handleDentistKeyDown}
              onFocus={() => setShowDentistSuggestions(true)}
              onBlur={() => setShowDentistSuggestions(false)}
              placeholder="Ingrese nombre del odontólogo"
              required
              autoComplete="off"
            />
            {showDentistSuggestions && formData.dentistName.trim() && (
              <div
                id="dentist-suggestions"
                role="listbox"
                className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
              >
                {dentistSearching ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
                ) : dentistSuggestions.length > 0 ? (
                  dentistSuggestions.map((dentist, index) => (
                    <div
                      key={dentist.id}
                      id={`dentist-suggestion-${dentist.id}`}
                      role="option"
                      aria-selected={index === activeSuggestion}
                      className={`px-3 py-2 cursor-pointer ${
                        index === activeSuggestion ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectDentist(dentist);
                      }}
                      onMouseEnter={() => setActiveSuggestion(index)}
                    >
                      Dr. {dentist.name} {dentist.lastname}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-blue-600">
                    Sin resultados. Se creará un nuevo odontólogo.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha de Entrega *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                min={formData.dispatchDate || undefined}
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

          <div className="space-y-2">
            <Label htmlFor="lab">Laboratorio</Label>
            <Input
              id="lab"
              value={formData.lab}
              onChange={(e) => setFormData((prev) => ({ ...prev, lab: e.target.value }))}
              placeholder="Nombre del laboratorio"
            />
          </div>

          <div className="space-y-2">
            <Label>Servicios * (seleccione al menos uno)</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {servicesLoading ? (
                <p className="text-sm text-gray-500">Cargando servicios…</p>
              ) : services.length === 0 ? (
                <p className="text-sm text-gray-500">No hay servicios cargados.</p>
              ) : (
                services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={formData.selectedServices.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <label htmlFor={`service-${service.id}`} className="text-sm cursor-pointer">
                        {service.name}
                      </label>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(service.price)}</span>
                  </div>
                ))
              )}
            </div>
            {totalPrice > 0 && (
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-3 pt-4 sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {order ? 'Guardar Cambios' : 'Crear Orden'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
