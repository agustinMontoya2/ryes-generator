import { JobReport } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Eye, FileText } from 'lucide-react';

interface JobReportListProps {
  reports: JobReport[];
  onView: (report: JobReport) => void;
}

export function JobReportList({ reports, onView }: JobReportListProps) {
  if (reports.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500">No hay remitos generados</p>
        <p className="text-sm text-gray-400 mt-2">
          Los remitos aparecerán aquí cuando generes uno desde la vista de órdenes
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <Card key={report.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">
                  Remito #{report.id.slice(-6)}
                </h3>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Fecha de entrega:</span>{' '}
                  {new Date(report.deliveryDate).toLocaleDateString('es-AR')}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Órdenes:</span>{' '}
                  {report.orders.length}
                </p>
                <p className="text-gray-900 font-semibold">
                  Total: ${report.totalPrice.toLocaleString('es-AR')}
                </p>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {report.orders.map((order) => (
                  <span
                    key={order.id}
                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {order.patient.fullname}
                  </span>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onView(report)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
