import { request } from './client';
import type { Service } from '../types';
import type { CreateServiceDto, GenericID, ListParams, Paginated, UpdateServiceDto } from './types';

interface ListServicesParams extends ListParams {
  branchId: string;
}

export function listServices(params: ListServicesParams): Promise<Paginated<Service>> {
  const { branchId, ...query } = params;
  return request<Paginated<Service>>('/services', { branchId, query });
}

export function createService(dto: CreateServiceDto, branchId: string): Promise<GenericID> {
  return request<GenericID>('/services', { method: 'POST', body: dto, branchId });
}

export function updateService(
  id: string,
  dto: UpdateServiceDto,
  branchId: string,
): Promise<GenericID> {
  return request<GenericID>(`/services/${id}`, { method: 'PUT', body: dto, branchId });
}

export function getServiceByName(name: string, branchId: string): Promise<Service> {
  return request<Service>(`/services/by-name/${encodeURIComponent(name)}`, { branchId });
}

export function deleteService(id: string, branchId: string): Promise<GenericID> {
  return request<GenericID>(`/services/${id}`, { method: 'DELETE', branchId });
}
