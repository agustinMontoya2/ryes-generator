import type { LoginResponse, UserProfile } from '../types';
import { PROFILE_KEY, REFRESH_TOKEN_KEY, TOKEN_KEY } from '../config/brand';
import * as authApi from '../api/auth';
import { getMe } from '../api/users';

export interface Session {
  accessToken: string;
  refreshToken: string;
  profile: UserProfile;
}
function persistTokens(tokens: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export async function login(credential: string, password: string): Promise<Session> {
  const tokens = await authApi.login({ credential, password });
  persistTokens(tokens);

  const profile = await getMe();

  return { ...tokens, profile };
}

export async function register(input: {
  email: string;
  username: string;
  password: string;
}): Promise<Session> {
  await authApi.register(input);
  return login(input.email, input.password);
}

export async function refreshSession(refreshToken: string): Promise<Session> {
  const tokens = await authApi.refresh({ refreshToken });
  persistTokens(tokens);

  const profile = await getMe();

  return { ...tokens, profile };
}

export function getSession(): Session | null {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
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
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(session.profile));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}
