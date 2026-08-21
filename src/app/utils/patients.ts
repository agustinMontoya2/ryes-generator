import type { Patient, PatientInput } from '../types';

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function findPatientByDni(patients: Patient[], fullname: string, dni: number): Patient | undefined {
  const normalized = normalizeName(fullname);
  return patients.find((p) => p.dni === dni && normalizeName(p.fullname) === normalized);
}

export function findPatientByDniOnly(patients: Patient[], dni: number): Patient | undefined {
  return patients.find((p) => p.dni === dni);
}

export function findNameOnlyPatient(patients: Patient[], fullname: string): Patient | undefined {
  const normalized = normalizeName(fullname);
  return patients.find((p) => p.dni == null && normalizeName(p.fullname) === normalized);
}

export function findPatientsByName(patients: Patient[], fullname: string): Patient[] {
  const query = normalizeName(fullname);
  if (!query) return [];
  return patients.filter((p) => normalizeName(p.fullname).includes(query));
}

export function hasExactNamePatient(patients: Patient[], fullname: string): boolean {
  const normalized = normalizeName(fullname);
  return patients.some((p) => normalizeName(p.fullname) === normalized);
}

export function resolvePatient(
  patients: Patient[],
  addPatient: (patient: PatientInput) => Patient,
  fullname: string,
  dni?: number,
): Patient {
  if (dni != null) {
    const exact = findPatientByDni(patients, fullname, dni);
    if (exact) return exact;
    return addPatient({ fullname, dni });
  }
  const nameOnly = findNameOnlyPatient(patients, fullname);
  if (nameOnly) return nameOnly;
  return addPatient({ fullname, dni: undefined });
}
