import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-AR');
}

export function toDateOnly(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[0] : '';
}

export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    const dateOnly = toDateOnly(date);
    if (dateOnly) {
      const [y, m, d] = dateOnly.split('-');
      return `${d}/${m}/${y}`;
    }
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) return format(parsed, 'dd/MM/yyyy', { locale: es });
    return date;
  }
  return format(date, 'dd/MM/yyyy', { locale: es });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
}
