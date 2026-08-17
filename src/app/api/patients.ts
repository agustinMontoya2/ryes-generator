import { request } from './client';
import type { Patient } from '../types';
import type { CreatePatientDto, GenericID, ListParams, Paginated, UpdatePatientDto } from './types';

interface ListPatientsParams extends ListParams {
  branchId: string;
}

export function listPatients(params: ListPatientsParams): Promise<Paginated<Patient>> {
  const { branchId, ...query } = params;
  return request<Paginated<Patient>>('/patients', { branchId, query });
}

export function createPatient(dto: CreatePatientDto, branchId: string): Promise<GenericID> {
  return request<GenericID>('/patients', { method: 'POST', body: dto, branchId });
}

export function updatePatient(
  id: string,
  dto: UpdatePatientDto,
  branchId: string,
): Promise<GenericID> {
  return request<GenericID>(`/patients/${id}`, { method: 'PUT', body: dto, branchId });
}

export function deletePatient(id: string, branchId: string): Promise<GenericID> {
  return request<GenericID>(`/patients/${id}`, { method: 'DELETE', branchId });
}
