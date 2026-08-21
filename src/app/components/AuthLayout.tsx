import type { ReactNode } from 'react';
import { BrandTile } from './BrandTile';
import { BRAND_NAME } from '../config/brand';

interface AuthLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 p-6">
      <div className="flex flex-col items-center gap-2.5">
        <BrandTile size="lg" />
        <p className="font-display text-[22px] font-extrabold tracking-[-0.01em]">{BRAND_NAME}</p>
        <p className="text-[13px] text-muted-foreground">Gestión de laboratorio dental</p>
      </div>

      <div className="w-full max-w-[400px] rounded-[20px] border border-border bg-card p-6 shadow-[0_1px_2px_oklch(22%_0.02_250/0.04),0_12px_28px_oklch(22%_0.02_250/0.09)]">
        {children}
      </div>

      {footer && (
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </main>
  );
}
