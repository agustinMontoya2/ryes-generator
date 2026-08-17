import { request } from './client';
import type { Branch } from '../types';

export function getBranches(): Promise<Branch[]> {
  return request<Branch[]>('/branches');
}
