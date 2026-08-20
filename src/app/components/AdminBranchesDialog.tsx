import { useState } from 'react';
import { Check, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { Branch, User } from '../types';
import { assignUserBranches } from '../api/mock';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { cn } from './ui/utils';

interface AdminBranchesDialogProps {
  user: User;
  branches: Branch[];
  onClose: () => void;
  onSaved: () => void;
}

export function AdminBranchesDialog({
  user,
  branches,
  onClose,
  onSaved,
}: AdminBranchesDialogProps) {
  const [selected, setSelected] = useState<string[]>(() => (user.branches ?? []).map((b) => b.id));
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await assignUserBranches(user.id, selected);
      toast.success('Sucursales actualizadas');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No pudimos guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-accent text-accent-foreground">
              <MapPin className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Asignar sucursales</DialogTitle>
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                {user.username} · {user.email}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[320px] space-y-2 overflow-y-auto py-1">
          {branches.map((branch) => {
            const checked = selected.includes(branch.id);
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => toggle(branch.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[13px] border p-3 text-left transition-colors',
                  checked ? 'border-primary/40 bg-accent' : 'border-border bg-card hover:bg-muted',
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-muted text-muted-foreground">
                  <MapPin className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {branch.location}
                </span>
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                    checked
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border text-transparent',
                  )}
                >
                  <Check className="size-3.5" />
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter className="flex gap-3 pt-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
