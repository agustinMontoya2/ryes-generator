import { useState } from 'react';
import { useParams, Link } from 'react-router';
import type {
  Order,
  OrderInput,
  Dentist,
  DentistInput,
  Patient,
  PatientInput,
  Service,
  ServiceInput,
  JobReport,
} from '../types';
import { mockOrders, mockPatients, mockDentists, mockServices, mockRyes } from '../data/mockData';
import { useCollection } from '../utils/useCollection';
import { sumOrders } from '../utils/orders';
import { OrderList } from '../components/OrderList';
import { OrderForm } from '../components/OrderForm';
import { DentistList } from '../components/DentistList';
import { DentistForm } from '../components/DentistForm';
import { PatientList } from '../components/PatientList';
import { PatientForm } from '../components/PatientForm';
import { ServiceList } from '../components/ServiceList';
import { ServiceForm } from '../components/ServiceForm';
import { JobReportList } from '../components/JobReportList';
import { JobReportView } from '../components/JobReportView';
import { JobReportDialog } from '../components/JobReportDialog';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Plus,
  ClipboardList,
  Users,
  Filter,
  UserCheck,
  Briefcase,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

type View = 'orders' | 'dentists' | 'patients' | 'services' | 'reports';

type DeleteTarget =
  | { type: 'order'; id: string }
  | { type: 'patient'; id: string }
  | { type: 'dentist'; id: string }
  | { type: 'service'; id: string };

const deleteMessages: Record<DeleteTarget['type'], { title: string; description: string }> = {
  order: {
    title: 'Eliminar orden',
    description: '¿Está seguro que desea eliminar esta orden? Esta acción no se puede deshacer.',
  },
  patient: {
    title: 'Eliminar paciente',
    description: '¿Está seguro que desea eliminar este paciente? Esta acción no se puede deshacer.',
  },
  dentist: {
    title: 'Eliminar odontólogo',
    description:
      '¿Está seguro que desea eliminar este odontólogo? Esta acción no se puede deshacer.',
  },
  service: {
    title: 'Eliminar servicio',
    description: '¿Está seguro que desea eliminar este servicio? Esta acción no se puede deshacer.',
  },
};

export function RyesDashboard() {
  const { id } = useParams<{ id: string }>();
  const ryes = mockRyes.find((r) => r.id === id);

  const orders = useCollection<Order>(mockOrders);
  const dentists = useCollection<Dentist>(mockDentists);
  const patients = useCollection<Patient>(mockPatients);
  const services = useCollection<Service>(mockServices);
  const [reports, setReports] = useState<JobReport[]>([]);

  const [view, setView] = useState<View>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [showDentistForm, setShowDentistForm] = useState(false);
  const [editingDentist, setEditingDentist] = useState<Dentist | null>(null);

  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [currentReport, setCurrentReport] = useState<JobReport | null>(null);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportOrders, setReportOrders] = useState<Order[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  if (!ryes) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Laboratorio no encontrado</h2>
          <Link to="/">
            <Button>Volver al listado</Button>
          </Link>
        </div>
      </main>
    );
  }

  const filteredOrders = orders.items.filter((order) => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setShowOrderForm(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const handleSubmitOrder = (orderData: OrderInput) => {
    if (orderData.id) {
      orders.update(orderData.id, orderData);
    } else {
      orders.add({ ...orderData, status: 'pending' }, true);
    }
    setShowOrderForm(false);
    setEditingOrder(null);
  };

  const handleAddPatient = (patientData: PatientInput): Patient => patients.add(patientData);

  const handleAddDentist = (dentistData: DentistInput): Dentist => dentists.add(dentistData);

  const handleDeleteOrder = (orderId: string) => setDeleteTarget({ type: 'order', id: orderId });

  const handleCompleteOrder = (orderId: string) => orders.update(orderId, { status: 'completed' });

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
    );
  };

  const handleRequestGenerateReport = (selectedOrdersList: Order[]) => {
    setReportOrders(selectedOrdersList);
    setShowReportDialog(true);
  };

  const handleGenerateReport = (selectedOrdersList: Order[], deliveryDate: string) => {
    const totalPrice = sumOrders(selectedOrdersList);

    const report: JobReport = {
      id: crypto.randomUUID(),
      orders: selectedOrdersList,
      totalPrice,
      deliveryDate,
    };

    orders.setItems((prev) =>
      prev.map((o) =>
        selectedOrdersList.some((so) => so.id === o.id) ? { ...o, status: 'submitted' } : o,
      ),
    );

    setReports([report, ...reports]);
    setSelectedOrders([]);
    setCurrentReport(report);
    setShowReportDialog(false);
  };

  const handleViewReport = (report: JobReport) => {
    setCurrentReport(report);
  };

  const handleCreateDentist = () => {
    setEditingDentist(null);
    setShowDentistForm(true);
  };

  const handleEditDentist = (dentist: Dentist) => {
    setEditingDentist(dentist);
    setShowDentistForm(true);
  };

  const handleSubmitDentist = (dentistData: DentistInput) => {
    if (dentistData.id) {
      dentists.update(dentistData.id, dentistData);
    } else {
      dentists.add(dentistData);
    }
    setShowDentistForm(false);
    setEditingDentist(null);
  };

  const handleDeleteDentist = (dentistId: string) =>
    setDeleteTarget({ type: 'dentist', id: dentistId });

  const handleCreatePatient = () => {
    setEditingPatient(null);
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowPatientForm(true);
  };

  const handleSubmitPatient = (patientData: PatientInput) => {
    if (patientData.id) {
      patients.update(patientData.id, patientData);
    } else {
      patients.add(patientData);
    }
    setShowPatientForm(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = (patientId: string) =>
    setDeleteTarget({ type: 'patient', id: patientId });

  const handleCreateService = () => {
    setEditingService(null);
    setShowServiceForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleSubmitService = (serviceData: ServiceInput) => {
    if (serviceData.id) {
      services.update(serviceData.id, serviceData);
    } else {
      services.add(serviceData);
    }
    setShowServiceForm(false);
    setEditingService(null);
  };

  const handleDeleteService = (serviceId: string) =>
    setDeleteTarget({ type: 'service', id: serviceId });

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const { type, id: targetId } = deleteTarget;
    if (type === 'order') {
      orders.remove(targetId);
      setSelectedOrders((prev) => prev.filter((oId) => oId !== targetId));
    } else if (type === 'patient') {
      patients.remove(targetId);
    } else if (type === 'dentist') {
      dentists.remove(targetId);
    } else {
      services.remove(targetId);
    }
    setDeleteTarget(null);
  };

  const activeDeleteMessage = deleteTarget ? deleteMessages[deleteTarget.type] : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <header className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Ryes
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-1">{ryes.location}</h1>
          <p className="text-gray-600">Gestión de Órdenes</p>
        </header>

        <Tabs value={view} onValueChange={(v) => setView(v as View)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="orders" className="flex flex-col items-center gap-1 py-2">
              <ClipboardList className="w-4 h-4" />
              <span className="text-xs">Órdenes</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex flex-col items-center gap-1 py-2">
              <UserCheck className="w-4 h-4" />
              <span className="text-xs">Pacientes</span>
            </TabsTrigger>
            <TabsTrigger value="dentists" className="flex flex-col items-center gap-1 py-2">
              <Users className="w-4 h-4" />
              <span className="text-xs">Odontólogos</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex flex-col items-center gap-1 py-2">
              <Briefcase className="w-4 h-4" />
              <span className="text-xs">Servicios</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex flex-col items-center gap-1 py-2">
              <FileText className="w-4 h-4" />
              <span className="text-xs">Remitos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las órdenes</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="completed">Completadas</SelectItem>
                    <SelectItem value="submitted">Entregadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateOrder}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Orden
              </Button>
            </div>

            <OrderList
              orders={filteredOrders}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
              onComplete={handleCompleteOrder}
              onRequestGenerateReport={handleRequestGenerateReport}
              selectedOrders={selectedOrders}
              onToggleSelect={handleToggleSelectOrder}
            />
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleCreatePatient}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Paciente
              </Button>
            </div>

            <PatientList
              patients={patients.items}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
            />
          </TabsContent>

          <TabsContent value="dentists" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleCreateDentist}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Odontólogo
              </Button>
            </div>

            <DentistList
              dentists={dentists.items}
              onEdit={handleEditDentist}
              onDelete={handleDeleteDentist}
            />
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleCreateService}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Servicio
              </Button>
            </div>

            <ServiceList
              services={services.items}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <JobReportList reports={reports} onView={handleViewReport} />
          </TabsContent>
        </Tabs>
      </div>

      {showOrderForm && (
        <OrderForm
          order={editingOrder}
          patients={patients.items}
          dentists={dentists.items}
          services={services.items}
          onSubmit={handleSubmitOrder}
          onAddPatient={handleAddPatient}
          onAddDentist={handleAddDentist}
          onCancel={() => {
            setShowOrderForm(false);
            setEditingOrder(null);
          }}
        />
      )}

      {showPatientForm && (
        <PatientForm
          patient={editingPatient}
          onSubmit={handleSubmitPatient}
          onCancel={() => {
            setShowPatientForm(false);
            setEditingPatient(null);
          }}
        />
      )}

      {showDentistForm && (
        <DentistForm
          dentist={editingDentist}
          onSubmit={handleSubmitDentist}
          onCancel={() => {
            setShowDentistForm(false);
            setEditingDentist(null);
          }}
        />
      )}

      {showServiceForm && (
        <ServiceForm
          service={editingService}
          onSubmit={handleSubmitService}
          onCancel={() => {
            setShowServiceForm(false);
            setEditingService(null);
          }}
        />
      )}

      {currentReport && (
        <JobReportView report={currentReport} onClose={() => setCurrentReport(null)} />
      )}

      {showReportDialog && (
        <JobReportDialog
          orders={reportOrders}
          onSubmit={handleGenerateReport}
          onCancel={() => setShowReportDialog(false)}
        />
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{activeDeleteMessage?.title}</AlertDialogTitle>
            <AlertDialogDescription>{activeDeleteMessage?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
