import { cn } from './ui/utils';
import { ToothIcon } from './ui/tooth-icon';

interface BrandTileProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'size-[38px] rounded-[12px]',
  md: 'size-[44px] rounded-[14px]',
  lg: 'size-[52px] rounded-[16px]',
};

const iconSizes = {
  sm: 'size-[18px]',
  md: 'size-[22px]',
  lg: 'size-[26px]',
};

export function BrandTile({ size = 'md', className }: BrandTileProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center text-white shadow-[0_4px_12px_oklch(56%_0.12_170/0.35)]',
        sizes[size],
        className,
      )}
      style={{
        background: 'linear-gradient(140deg, var(--primary), oklch(60% 0.13 195))',
      }}
    >
      <ToothIcon className={iconSizes[size]} />
    </div>
  );
}
