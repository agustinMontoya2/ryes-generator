import type { OrderStatus } from '../types';

export interface Envelope<T> {
  statusCode: number;
  message: string;
  details: { path: string; timestamp: string };
  payload: T;
}

export interface ErrorEnvelope {
  statusCode: number;
  errorCode?: string;
  message: string;
  identifier?: string;
  property?: string;
  details?: unknown;
  metadata?: unknown;
}

export interface Pagination {
  totalItems: number;
  limit: number;
  currentPage: number;
  pages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface GenericID {
  id: string;
}

export interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderType?: string;
}

export interface ListOrdersParams extends ListParams {
  status?: OrderStatus;
  branchId: string;
}

export interface CreatePatientDto {
  fullname: string;
  dni: number;
}

export type UpdatePatientDto = Partial<CreatePatientDto>;

export interface CreateDentistDto {
  name: string;
  lastname: string;
}

export type UpdateDentistDto = Partial<CreateDentistDto>;

export interface CreateServiceDto {
  name: string;
  price: number;
}

export type UpdateServiceDto = Partial<CreateServiceDto>;

export interface OrderPatientDto {
  id?: string;
  fullname: string;
  dni: number;
}

export interface OrderDentistDto {
  id?: string;
  name: string;
  lastname: string;
}

export interface CreateOrderDto {
  patient: OrderPatientDto;
  dentist: OrderDentistDto;
  serviceIds: string[];
  dispatchDate: string;
  dueDate: string;
  lab?: string | null;
}

export type UpdateOrderDto = CreateOrderDto;

export interface CreateReportDto {
  orderIds: string[];
  deliveryDate: string;
}
