import type { Order } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Calendar, User, Clock, CheckCircle, Package, Pencil, Trash2 } from 'lucide-react';
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

const statusConfig = {
  pending: {
    label: 'Pendiente',
    className: 'bg-yellow-500 text-yellow-950',
  },
  completed: {
    label: 'Completado',
    className: 'bg-green-500 text-green-950',
  },
  submitted: {
    label: 'Entregado',
    className: 'bg-blue-500 text-blue-950',
  },
};

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
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{completedOrders.length} órdenes seleccionadas</p>
              <p className="text-sm text-gray-600">Total: {formatCurrency(completedTotal)}</p>
            </div>
            <Button onClick={() => onRequestGenerateReport(completedOrders)}>
              <Package className="w-4 h-4 mr-2" />
              Generar Remito
            </Button>
          </div>
        </Card>
      )}

      {orders.map((order) => {
        const totalPrice = sumOrder(order);
        const isSelected = selectedOrders.includes(order.id);
        const isCompleted = order.status === 'completed';
        const status = statusConfig[order.status];

        return (
          <Card key={order.id} className={`p-4 ${isSelected ? 'ring-2 ring-green-500' : ''}`}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{order.patient.fullname}</h3>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">DNI: {order.patient.dni}</p>
                </div>
                {isCompleted && (
                  <Checkbox
                    aria-label={`Seleccionar orden de ${order.patient.fullname} para remito`}
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(order.id)}
                    className="size-5"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Dr. {order.dentist.lastname}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(order.dueDate)}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Servicios:</p>
                <div className="space-y-1">
                  {order.services.map((service) => (
                    <div key={service.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{service.name}</span>
                      <span className="font-medium">{formatCurrency(service.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  aria-label={`Editar orden de ${order.patient.fullname}`}
                  onClick={() => onEdit(order)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                {order.status === 'pending' && (
                  <Button
                    size="sm"
                    className="flex-1"
                    aria-label={`Completar orden de ${order.patient.fullname}`}
                    onClick={() => onComplete(order.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completar
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  aria-label={`Eliminar orden de ${order.patient.fullname}`}
                  onClick={() => onDelete(order.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}

      {orders.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay órdenes para mostrar</p>
        </Card>
      )}
    </div>
  );
}
