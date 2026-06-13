import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Order,
  Dentist,
  Patient,
  Service,
  JobReport,
} from "../types";
import {
  mockOrders,
  mockPatients,
  mockDentists,
  mockServices,
  mockRyes,
} from "../data/mockData";
import { OrderList } from "../components/OrderList";
import { OrderForm } from "../components/OrderForm";
import { DentistList } from "../components/DentistList";
import { DentistForm } from "../components/DentistForm";
import { PatientList } from "../components/PatientList";
import { PatientForm } from "../components/PatientForm";
import { ServiceList } from "../components/ServiceList";
import { ServiceForm } from "../components/ServiceForm";
import { JobReportList } from "../components/JobReportList";
import { JobReportView } from "../components/JobReportView";
import { JobReportDialog } from "../components/JobReportDialog";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Plus,
  ClipboardList,
  Users,
  Filter,
  UserCheck,
  Briefcase,
  FileText,
  ArrowLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type View =
  | "orders"
  | "dentists"
  | "patients"
  | "services"
  | "reports";

export function RyesDashboard() {
  const { id } = useParams<{ id: string }>();
  const ryes = mockRyes.find((r) => r.id === id);

  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [dentists, setDentists] =
    useState<Dentist[]>(mockDentists);
  const [patients, setPatients] =
    useState<Patient[]>(mockPatients);
  const [services, setServices] =
    useState<Service[]>(mockServices);
  const [reports, setReports] = useState<JobReport[]>([]);

  const [view, setView] = useState<View>("orders");
  const [filterStatus, setFilterStatus] =
    useState<string>("all");
  const [selectedOrders, setSelectedOrders] = useState<
    string[]
  >([]);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] =
    useState<Order | null>(null);

  const [showDentistForm, setShowDentistForm] = useState(false);
  const [editingDentist, setEditingDentist] =
    useState<Dentist | null>(null);

  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [currentReport, setCurrentReport] =
    useState<JobReport | null>(null);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportOrders, setReportOrders] = useState<Order[]>([]);

  if (!ryes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Laboratorio no encontrado
          </h2>
          <Link to="/">
            <Button>Volver al listado</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
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

  const handleSubmitOrder = (orderData: Partial<Order>) => {
    if (orderData.id) {
      setOrders(
        orders.map((o) =>
          o.id === orderData.id
            ? ({ ...o, ...orderData } as Order)
            : o,
        ),
      );
    } else {
      const newOrder: Order = {
        ...orderData,
        id: String(orders.length + 1),
        status: "pending",
      } as Order;
      setOrders([newOrder, ...orders]);
    }
    setShowOrderForm(false);
    setEditingOrder(null);
  };

  const handleAddPatient = (patientData: Partial<Patient>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: String(patients.length + 1),
    } as Patient;
    setPatients([...patients, newPatient]);
    return newPatient;
  };

  const handleDeleteOrder = (orderId: string) => {
    if (
      confirm("¿Está seguro que desea eliminar esta orden?")
    ) {
      setOrders(orders.filter((o) => o.id !== orderId));
      setSelectedOrders(
        selectedOrders.filter((id) => id !== orderId),
      );
    }
  };

  const handleCompleteOrder = (orderId: string) => {
    setOrders(
      orders.map((o) =>
        o.id === orderId
          ? { ...o, status: "completed" as const }
          : o,
      ),
    );
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleRequestGenerateReport = (
    selectedOrdersList: Order[],
  ) => {
    setReportOrders(selectedOrdersList);
    setShowReportDialog(true);
  };

  const handleGenerateReport = (
    selectedOrdersList: Order[],
    deliveryDate: string,
  ) => {
    const totalPrice = selectedOrdersList.reduce(
      (sum, order) =>
        sum +
        order.services.reduce(
          (s, service) => s + service.price,
          0,
        ),
      0,
    );

    const report: JobReport = {
      id: String(Date.now()),
      orders: selectedOrdersList,
      totalPrice,
      deliveryDate,
    };

    setOrders(
      orders.map((o) =>
        selectedOrdersList.find((so) => so.id === o.id)
          ? { ...o, status: "submitted" as const }
          : o,
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

  const handleSubmitDentist = (
    dentistData: Partial<Dentist>,
  ) => {
    if (dentistData.id) {
      setDentists(
        dentists.map((d) =>
          d.id === dentistData.id
            ? ({ ...d, ...dentistData } as Dentist)
            : d,
        ),
      );
    } else {
      const newDentist: Dentist = {
        ...dentistData,
        id: String(dentists.length + 1),
      } as Dentist;
      setDentists([...dentists, newDentist]);
    }
    setShowDentistForm(false);
    setEditingDentist(null);
  };

  const handleDeleteDentist = (dentistId: string) => {
    if (
      confirm(
        "¿Está seguro que desea eliminar este odontólogo?",
      )
    ) {
      setDentists(dentists.filter((d) => d.id !== dentistId));
    }
  };

  const handleCreatePatient = () => {
    setEditingPatient(null);
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowPatientForm(true);
  };

  const handleSubmitPatient = (
    patientData: Partial<Patient>,
  ) => {
    if (patientData.id) {
      setPatients(
        patients.map((p) =>
          p.id === patientData.id
            ? ({ ...p, ...patientData } as Patient)
            : p,
        ),
      );
    } else {
      const newPatient: Patient = {
        ...patientData,
        id: String(patients.length + 1),
      } as Patient;
      setPatients([...patients, newPatient]);
    }
    setShowPatientForm(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = (patientId: string) => {
    if (
      confirm("¿Está seguro que desea eliminar este paciente?")
    ) {
      setPatients(patients.filter((p) => p.id !== patientId));
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    setShowServiceForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleSubmitService = (
    serviceData: Partial<Service>,
  ) => {
    if (serviceData.id) {
      setServices(
        services.map((s) =>
          s.id === serviceData.id
            ? ({ ...s, ...serviceData } as Service)
            : s,
        ),
      );
    } else {
      const newService: Service = {
        ...serviceData,
        id: String(services.length + 1),
      } as Service;
      setServices([...services, newService]);
    }
    setShowServiceForm(false);
    setEditingService(null);
  };

  const handleDeleteService = (serviceId: string) => {
    if (
      confirm("¿Está seguro que desea eliminar este servicio?")
    ) {
      setServices(services.filter((s) => s.id !== serviceId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Ryes
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-1">
            {ryes.location}
          </h1>
          <p className="text-gray-600">Gestión de Órdenes</p>
        </div>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as View)}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger
              value="orders"
              className="flex flex-col items-center gap-1 py-2"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="text-xs">Órdenes</span>
            </TabsTrigger>
            <TabsTrigger
              value="patients"
              className="flex flex-col items-center gap-1 py-2"
            >
              <UserCheck className="w-4 h-4" />
              <span className="text-xs">Pacientes</span>
            </TabsTrigger>
            <TabsTrigger
              value="dentists"
              className="flex flex-col items-center gap-1 py-2"
            >
              <Users className="w-4 h-4" />
              <span className="text-xs">Odontólogos</span>
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="flex flex-col items-center gap-1 py-2"
            >
              <Briefcase className="w-4 h-4" />
              <span className="text-xs">Servicios</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex flex-col items-center gap-1 py-2"
            >
              <FileText className="w-4 h-4" />
              <span className="text-xs">Remitos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Todas las órdenes
                    </SelectItem>
                    <SelectItem value="pending">
                      Pendientes
                    </SelectItem>
                    <SelectItem value="completed">
                      Completadas
                    </SelectItem>
                    <SelectItem value="submitted">
                      Entregadas
                    </SelectItem>
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
            <JobReportList
              reports={reports}
              onView={handleViewReport}
            />
          </TabsContent>
        </Tabs>
      </div>

      {showOrderForm && (
        <OrderForm
          order={editingOrder}
          patients={patients}
          dentists={dentists}
          services={services}
          onSubmit={handleSubmitOrder}
          onAddPatient={handleAddPatient}
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
        <JobReportView
          report={currentReport}
          onClose={() => setCurrentReport(null)}
        />
      )}

      {showReportDialog && (
        <JobReportDialog
          orders={reportOrders}
          onSubmit={handleGenerateReport}
          onCancel={() => setShowReportDialog(false)}
        />
      )}
    </div>
  );
}