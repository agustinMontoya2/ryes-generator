import type { Order, Service } from '../types';

export function sumServices(services: Service[]): number {
  return services.reduce((sum, service) => sum + service.price, 0);
}

export function sumOrder(order: Order): number {
  return sumServices(order.services);
}

export function sumOrders(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + sumOrder(order), 0);
}
