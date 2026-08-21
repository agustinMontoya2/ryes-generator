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
import { AppShell } from '../components/AppShell';
import { TopBar } from '../components/TopBar';
import { TabBar } from '../components/TabBar';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/ui/button';
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
  Users,
  UserCheck,
  Briefcase,
  FileText,
  ClipboardList,
  ArrowLeft,
  Loader2,
  Trash2,
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
  const { data: orders = [], isLoading: ordersLoading } = useOrders(branchId, 'all', {
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

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const submittedCount = orders.filter((o) => o.status === 'submitted').length;

  if (branchesLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Cargando…</span>
        </div>
      </main>
    );
  }

  if (!branch) {
    return (
      <AppShell className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-[58px] items-center justify-center rounded-[17px] bg-muted text-muted-foreground">
          <FileText className="size-6" />
        </div>
        <div>
          <h2 className="font-display text-[15px] font-bold">Laboratorio no encontrado</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            La sucursal no existe o fue eliminada.
          </p>
        </div>
        <Link to="/">
          <Button>
            <ArrowLeft className="size-4" />
            Volver al listado
          </Button>
        </Link>
      </AppShell>
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
        toast.success('Orden eliminada');
      } else if (type === 'patient') {
        await deletePatientMutation.mutateAsync({ branchId, id: targetId });
        toast.success('Paciente eliminado');
      } else if (type === 'dentist') {
        await deleteDentistMutation.mutateAsync({ branchId, id: targetId });
        toast.success('Odontologo eliminado');
      } else if (type === 'service') {
        await deleteServiceMutation.mutateAsync({ branchId, id: targetId });
        toast.success('Servicio eliminado');
      } else {
        await deleteReportMutation.mutateAsync({ branchId, id: targetId });
        toast.success('Remito eliminado');
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const activeDeleteMessage = deleteTarget ? deleteMessages[deleteTarget.type] : null;

  const tabs = [
    { value: 'orders', label: 'Trabajos', icon: ClipboardList },
    { value: 'patients', label: 'Pacientes', icon: UserCheck },
    { value: 'dentists', label: 'Odontólogos', icon: Users },
    { value: 'services', label: 'Servicios', icon: Briefcase },
    { value: 'reports', label: 'Remitos', icon: FileText },
  ];

  return (
    <>
      <AppShell className="flex flex-col gap-7">
        <TopBar showBack subtitle={branch.location} />

        {view === 'orders' && (
          <section className="space-y-5">
            <PageHero
              eyebrow="Gestión de trabajos"
              title="Trabajos"
              subtitle={`${pendingCount} pendientes · ${completedCount} completadas · ${submittedCount} entregadas`}
              action={
                <Button onClick={handleCreateOrder}>
                  <Plus className="size-4" />
                  Nuevo Trabajo
                </Button>
              }
            />

            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as OrderStatus | 'all')}
            >
              <SelectTrigger aria-label="Filtrar por estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({orders.length})</SelectItem>
                <SelectItem value="pending">Pendientes ({pendingCount})</SelectItem>
                <SelectItem value="completed">Completadas ({completedCount})</SelectItem>
                <SelectItem value="submitted">Entregadas ({submittedCount})</SelectItem>
              </SelectContent>
            </Select>

            {ordersLoading && orders.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span>Cargando trabajos…</span>
              </div>
            ) : (
              <OrderList
                orders={filteredOrders}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                onComplete={handleCompleteOrder}
                onRequestGenerateReport={handleRequestGenerateReport}
                selectedOrders={selectedOrders}
                onToggleSelect={handleToggleSelectOrder}
              />
            )}
          </section>
        )}

        {view === 'patients' && (
          <section className="space-y-5">
            <PageHero
              eyebrow="Agenda del laboratorio"
              title="Pacientes"
              subtitle={`${patients.length} pacientes registrados`}
              action={
                <Button onClick={handleCreatePatient}>
                  <Plus className="size-4" />
                  Nuevo Paciente
                </Button>
              }
            />
            <PatientList
              patients={patients}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
            />
          </section>
        )}

        {view === 'dentists' && (
          <section className="space-y-5">
            <PageHero
              eyebrow="Profesionales"
              title="Odontólogos"
              subtitle={`${dentists.length} profesionales registrados`}
              action={
                <Button onClick={handleCreateDentist}>
                  <Plus className="size-4" />
                  Nuevo Odontólogo
                </Button>
              }
            />
            <DentistList
              dentists={dentists}
              onEdit={handleEditDentist}
              onDelete={handleDeleteDentist}
            />
          </section>
        )}

        {view === 'services' && (
          <section className="space-y-5">
            <PageHero
              eyebrow="Precios del laboratorio"
              title="Servicios"
              subtitle={`${services.length} servicios de lista`}
              action={
                <Button onClick={handleCreateService}>
                  <Plus className="size-4" />
                  Nuevo Servicio
                </Button>
              }
            />
            <ServiceList
              services={services}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          </section>
        )}

        {view === 'reports' && (
          <section className="space-y-5">
            <PageHero
              eyebrow="Entregas realizadas"
              title="Remitos"
              subtitle={`${reports.length} remitos generados`}
            />
            {reportsLoading && reports.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span>Cargando remitos…</span>
              </div>
            ) : (
              <JobReportList
                reports={reports}
                onView={handleViewReport}
                onDelete={handleDeleteReport}
              />
            )}
          </section>
        )}
      </AppShell>

      <TabBar tabs={tabs} value={view} onChange={(v) => setView(v as View)} />

      {showOrderForm && (
        <OrderForm
          order={editingOrder}
          branchId={branchId}
          services={services}
          servicesLoading={servicesLoading}
          isSubmitting={createOrderMutation.isPending || updateOrderMutation.isPending}
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
            <div className="flex size-[42px] items-center justify-center rounded-[13px] bg-[oklch(94%_0.04_25)] text-destructive">
              <Trash2 className="size-5" />
            </div>
            <AlertDialogTitle className="mt-1 text-lg">
              {activeDeleteMessage?.title}
            </AlertDialogTitle>
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
    </>
  );
}
