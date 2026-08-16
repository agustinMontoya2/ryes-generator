import type { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHero({ eyebrow, title, subtitle, action }: PageHeroProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-1.5 min-w-0">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.09em] text-primary">
          {eyebrow}
        </p>
        <h1 className="font-display text-[27px] leading-[1.1] font-extrabold tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 pb-0.5">{action}</div>}
    </div>
  );
}
