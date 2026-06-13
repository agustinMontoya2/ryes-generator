export type OrderStatus = 'pending' | 'completed' | 'submitted';

export interface Ryes {
  id: string;
  location: string;
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
