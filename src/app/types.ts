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
  branchId?: string;
  fullname: string;
  dni: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dentist {
  id: string;
  branchId?: string;
  name: string;
  lastname: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  branchId?: string;
  name: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  branchId?: string;
  patient: Patient;
  dispatchDate: string;
  dueDate: string;
  dentist: Dentist;
  lab: string | null;
  status: OrderStatus;
  services: Service[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JobReport {
  id: string;
  branchId?: string;
  orders: Order[];
  totalPrice: number;
  deliveryDate: string;
  createdAt?: string;
}

export interface PatientInput {
  id?: string;
  fullname: string;
  dni: number;
}

export interface DentistInput {
  id?: string;
  name: string;
  lastname: string;
}

export interface ServiceInput {
  id?: string;
  name: string;
  price: number;
}

export interface OrderInput {
  id?: string;
  patient: PatientInput;
  dentist: DentistInput;
  serviceIds: string[];
  dispatchDate: string;
  dueDate: string;
  lab: string | null;
}
