import type { Order } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { StatusBadge } from './StatusBadge';
import {
  Calendar,
  Clock,
  Package,
  Pencil,
  CheckCircle,
  Trash2,
  User,
  FileClock,
} from 'lucide-react';
import { sumOrder, sumOrders } from '../utils/orders';
import { formatCurrency, formatDate } from '../utils/format';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onRequestGenerateReport: (orders: Order[]) => void;
  selectedOrders: string[];
  onToggleSelect: (orderId: string) => void;
}

export function OrderList({
  orders,
  onEdit,
  onDelete,
  onComplete,
  onRequestGenerateReport,
  selectedOrders,
  onToggleSelect,
}: OrderListProps) {
  const completedOrders = orders.filter(
    (o) => o.status === 'completed' && selectedOrders.includes(o.id),
  );
  const completedTotal = sumOrders(completedOrders);

  return (
    <div className="space-y-4">
      {completedOrders.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-[16px] border border-[oklch(86%_0.08_155)] bg-[oklch(94.5%_0.05_155)] p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[11px] bg-[oklch(88%_0.08_155)] text-[oklch(47%_0.12_170)]">
              <Package className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold">
                {completedOrders.length} trabajo{completedOrders.length === 1 ? '' : 's'}{' '}
                seleccionado{completedOrders.length === 1 ? '' : 's'}
              </p>
              <p className="text-[12.5px] text-muted-foreground">
                Total: {formatCurrency(completedTotal)}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => onRequestGenerateReport(completedOrders)}
          >
            Generar Remito
          </Button>
        </div>
      )}

      {orders.map((order) => {
        const totalPrice = sumOrder(order);
        const isSelected = selectedOrders.includes(order.id);
        const isCompleted = order.status === 'completed';

        return (
          <Card
            key={order.id}
            className={`gap-3 p-4 ${isSelected ? 'shadow-[0_0_0_2px_var(--ring)]' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[16px] font-bold tracking-[-0.01em]">
                    {order.patient.fullname}
                  </h3>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-muted-foreground">DNI: {order.patient.dni}</p>
              </div>
              {isCompleted ? (
                <Checkbox
                  aria-label={`Seleccionar orden de ${order.patient.fullname} para remito`}
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(order.id)}
                  className="mt-1 size-[22px] shrink-0"
                />
              ) : (
                <div className="mt-1 flex size-[22px] shrink-0 items-center justify-center text-muted-foreground/60">
                  <Clock className="size-5" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="size-4 shrink-0" />
                <span className="truncate">Dr. {order.dentist.lastname}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span className="truncate">Entrega: {formatDate(order.dueDate)}</span>
              </div>
            </div>

            <div className="space-y-1">
              {order.services.map((service) => (
                <div key={service.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{service.name}</span>
                  <span className="font-semibold whitespace-nowrap">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between gap-3 border-t border-border pt-2 text-sm font-bold">
                <span>Total</span>
                <span className="font-display">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                aria-label={`Editar orden de ${order.patient.fullname}`}
                onClick={() => onEdit(order)}
              >
                <Pencil className="size-4" />
                Editar
              </Button>
              {order.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-transparent bg-[oklch(94.5%_0.05_155)] text-[oklch(32%_0.1_155)] hover:bg-[oklch(92%_0.08_155)]"
                  aria-label={`Completar orden de ${order.patient.fullname}`}
                  onClick={() => onComplete(order.id)}
                >
                  <CheckCircle className="size-4" />
                  Completar
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Eliminar orden de ${order.patient.fullname}`}
                onClick={() => onDelete(order.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        );
      })}

      {orders.length === 0 && (
        <div className="rounded-[16px] border-[1.5px] border-dashed border-border bg-card p-8 text-center">
          <div className="mx-auto mb-3 flex size-[58px] items-center justify-center rounded-[17px] bg-muted text-muted-foreground">
            <FileClock className="size-6" />
          </div>
          <h4 className="font-display text-[15px] font-bold">No hay trabajos</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            No se encontraron órdenes con el filtro seleccionado.
          </p>
        </div>
      )}
    </div>
  );
}
