import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { toast } from 'sonner';
import type {
  Order,
  OrderInput,
  OrderStatus,
  Dentist,
  DentistInput,
  Patient,
  PatientInput,
  Service,
  ServiceInput,
  JobReport,
} from '../types';
import { toErrorMessage } from '../api/client';
import {
  useBranches,
  usePatients,
  useDentists,
  useServices,
  useOrders,
  useReports,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  useCreateDentist,
  useUpdateDentist,
  useDeleteDentist,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  useCompleteOrder,
  useCreateReport,
  useDeleteReport,
} from '../hooks/queries';
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
  Loader2,
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
  | { type: 'service'; id: string }
  | { type: 'report'; id: string };

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
  report: {
    title: 'Eliminar remito',
    description: '¿Está seguro que desea eliminar este remito? Esta acción no se puede deshacer.',
  },
};

export function BranchDashboard() {
  const { id } = useParams<{ id: string }>();
  const branchId = id ?? '';

  const [view, setView] = useState<View>('orders');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
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

  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: orders = [], isLoading: ordersLoading } = useOrders(branchId, filterStatus, {
    enabled: view === 'orders',
  });
  const { data: patients = [] } = usePatients(branchId, { enabled: view === 'patients' });
  const { data: dentists = [] } = useDentists(branchId, { enabled: view === 'dentists' });
  const { data: services = [], isLoading: servicesLoading } = useServices(branchId, {
    enabled: view === 'services' || showOrderForm,
  });
  const { data: reports = [], isLoading: reportsLoading } = useReports(branchId, {
    enabled: view === 'reports',
  });

  const branch = branches?.find((b) => b.id === branchId);

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();
  const createDentistMutation = useCreateDentist();
  const updateDentistMutation = useUpdateDentist();
  const deleteDentistMutation = useDeleteDentist();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();
  const completeOrderMutation = useCompleteOrder();
  const createReportMutation = useCreateReport();
  const deleteReportMutation = useDeleteReport();

  if (branchesLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando…</span>
        </div>
      </main>
    );
  }

  if (!branch) {
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

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setShowOrderForm(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const handleSubmitOrder = async (orderData: OrderInput) => {
    try {
      const { id, ...dto } = orderData;
      if (id) {
        await updateOrderMutation.mutateAsync({ branchId, id, dto });
        toast.success('Orden actualizada');
      } else {
        await createOrderMutation.mutateAsync({ branchId, dto });
        toast.success('Orden creada');
      }
      setShowOrderForm(false);
      setEditingOrder(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const handleDeleteOrder = (orderId: string) => setDeleteTarget({ type: 'order', id: orderId });

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await completeOrderMutation.mutateAsync({ branchId, id: orderId });
      toast.success('Orden completada');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
    );
  };

  const handleRequestGenerateReport = (selectedOrdersList: Order[]) => {
    setReportOrders(selectedOrdersList);
    setShowReportDialog(true);
  };

  const handleGenerateReport = async (orderIds: string[], deliveryDate: string) => {
    try {
      await createReportMutation.mutateAsync({ branchId, dto: { orderIds, deliveryDate } });
      toast.success('Remito generado');
      setSelectedOrders([]);
      setShowReportDialog(false);
      setView('reports');
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
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

  const handleSubmitDentist = async (dentistData: DentistInput) => {
    try {
      const { id, ...dto } = dentistData;
      if (id) {
        await updateDentistMutation.mutateAsync({ branchId, id, dto });
        toast.success('Odontólogo actualizado');
      } else {
        await createDentistMutation.mutateAsync({ branchId, dto });
        toast.success('Odontólogo creado');
      }
      setShowDentistForm(false);
      setEditingDentist(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
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

  const handleSubmitPatient = async (patientData: PatientInput) => {
    try {
      const { id, ...dto } = patientData;
      if (id) {
        await updatePatientMutation.mutateAsync({
          branchId,
          id,
          dto,
        });
        toast.success('Paciente actualizado');
      } else {
        await createPatientMutation.mutateAsync({ branchId, dto });
        toast.success('Paciente creado');
      }
      setShowPatientForm(false);
      setEditingPatient(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
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

  const handleSubmitService = async (serviceData: ServiceInput) => {
    try {
      const { id, ...dto } = serviceData;
      if (id) {
        await updateServiceMutation.mutateAsync({
          branchId,
          id,
          dto,
        });
        toast.success('Servicio actualizado');
      } else {
        await createServiceMutation.mutateAsync({ branchId, dto });
        toast.success('Servicio creado');
      }
      setShowServiceForm(false);
      setEditingService(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const handleDeleteService = (serviceId: string) =>
    setDeleteTarget({ type: 'service', id: serviceId });

  const handleDeleteReport = (reportId: string) =>
    setDeleteTarget({ type: 'report', id: reportId });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id: targetId } = deleteTarget;

    try {
      if (type === 'order') {
        await deleteOrderMutation.mutateAsync({ branchId, id: targetId });
        setSelectedOrders((prev) => prev.filter((oId) => oId !== targetId));
      } else if (type === 'patient') {
        await deletePatientMutation.mutateAsync({ branchId, id: targetId });
      } else if (type === 'dentist') {
        await deleteDentistMutation.mutateAsync({ branchId, id: targetId });
      } else if (type === 'service') {
        await deleteServiceMutation.mutateAsync({ branchId, id: targetId });
      } else {
        await deleteReportMutation.mutateAsync({ branchId, id: targetId });
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const activeDeleteMessage = deleteTarget ? deleteMessages[deleteTarget.type] : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <header className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a sucursales
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-1">{branch.location}</h1>
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
                <Select
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v as OrderStatus | 'all')}
                >
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

            {ordersLoading && orders.length === 0 ? (
              <div className="flex items-center justify-center gap-2 text-gray-500 py-12">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Cargando órdenes…</span>
              </div>
            ) : (
              <OrderList
                orders={orders}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                onComplete={handleCompleteOrder}
                onRequestGenerateReport={handleRequestGenerateReport}
                selectedOrders={selectedOrders}
                onToggleSelect={handleToggleSelectOrder}
              />
            )}
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleCreatePatient}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Paciente
              </Button>
            </div>

            <PatientList
              patients={patients}
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
              dentists={dentists}
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
              services={services}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reportsLoading && reports.length === 0 ? (
              <div className="flex items-center justify-center gap-2 text-gray-500 py-12">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Cargando remitos…</span>
              </div>
            ) : (
              <JobReportList
                reports={reports}
                onView={handleViewReport}
                onDelete={handleDeleteReport}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showOrderForm && (
        <OrderForm
          order={editingOrder}
          branchId={branchId}
          services={services}
          servicesLoading={servicesLoading}
          onSubmit={handleSubmitOrder}
          onCancel={() => {
            setShowOrderForm(false);
            setEditingOrder(null);
          }}
        />
      )}

      {showPatientForm && (
        <PatientForm
          patient={editingPatient}
          branchId={branchId}
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
          branchId={branchId}
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
          branchId={branchId}
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
