import type { LoginResponse, User } from '../types';
import { BRAND_SLUG, TOKEN_KEY, USER_KEY } from '../config/brand';

// TODO: reemplazar con llamada real al backend cuando esté disponible
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || `operador@${BRAND_SLUG}.com`;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || `${BRAND_SLUG}2026`;

export const DEMO_EMAIL_FOR_UI = DEMO_EMAIL;
export const DEMO_PASSWORD_FOR_UI = DEMO_PASSWORD;

const DEMO_USER: User = {
  id: `u-${BRAND_SLUG}-1`,
  email: DEMO_EMAIL,
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new Error('Credenciales inválidas');
  }

  const accessToken = btoa(
    JSON.stringify({
      sub: DEMO_USER.id,
      email: DEMO_USER.email,
      exp: Date.now() + 8 * 60 * 60 * 1000,
    }),
  );

  return { accessToken, user: DEMO_USER };
}

export function getSession(): LoginResponse | null {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  if (!accessToken || !rawUser) return null;

  try {
    const payload = JSON.parse(atob(accessToken));
    if (payload.exp && payload.exp < Date.now()) {
      clearSession();
      return null;
    }
    return { accessToken, user: JSON.parse(rawUser) as User };
  } catch {
    return null;
  }
}

export function saveSession(session: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
