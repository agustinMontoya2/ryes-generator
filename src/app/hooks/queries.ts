import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Branch, Dentist, JobReport, Order, OrderStatus, Patient, Service } from '../types';
import { getBranches } from '../api/branches';
import { createPatient, deletePatient, listPatients, updatePatient } from '../api/patients';
import { createDentist, deleteDentist, listDentists, updateDentist } from '../api/dentists';
import { createService, deleteService, listServices, updateService } from '../api/services';
import { completeOrder, createOrder, deleteOrder, listOrders, updateOrder } from '../api/orders';
import { createReport, deleteReport, listReports } from '../api/reports';
import type {
  CreateDentistDto,
  CreateOrderDto,
  CreatePatientDto,
  CreateReportDto,
  CreateServiceDto,
  UpdateDentistDto,
  UpdateOrderDto,
  UpdatePatientDto,
  UpdateServiceDto,
} from '../api/types';

const LIST_LIMIT = 100;

export const queryKeys = {
  branches: ['branches'] as const,
  patients: (branchId: string) => ['patients', branchId] as const,
  dentists: (branchId: string) => ['dentists', branchId] as const,
  services: (branchId: string) => ['services', branchId] as const,
  orders: (branchId: string) => ['orders', branchId] as const,
  reports: (branchId: string) => ['reports', branchId] as const,
};

// ---------------- Reads ----------------

export function useBranches() {
  return useQuery<Branch[]>({ queryKey: queryKeys.branches, queryFn: getBranches });
}

export function usePatients(branchId: string, options?: { enabled?: boolean }) {
  return useQuery<Patient[]>({
    queryKey: queryKeys.patients(branchId),
    queryFn: async () => {
      const res = await listPatients({ branchId, limit: LIST_LIMIT });
      return res.data;
    },
    enabled: !!branchId && (options?.enabled ?? true),
  });
}

export function useDentists(branchId: string, options?: { enabled?: boolean }) {
  return useQuery<Dentist[]>({
    queryKey: queryKeys.dentists(branchId),
    queryFn: async () => {
      const res = await listDentists({ branchId, limit: LIST_LIMIT });
      return res.data;
    },
    enabled: !!branchId && (options?.enabled ?? true),
  });
}

export function useServices(branchId: string, options?: { enabled?: boolean }) {
  return useQuery<Service[]>({
    queryKey: queryKeys.services(branchId),
    queryFn: async () => {
      const res = await listServices({ branchId, limit: LIST_LIMIT });
      return res.data;
    },
    enabled: !!branchId && (options?.enabled ?? true),
  });
}

export function useOrders(
  branchId: string,
  status: OrderStatus | 'all' = 'all',
  options?: { enabled?: boolean },
) {
  return useQuery<Order[]>({
    queryKey: [...queryKeys.orders(branchId), status],
    queryFn: async () => {
      const res = await listOrders({
        branchId,
        limit: LIST_LIMIT,
        status: status === 'all' ? undefined : status,
      });
      return res.data;
    },
    enabled: !!branchId && (options?.enabled ?? true),
    placeholderData: keepPreviousData,
  });
}

export function useReports(branchId: string, options?: { enabled?: boolean }) {
  return useQuery<JobReport[]>({
    queryKey: queryKeys.reports(branchId),
    queryFn: async () => {
      const res = await listReports({ branchId, limit: LIST_LIMIT });
      return res.data;
    },
    enabled: !!branchId && (options?.enabled ?? true),
  });
}

// ---------------- Patients ----------------

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, dto }: { branchId: string; dto: CreatePatientDto }) =>
      createPatient(dto, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients(vars.branchId) });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id, dto }: { branchId: string; id: string; dto: UpdatePatientDto }) =>
      updatePatient(id, dto, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients(vars.branchId) });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id }: { branchId: string; id: string }) => deletePatient(id, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients(vars.branchId) });
    },
  });
}

// ---------------- Dentists ----------------

export function useCreateDentist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, dto }: { branchId: string; dto: CreateDentistDto }) =>
      createDentist(dto, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dentists(vars.branchId) });
    },
  });
}

export function useUpdateDentist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id, dto }: { branchId: string; id: string; dto: UpdateDentistDto }) =>
      updateDentist(id, dto, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dentists(vars.branchId) });
    },
  });
}

export function useDeleteDentist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id }: { branchId: string; id: string }) => deleteDentist(id, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dentists(vars.branchId) });
    },
  });
}

// ---------------- Services ----------------

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, dto }: { branchId: string; dto: CreateServiceDto }) =>
      createService(dto, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services(vars.branchId) });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id, dto }: { branchId: string; id: string; dto: UpdateServiceDto }) =>
      updateService(id, dto, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services(vars.branchId) });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id }: { branchId: string; id: string }) => deleteService(id, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services(vars.branchId) });
    },
  });
}

// ---------------- Orders ----------------

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, dto }: { branchId: string; dto: CreateOrderDto }) =>
      createOrder(dto, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(vars.branchId) });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id, dto }: { branchId: string; id: string; dto: UpdateOrderDto }) =>
      updateOrder(id, dto, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(vars.branchId) });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id }: { branchId: string; id: string }) => deleteOrder(id, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(vars.branchId) });
    },
  });
}

export function useCompleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id }: { branchId: string; id: string }) => completeOrder(id, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(vars.branchId) });
    },
  });
}

// ---------------- Reports ----------------

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, dto }: { branchId: string; dto: CreateReportDto }) =>
      createReport(dto, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports(vars.branchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(vars.branchId) });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, id }: { branchId: string; id: string }) => deleteReport(id, branchId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports(vars.branchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders(vars.branchId) });
    },
  });
}
