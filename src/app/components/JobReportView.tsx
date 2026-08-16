import type { JobReport } from '../types';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { Printer } from 'lucide-react';
import { BrandTile } from './BrandTile';
import { sumOrder } from '../utils/orders';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';
import { BRAND_NAME } from '../config/brand';

interface JobReportViewProps {
  report: JobReport;
  onClose: () => void;
}

export function JobReportView({ report, onClose }: JobReportViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 print:static print:inset-auto print:bottom-auto print:left-0 print:top-0 print:max-w-none print:translate-x-0 print:translate-y-0 print:overflow-visible print:rounded-none print:border-0 print:shadow-none print:p-0 sm:max-w-[560px]">
        <div className="flex items-center justify-between gap-3 px-6 pb-0 pt-5 no-print">
          <div className="flex items-center gap-3">
            <div className="flex size-[42px] items-center justify-center rounded-[13px] bg-accent text-accent-foreground">
              <Printer className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-[18px] font-bold tracking-[-0.01em]">
                Remito #{report.id.slice(-6)}
              </h2>
              <p className="text-[13px] text-muted-foreground">Vista previa e impresión</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-4" />
            Imprimir
          </Button>
        </div>

        <div className="px-6 pb-6 pt-4 no-print">
          <div className="h-px bg-border" />
        </div>

        <div id="remito-content" className="space-y-5 px-6 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BrandTile size="sm" />
              <div>
                <h2 className="font-display text-[19px] font-extrabold tracking-[-0.01em]">
                  Remito #{report.id.slice(-6)}
                </h2>
                <p className="text-[12.5px] text-muted-foreground">
                  {BRAND_NAME} · Entrega de trabajos
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[14px] border border-border bg-muted p-3">
              <p className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Fecha de entrega
              </p>
              <p className="mt-1 font-display text-[15px] font-bold">
                {formatDate(report.deliveryDate)}
              </p>
            </div>
            <div className="rounded-[14px] border border-border bg-muted p-3">
              <p className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Total
              </p>
              <p className="mt-1 font-display text-[15px] font-bold">
                {formatCurrency(report.totalPrice)}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2.5 text-[13px] font-bold text-muted-foreground">
              Trabajos incluidos:
            </p>
            <div className="space-y-2.5">
              {report.orders.map((order) => {
                const totalPrice = sumOrder(order);

                return (
                  <div key={order.id} className="rounded-[14px] border border-border p-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <div>
                        <h5 className="font-display text-[14.5px] font-bold">
                          {order.patient.fullname}
                        </h5>
                        <p className="text-[12.5px] text-muted-foreground">
                          DNI: {order.patient.dni} · Dr. {order.dentist.name}{' '}
                          {order.dentist.lastname}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12.5px] text-muted-foreground">
                          Trabajo #{order.id.slice(-6)}
                        </p>
                        <p className="text-[12.5px] text-muted-foreground">{order.lab}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 border-t border-border pt-3">
                      {order.services.map((service) => (
                        <div key={service.id} className="flex justify-between gap-3 text-sm">
                          <span className="text-muted-foreground">{service.name}</span>
                          <span className="font-semibold whitespace-nowrap">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between gap-3 pt-1 text-sm font-bold">
                        <span>Subtotal</span>
                        <span className="font-display">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 border-t-[1.5px] border-foreground pt-4">
            <div>
              <p className="text-[12px] font-semibold text-muted-foreground">TOTAL REMITO</p>
              <p className="font-display text-[22px] font-extrabold tracking-[-0.02em]">
                {formatCurrency(report.totalPrice)}
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground no-print">
              Generado el {formatDateTime(new Date())}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
