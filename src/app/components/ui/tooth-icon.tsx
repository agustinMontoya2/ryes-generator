import { cn } from './utils';

interface ToothIconProps {
  className?: string;
}

export function ToothIcon({ className }: ToothIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <path d="M12 5.5c-1.5-1.4-3-2-4.6-2-2.6 0-4.4 1.8-4.4 4.3 0 1.8.5 3.3 1.3 5 .8 1.7 1.3 3.6 1.4 5.4.1 1.8.6 2.8 1.5 2.8 1.5 0 1.5-2.4 2.6-3.2.7-.5 1.4-.5 2.1 0 1.1.8 1.1 3.2 2.6 3.2.9 0 1.4-1 1.5-2.8.1-1.8.6-3.7 1.4-5.4.8-1.7 1.3-3.2 1.3-5 0-2.5-1.8-4.3-4.4-4.3-1.6 0-3.1.6-4.6 2Z" />
    </svg>
  );
}
