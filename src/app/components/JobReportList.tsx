import type { JobReport } from '../types';
import { Button } from './ui/button';
import { Eye, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

interface JobReportListProps {
  reports: JobReport[];
  onView: (report: JobReport) => void;
}

export function JobReportList({ reports, onView }: JobReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-[16px] border-[1.5px] border-dashed border-border bg-card p-8 text-center">
        <div className="mx-auto mb-3 flex size-[58px] items-center justify-center rounded-[17px] bg-muted text-muted-foreground">
          <FileText className="size-6" />
        </div>
        <h4 className="font-display text-[15px] font-bold">No hay remitos</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Los remitos aparecerán aquí cuando generes uno desde la vista de trabajos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-[16px] border border-border bg-card p-4 shadow-[0_1px_2px_oklch(22%_0.02_250/0.04),0_2px_8px_oklch(22%_0.02_250/0.05)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-[11px] bg-muted text-muted-foreground">
                <FileText className="size-4.5" />
              </div>
              <div>
                <h3 className="font-display text-[14.5px] font-bold">
                  Remito #{report.id.slice(-6)}
                </h3>
                <p className="text-[12.5px] text-muted-foreground">
                  Entrega: {formatDate(report.deliveryDate)} · {report.orders.length} trabajos
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              aria-label={`Ver remito ${report.id.slice(-6)}`}
              onClick={() => onView(report)}
            >
              <Eye className="size-4" />
              Ver remito
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {report.orders.map((order) => (
              <span
                key={order.id}
                className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-[12px] font-semibold text-foreground"
              >
                {order.patient.fullname}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-[12.5px] font-semibold text-muted-foreground">Total</span>
            <span className="font-display text-[15px] font-bold">
              {formatCurrency(report.totalPrice)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
