import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import type { Order } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Package } from 'lucide-react';
import { sumOrders } from '../utils/orders';
import { formatCurrency } from '../utils/format';

interface JobReportDialogProps {
  orders: Order[];
  onSubmit: (orders: Order[], deliveryDate: string) => void;
  onCancel: () => void;
}

export function JobReportDialog({ orders, onSubmit, onCancel }: JobReportDialogProps) {
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);

  const totalPrice = sumOrders(orders);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!deliveryDate) {
      toast.error('Por favor ingrese la fecha de entrega');
      return;
    }
    onSubmit(orders, deliveryDate);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generar Remito</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm text-gray-600">{orders.length} órdenes seleccionadas</p>
              <p className="text-lg font-semibold">Total: {formatCurrency(totalPrice)}</p>
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

          <DialogFooter className="flex gap-3 pt-4 sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <Package className="w-4 h-4 mr-2" />
              Generar Remito
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
