import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { clearSession, getSession, login as authLogin, saveSession } from './auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => {
    const session = getSession();
    return session ? 'authenticated' : 'unauthenticated';
  });
  const [user, setUser] = useState<User | null>(() => {
    const session = getSession();
    return session?.user ?? null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const session = await authLogin(email, password);
    saveSession(session);
    setUser(session.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(() => ({ status, user, login, logout }), [status, user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }

  return context;
}
