import type { Patient, Dentist, Service, Order, Ryes } from '../types';

export const mockRyes: Ryes[] = [
  { id: '1', location: 'Talar' },
  { id: '2', location: 'Moron' },
  { id: '3', location: 'Ballester' },
];

export const mockPatients: Patient[] = [
  { id: '1', fullname: 'María González', dni: 35123456 },
  { id: '2', fullname: 'Juan Pérez', dni: 28456789 },
  { id: '3', fullname: 'Ana Martínez', dni: 42987654 },
  { id: '4', fullname: 'Carlos López', dni: 31234567 },
  { id: '5', fullname: 'Laura Fernández', dni: 39876543 },
];

export const mockDentists: Dentist[] = [
  { id: '1', name: 'Roberto', lastname: 'Sánchez' },
  { id: '2', name: 'Patricia', lastname: 'García' },
  { id: '3', name: 'Diego', lastname: 'Rodríguez' },
  { id: '4', name: 'Gabriela', lastname: 'Torres' },
];

export const mockServices: Service[] = [
  { id: '1', name: 'Corona de porcelana', price: 25000 },
  { id: '2', name: 'Prótesis parcial', price: 45000 },
  { id: '3', name: 'Implante', price: 80000 },
  { id: '4', name: 'Puente fijo', price: 60000 },
  { id: '5', name: 'Corona de zirconio', price: 35000 },
  { id: '6', name: 'Placa de descarga', price: 18000 },
  { id: '7', name: 'Prótesis completa', price: 95000 },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    patient: mockPatients[0],
    dispatchDate: '2026-04-01',
    dueDate: '2026-04-10',
    dentist: mockDentists[0],
    lab: 'Lab Central',
    status: 'pending',
    services: [mockServices[0], mockServices[2]],
  },
  {
    id: '2',
    patient: mockPatients[1],
    dispatchDate: '2026-04-02',
    dueDate: '2026-04-08',
    dentist: mockDentists[1],
    lab: 'Lab Central',
    status: 'completed',
    services: [mockServices[1]],
  },
  {
    id: '3',
    patient: mockPatients[2],
    dispatchDate: '2026-04-03',
    dueDate: '2026-04-12',
    dentist: mockDentists[0],
    lab: 'Lab Norte',
    status: 'pending',
    services: [mockServices[3], mockServices[4]],
  },
  {
    id: '4',
    patient: mockPatients[3],
    dispatchDate: '2026-03-28',
    dueDate: '2026-04-05',
    dentist: mockDentists[2],
    lab: 'Lab Central',
    status: 'completed',
    services: [mockServices[5]],
  },
  {
    id: '5',
    patient: mockPatients[4],
    dispatchDate: '2026-04-04',
    dueDate: '2026-04-15',
    dentist: mockDentists[3],
    lab: 'Lab Sur',
    status: 'submitted',
    services: [mockServices[6]],
  },
  {
    id: '6',
    patient: mockPatients[0],
    dispatchDate: '2026-04-05',
    dueDate: '2026-04-14',
    dentist: mockDentists[1],
    lab: 'Lab Central',
    status: 'pending',
    services: [mockServices[0], mockServices[5]],
  },
];
