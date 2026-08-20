export type OrderStatus = 'pending' | 'completed' | 'submitted';

export interface Branch {
  id: string;
  location: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  isSuperAdmin: boolean;
}

export interface User extends UserProfile {
  branches?: Branch[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
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

export interface Patient {
  id: string;
  fullname: string;
  dni: number;
}

export interface Dentist {
  id: string;
  name: string;
  lastname: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  patient: Patient;
  dispatchDate: string;
  dueDate: string;
  dentist: Dentist;
  lab: string;
  status: OrderStatus;
  services: Service[];
}

export interface JobReport {
  id: string;
  orders: Order[];
  totalPrice: number;
  deliveryDate: string;
}

export type OrderInput = Omit<Order, 'id'> & { id?: string };
export type PatientInput = Omit<Patient, 'id'> & { id?: string };
export type DentistInput = Omit<Dentist, 'id'> & { id?: string };
export type ServiceInput = Omit<Service, 'id'> & { id?: string };
