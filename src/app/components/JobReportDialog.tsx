import { useState } from 'react';
import { Order } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { X, Package } from 'lucide-react';

interface JobReportDialogProps {
  orders: Order[];
  onSubmit: (orders: Order[], deliveryDate: string) => void;
  onCancel: () => void;
}

export function JobReportDialog({
  orders,
  onSubmit,
  onCancel,
}: JobReportDialogProps) {
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const totalPrice = orders.reduce(
    (sum, order) =>
      sum + order.services.reduce((s, service) => s + service.price, 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryDate) {
      alert('Por favor ingrese la fecha de entrega');
      return;
    }
    onSubmit(orders, deliveryDate);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Generar Remito</h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="text-sm text-gray-600">
                  {orders.length} órdenes seleccionadas
                </p>
                <p className="text-lg font-semibold">
                  Total: ${totalPrice.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Fecha de Entrega del Remito *</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                <Package className="w-4 h-4 mr-2" />
                Generar Remito
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
