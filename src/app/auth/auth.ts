import type { UserProfile } from '../types';
import { BRAND_SLUG } from '../config/brand';
import { getCurrentUser, login as apiLogin, register as apiRegister } from '../api/mock';

const TOKEN_KEY = `${BRAND_SLUG}_access_token`;
const REFRESH_KEY = `${BRAND_SLUG}_refresh_token`;
const PROFILE_KEY = `${BRAND_SLUG}_profile`;

export const DEMO_EMAIL = `operador@${BRAND_SLUG}.com`;
export const DEMO_PASSWORD = `${BRAND_SLUG}2026`;
export const ADMIN_EMAIL = `admin@${BRAND_SLUG}.com`;
export const ADMIN_PASSWORD = `admin2026`;

export interface Session {
  accessToken: string;
  refreshToken: string;
  profile: UserProfile;
}

export async function login(credential: string, password: string): Promise<Session> {
  const tokens = await apiLogin({ credential, password });
  const profile = await getCurrentUser(tokens.accessToken);

  return { ...tokens, profile };
}

export async function register(input: {
  email: string;
  username: string;
  password: string;
}): Promise<Session> {
  await apiRegister(input);
  return login(input.email, input.password);
}

export function getSession(): Session | null {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  const rawProfile = localStorage.getItem(PROFILE_KEY);

  if (!accessToken || !refreshToken || !rawProfile) return null;

  try {
    return { accessToken, refreshToken, profile: JSON.parse(rawProfile) as UserProfile };
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_KEY, session.refreshToken);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(session.profile));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(PROFILE_KEY);
}
