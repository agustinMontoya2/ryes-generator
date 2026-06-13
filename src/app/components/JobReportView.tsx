import { JobReport } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, Printer, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface JobReportViewProps {
  report: JobReport;
  onClose: () => void;
}

export function JobReportView({ report, onClose }: JobReportViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6" id="remito-content">
          <div className="flex items-center justify-between print:justify-center">
            <h2 className="text-2xl font-bold">Remito #{report.id}</h2>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="border-b pb-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar className="w-5 h-5" />
              <span>Fecha de entrega: {format(new Date(report.deliveryDate), 'dd/MM/yyyy', { locale: es })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-5 h-5" />
              <span className="text-xl font-bold text-black">Total: ${report.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Órdenes incluidas:</h3>
            {report.orders.map((order) => {
              const totalPrice = order.services.reduce((sum, s) => sum + s.price, 0);

              return (
                <Card key={order.id} className="p-4 border-2">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{order.patient.fullname}</h4>
                        <p className="text-sm text-gray-600">DNI: {order.patient.dni}</p>
                        <p className="text-sm text-gray-600">Dr. {order.dentist.name} {order.dentist.lastname}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Orden #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.lab}</p>
                      </div>
                    </div>

                    <div className="border-t pt-2">
                      <p className="font-medium text-sm mb-2">Servicios realizados:</p>
                      <div className="space-y-1">
                        {order.services.map((service) => (
                          <div key={service.id} className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span className="font-medium">${service.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                        <span>Subtotal:</span>
                        <span>${totalPrice.toLocaleString()}</span>
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
              <span className="text-2xl">${report.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t pt-4 text-center text-sm text-gray-500">
            <p>Generado el {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
