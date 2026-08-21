import { PROFILE_KEY, REFRESH_TOKEN_KEY, TOKEN_KEY, USER_KEY } from '../config/brand';
import type { Envelope, ErrorEnvelope } from './types';
import type { LoginResponse } from '../types';
import { translateApiError } from '../utils/error-messages';

const DEFAULT_TIMEOUT = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 15_000;

export const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode?: string;
  readonly identifier?: string;
  readonly property?: string;
  readonly details?: unknown;
  readonly metadata?: unknown;

  constructor(envelope: ErrorEnvelope) {
    super(envelope.message || `Error ${envelope.statusCode || 'desconocido'}`);
    this.name = 'ApiError';
    this.statusCode = envelope.statusCode;
    this.errorCode = envelope.errorCode;
    this.identifier = envelope.identifier;
    this.property = envelope.property;
    this.details = envelope.details;
    this.metadata = envelope.metadata;
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return translateApiError(error);
  if (error instanceof Error) return translateApiError(error);
  return 'Ocurrió un error inesperado';
}

function clearSessionStorage() {
  for (const key of [TOKEN_KEY, REFRESH_TOKEN_KEY, PROFILE_KEY, USER_KEY]) {
    localStorage.removeItem(key);
  }
}

let refreshInFlight: Promise<string | null> | null = null;

async function requestNewAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  refreshInFlight ??= (async () => {
    try {
      const url = new URL(`${API_URL}/auth/refresh`, window.location.origin);
      const response = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const json = (await response.json()) as { payload?: LoginResponse } | null;
      const tokens = json?.payload;
      if (!tokens?.accessToken || !tokens?.refreshToken) return null;

      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      return tokens.accessToken;
    } catch {
      return null;
    }
  })();

  return refreshInFlight.finally(() => {
    refreshInFlight = null;
  });
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  branchId?: string;
  query?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  skipAuthRetry?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, branchId, query, timeout = DEFAULT_TIMEOUT } = options;

  const url = new URL(API_URL + path, window.location.origin);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  if (method === 'POST' || method === 'PUT') {
    headers.set('Content-Type', 'application/json');
  }
  if (branchId) headers.set('x-branch-id', branchId);
  const token = localStorage.getItem(TOKEN_KEY);
  const hadToken = Boolean(token);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError({
        statusCode: 408,
        message: 'La conexion tardo demasiado. Intente nuevamente.',
      });
    }
    throw new ApiError({ statusCode: 0, message: 'No se pudo conectar con el servidor' });
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Respuesta sin cuerpo JSON
  }

  if (!response.ok) {
    const raw = (json ?? {}) as Record<string, unknown>;
    const errorEnvelope: ErrorEnvelope = {
      statusCode: typeof raw.statusCode === 'number' ? raw.statusCode : response.status,
      errorCode:
        typeof raw.errorCode === 'string'
          ? raw.errorCode
          : typeof raw.code === 'string'
            ? raw.code
            : undefined,
      message: typeof raw.message === 'string' ? raw.message : `Error ${response.status}`,
      identifier: typeof raw.identifier === 'string' ? raw.identifier : undefined,
      property: typeof raw.property === 'string' ? raw.property : undefined,
      details: raw.details,
      metadata: raw.metadata,
    };

    const isPermissionError = errorEnvelope.errorCode === 'USER_NOT_ADMIN';

    if (
      response.status === 401 &&
      hadToken &&
      !path.startsWith('/auth/') &&
      !isPermissionError &&
      !options.skipAuthRetry
    ) {
      const newToken = await requestNewAccessToken();
      if (newToken) {
        return request<T>(path, { ...options, skipAuthRetry: true });
      }
      clearSessionStorage();
      window.location.href = '/login';
    }

    throw new ApiError(errorEnvelope);
  }

  if (json && typeof json === 'object' && 'payload' in json) {
    return (json as Envelope<T>).payload as T;
  }
  throw new ApiError({
    statusCode: 500,
    message: 'Respuesta del servidor con formato inesperado',
  });
}
