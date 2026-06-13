import { useState, useEffect } from 'react';
import { Order, Patient, Dentist, Service } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';

interface OrderFormProps {
  order?: Order | null;
  patients: Patient[];
  dentists: Dentist[];
  services: Service[];
  onSubmit: (order: Partial<Order>) => void;
  onCancel: () => void;
  onAddPatient: (patient: Partial<Patient>) => Patient;
}

export function OrderForm({
  order,
  patients,
  dentists,
  services,
  onSubmit,
  onCancel,
  onAddPatient,
}: OrderFormProps) {
  const [formData, setFormData] = useState({
    patientDni: order?.patient.dni.toString() || '',
    patientName: order?.patient.fullname || '',
    dentistName: order ? `${order.dentist.name} ${order.dentist.lastname}` : '',
    dispatchDate: order?.dispatchDate || new Date().toISOString().split('T')[0],
    dueDate: order?.dueDate || '',
    lab: order?.lab || 'Lab Central',
    selectedServices: order?.services.map(s => s.id) || [],
  });

  const [dentistSuggestions, setDentistSuggestions] = useState<Dentist[]>([]);
  const [showDentistSuggestions, setShowDentistSuggestions] = useState(false);
  const [existingPatient, setExistingPatient] = useState<Patient | null>(null);
  const [isPatientNameDisabled, setIsPatientNameDisabled] = useState(false);

  useEffect(() => {
    const dni = parseInt(formData.patientDni);
    if (!isNaN(dni)) {
      const foundPatient = patients.find(p => p.dni === dni);
      if (foundPatient) {
        setExistingPatient(foundPatient);
        setFormData(prev => ({ ...prev, patientName: foundPatient.fullname }));
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
      const filtered = dentists.filter(d => {
        const fullName = `${d.name} ${d.lastname}`.toLowerCase();
        return fullName.includes(formData.dentistName.toLowerCase());
      });
      setDentistSuggestions(filtered);
    } else {
      setDentistSuggestions([]);
    }
  }, [formData.dentistName, dentists]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedServices = services.filter(s => formData.selectedServices.includes(s.id));

    if (!formData.patientDni || !formData.patientName || !formData.dentistName || selectedServices.length === 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (!existingPatient && !formData.patientName.trim()) {
      alert('Debe ingresar el nombre del paciente');
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
    const existingDentist = dentists.find(d =>
      `${d.name} ${d.lastname}`.toLowerCase() === formData.dentistName.toLowerCase()
    );

    if (existingDentist) {
      dentist = existingDentist;
    } else {
      const nameParts = formData.dentistName.trim().split(' ');
      const name = nameParts[0] || formData.dentistName;
      const lastname = nameParts.slice(1).join(' ') || '';
      dentist = {
        id: String(dentists.length + 1),
        name,
        lastname,
      };
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
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const totalPrice = services
    .filter(s => formData.selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {order ? 'Editar Orden' : 'Nueva Orden'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientDni">DNI del Paciente *</Label>
              <Input
                id="patientDni"
                type="number"
                value={formData.patientDni}
                onChange={(e) => setFormData(prev => ({ ...prev, patientDni: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
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
                value={formData.dentistName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, dentistName: e.target.value }));
                  setShowDentistSuggestions(true);
                }}
                onFocus={() => setShowDentistSuggestions(true)}
                placeholder="Ingrese nombre del odontólogo"
                required
                autoComplete="off"
              />
              {showDentistSuggestions && dentistSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {dentistSuggestions.map((dentist) => (
                    <div
                      key={dentist.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          dentistName: `${dentist.name} ${dentist.lastname}`
                        }));
                        setShowDentistSuggestions(false);
                      }}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, dispatchDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Entrega *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lab">Laboratorio</Label>
              <Input
                id="lab"
                value={formData.lab}
                onChange={(e) => setFormData(prev => ({ ...prev, lab: e.target.value }))}
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
                      <label
                        htmlFor={`service-${service.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {service.name}
                      </label>
                    </div>
                    <span className="text-sm font-medium">
                      ${service.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              {totalPrice > 0 && (
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total:</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {order ? 'Guardar Cambios' : 'Crear Orden'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
