import { request } from './client';
import type { GenericID, ListParams, Paginated } from './types';
import type { User, UserProfile } from '../types';

export function getMe(): Promise<UserProfile> {
  return request<UserProfile>('/users/me');
}

export interface ListUsersParams extends ListParams {
  includeAdmins?: boolean;
}

export function getUsers(params: ListUsersParams = {}): Promise<Paginated<User>> {
  const { includeAdmins, ...rest } = params;
  const query: Record<string, string | number | boolean | undefined> = {
    ...rest,
    includeAdmins: includeAdmins === undefined ? undefined : String(includeAdmins),
  };
  return request<Paginated<User>>('/users', { query });
}

export function assignUserBranches(userId: string, branchIds: string[]): Promise<GenericID> {
  return request<GenericID>(`/users/${userId}/branches`, {
    method: 'POST',
    body: { branchIds },
  });
}
