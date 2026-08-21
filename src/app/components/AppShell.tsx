import type { ReactNode } from 'react';
import { cn } from './ui/utils';

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={cn('mx-auto min-h-screen w-full max-w-[560px] px-4 pb-[130px] pt-4', className)}
    >
      {children}
    </div>
  );
}
