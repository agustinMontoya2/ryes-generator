import type { JobReport } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Printer, Calendar, DollarSign } from 'lucide-react';
import { sumOrder } from '../utils/orders';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto print:static print:translate-x-0 print:translate-y-0 print:top-auto print:left-auto print:max-w-none print:max-h-none print:overflow-visible print:border-0 print:shadow-none print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle>Remito #{report.id}</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6" id="remito-content">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold print:text-center">Remito #{report.id}</h2>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>

          <div className="border-b pb-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar className="w-5 h-5" />
              <span>Fecha de entrega: {formatDate(report.deliveryDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-5 h-5" />
              <span className="text-xl font-bold text-black">
                Total: {formatCurrency(report.totalPrice)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Órdenes incluidas:</h3>
            {(report.orders ?? []).map((order) => {
              const totalPrice = sumOrder(order);

              return (
                <Card key={order.id} className="p-4 border-2">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{order.patient.fullname}</h4>
                        <p className="text-sm text-gray-600">DNI: {order.patient.dni}</p>
                        <p className="text-sm text-gray-600">
                          Dr. {order.dentist.name} {order.dentist.lastname}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Orden #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.lab}</p>
                      </div>
                    </div>

                    <div className="border-t pt-2">
                      <p className="font-medium text-sm mb-2">Servicios realizados:</p>
                      <div className="space-y-1">
                        {(order.services ?? []).map((service) => (
                          <div key={service.id} className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span className="font-medium">{formatCurrency(service.price)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>TOTAL REMITO:</span>
              <span className="text-2xl">{formatCurrency(report.totalPrice)}</span>
            </div>
          </div>

          <div className="border-t pt-4 text-center text-sm text-gray-500">
            <p>
              Generado el{' '}
              {report.createdAt ? formatDateTime(report.createdAt) : 'Fecha desconocida'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
