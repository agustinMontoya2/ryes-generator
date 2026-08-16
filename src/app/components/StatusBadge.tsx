import type { OrderStatus } from '../types';
import { cn } from './ui/utils';

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-status-pending-bg text-status-pending-fg',
  },
  completed: {
    label: 'Completado',
    className: 'bg-status-completed-bg text-status-completed-fg',
  },
  submitted: {
    label: 'Entregado',
    className: 'bg-status-submitted-bg text-status-submitted-fg',
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusStyles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
        config.className,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  );
}
