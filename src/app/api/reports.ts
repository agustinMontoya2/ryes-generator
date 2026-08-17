import { request } from './client';
import type { JobReport } from '../types';
import type { CreateReportDto, GenericID, ListParams, Paginated } from './types';

interface ListReportsParams extends ListParams {
  branchId: string;
}

export function listReports(params: ListReportsParams): Promise<Paginated<JobReport>> {
  const { branchId, ...query } = params;
  return request<Paginated<JobReport>>('/reports', { branchId, query });
}

export function createReport(dto: CreateReportDto, branchId: string): Promise<GenericID> {
  return request<GenericID>('/reports', { method: 'POST', body: dto, branchId });
}

export function deleteReport(id: string, branchId: string): Promise<GenericID> {
  return request<GenericID>(`/reports/${id}`, { method: 'DELETE', branchId });
}
