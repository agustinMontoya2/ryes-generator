import { useEffect, useState } from 'react';
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
import { sumServices } from '../utils/orders';
import { formatCurrency } from '../utils/format';

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
    patientDni: order?.patient.dni.toString() || '',
    patientName: order?.patient.fullname || '',
    dentistName: order ? `${order.dentist.name} ${order.dentist.lastname}` : '',
    dispatchDate: order?.dispatchDate || new Date().toISOString().split('T')[0],
    dueDate: order?.dueDate || '',
    lab: order?.lab || 'Lab Central',
    selectedServices: order?.services.map((s) => s.id) || [],
  });

  const [dentistSuggestions, setDentistSuggestions] = useState<Dentist[]>([]);
  const [showDentistSuggestions, setShowDentistSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [existingPatient, setExistingPatient] = useState<Patient | null>(null);
  const [isPatientNameDisabled, setIsPatientNameDisabled] = useState(false);

  useEffect(() => {
    const dni = parseInt(formData.patientDni);
    if (!isNaN(dni)) {
      const foundPatient = patients.find((p) => p.dni === dni);
      if (foundPatient) {
        setExistingPatient(foundPatient);
        setFormData((prev) => ({ ...prev, patientName: foundPatient.fullname }));
        setIsPatientNameDisabled(true);
      } else {
        setExistingPatient(null);
        setIsPatientNameDisabled(false);
      }
    } else {
      setExistingPatient(null);
      setIsPatientNameDisabled(false);
    }
  }, [formData.patientDni, patients]);

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
      !formData.patientDni ||
      !formData.patientName ||
      !formData.dentistName ||
      selectedServices.length === 0
    ) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    let patient: Patient;
    if (existingPatient) {
      patient = existingPatient;
    } else {
      patient = onAddPatient({
        fullname: formData.patientName,
        dni: parseInt(formData.patientDni),
      });
    }

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

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? 'Editar Orden' : 'Nueva Orden'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientDni">DNI del Paciente *</Label>
            <Input
              id="patientDni"
              type="number"
              value={formData.patientDni}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  patientDni: e.target.value,
                }))
              }
              placeholder="Ingrese DNI"
              required
            />
            {existingPatient && (
              <p className="text-sm text-green-600">
                Paciente encontrado: {existingPatient.fullname}
              </p>
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
            />
            {!existingPatient && formData.patientDni && (
              <p className="text-sm text-blue-600">
                DNI no encontrado. Se creará un nuevo paciente.
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
                className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
              >
                {dentistSuggestions.map((dentist, index) => (
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
                ))}
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
              {services.map((service) => (
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
              ))}
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
