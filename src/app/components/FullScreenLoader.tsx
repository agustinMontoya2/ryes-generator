import { Loader2 } from 'lucide-react';

export function FullScreenLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>Cargando…</span>
      </div>
    </main>
  );
}
