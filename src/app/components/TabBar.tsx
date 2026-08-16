import type { LucideIcon } from 'lucide-react';
import { cn } from './ui/utils';

export interface TabItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface TabBarProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
}

export function TabBar({ tabs, value, onChange }: TabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[oklch(100%_0_0/0.92)] backdrop-blur-[10px]">
      <div className="mx-auto grid max-w-[560px] grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = value === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-[66px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-[30px] w-10 items-center justify-center rounded-[11px] transition-colors',
                  active && 'bg-accent',
                )}
              >
                <Icon className="size-5" />
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
