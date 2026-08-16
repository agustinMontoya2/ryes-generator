import { useNavigate } from 'react-router';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { BRAND_NAME } from '../config/brand';
import { Button } from './ui/button';
import { BrandTile } from './BrandTile';

interface TopBarProps {
  showBack?: boolean;
  subtitle?: string;
}

export function TopBar({ showBack = false, subtitle }: TopBarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <header className="flex items-center gap-2.5">
      {showBack && (
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2 text-muted-foreground"
          aria-label="Volver"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="size-5" />
        </Button>
      )}
      <BrandTile size="md" />
      <div className="min-w-0">
        <p className="font-display text-[17px] leading-tight font-extrabold tracking-[-0.01em]">
          {BRAND_NAME}
        </p>
        {subtitle && <p className="text-[12.5px] text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={logout}
        aria-label="Cerrar sesión"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Cerrar sesión</span>
      </Button>
    </header>
  );
}
