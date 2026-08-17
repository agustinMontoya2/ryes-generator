import { request } from './client';
import type { Order } from '../types';
import type {
  CreateOrderDto,
  GenericID,
  ListOrdersParams,
  Paginated,
  UpdateOrderDto,
} from './types';

export function listOrders(params: ListOrdersParams): Promise<Paginated<Order>> {
  const { branchId, ...query } = params;
  return request<Paginated<Order>>('/orders', { branchId, query });
}

export function getOrder(id: string, branchId: string): Promise<Order> {
  return request<Order>(`/orders/${id}`, { branchId });
}

export function createOrder(dto: CreateOrderDto, branchId: string): Promise<GenericID> {
  return request<GenericID>('/orders', { method: 'POST', body: dto, branchId });
}

export function updateOrder(id: string, dto: UpdateOrderDto, branchId: string): Promise<GenericID> {
  return request<GenericID>(`/orders/${id}`, { method: 'PUT', body: dto, branchId });
}

export function deleteOrder(id: string, branchId: string): Promise<GenericID> {
  return request<GenericID>(`/orders/${id}`, { method: 'DELETE', branchId });
}

export function completeOrder(id: string, branchId: string): Promise<GenericID> {
  return request<GenericID>(`/orders/${id}/complete`, { method: 'POST', branchId });
}
