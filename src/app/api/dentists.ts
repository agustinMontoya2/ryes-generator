import { request } from './client';
import type { Dentist } from '../types';
import type { CreateDentistDto, GenericID, ListParams, Paginated, UpdateDentistDto } from './types';

interface ListDentistsParams extends ListParams {
  branchId: string;
}

export function listDentists(params: ListDentistsParams): Promise<Paginated<Dentist>> {
  const { branchId, ...query } = params;
  return request<Paginated<Dentist>>('/dentists', { branchId, query });
}

export function getDentist(id: string, branchId: string): Promise<Dentist> {
  return request<Dentist>(`/dentists/${id}`, { branchId });
}

export function createDentist(dto: CreateDentistDto, branchId: string): Promise<GenericID> {
  return request<GenericID>('/dentists', { method: 'POST', body: dto, branchId });
}

export function updateDentist(
  id: string,
  dto: UpdateDentistDto,
  branchId: string,
): Promise<GenericID> {
  return request<GenericID>(`/dentists/${id}`, { method: 'PUT', body: dto, branchId });
}

export function deleteDentist(id: string, branchId: string): Promise<GenericID> {
  return request<GenericID>(`/dentists/${id}`, { method: 'DELETE', branchId });
}
