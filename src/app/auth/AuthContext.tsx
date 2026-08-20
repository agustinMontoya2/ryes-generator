import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../types';
import {
  clearSession,
  getSession,
  login as authLogin,
  register as authRegister,
  saveSession,
} from './auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  login: (credential: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const session = getSession();

    if (session) {
      setUser(session.profile);
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const login = useCallback(async (credential: string, password: string) => {
    const session = await authLogin(credential, password);
    saveSession(session);
    setUser(session.profile);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authRegister(input);
    saveSession(session);
    setUser(session.profile);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }

  return context;
}
