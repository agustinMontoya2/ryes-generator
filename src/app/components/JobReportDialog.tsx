import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import type { Order } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ClipboardList } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-accent text-accent-foreground">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Generar Remito</DialogTitle>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Confirmá la fecha de entrega para emitir el remito.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 rounded-[14px] border border-[oklch(86%_0.08_155)] bg-[oklch(94.5%_0.05_155)] p-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[11px] bg-[oklch(88%_0.08_155)] text-[oklch(47%_0.12_170)]">
              <ClipboardList className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {orders.length} trabajo{orders.length === 1 ? '' : 's'} seleccionado
                {orders.length === 1 ? '' : 's'}
              </p>
              <p className="text-[12.5px] text-muted-foreground">
                Total: {formatCurrency(totalPrice)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliveryDate">Fecha de Entrega del Remito *</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="flex gap-2 pt-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Generar Remito
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
