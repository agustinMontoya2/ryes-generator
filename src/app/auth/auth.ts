import type { LoginResponse, User } from '../types';

const TOKEN_KEY = 'ryes_token';
const USER_KEY = 'ryes_user';

export const DEMO_EMAIL = 'operador@ryes.com';
export const DEMO_PASSWORD = 'ryes2026';

const DEMO_USER: User = {
  id: 'u-ryes-1',
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
