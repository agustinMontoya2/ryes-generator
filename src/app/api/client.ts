import { BRAND_SLUG } from '../config/brand';
import type { Envelope, ErrorEnvelope } from './types';

const TOKEN_KEY = `${BRAND_SLUG}_token`;

export const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode?: string;
  readonly details?: unknown;
  readonly metadata?: unknown;

  constructor(envelope: ErrorEnvelope) {
    super(envelope.message || `Error ${envelope.statusCode || 'desconocido'}`);
    this.name = 'ApiError';
    this.statusCode = envelope.statusCode;
    this.errorCode = envelope.errorCode;
    this.details = envelope.details;
    this.metadata = envelope.metadata;
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado';
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  branchId?: string;
  query?: Record<string, string | number | undefined>;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, branchId, query } = options;

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
  headers.set('Content-Type', 'application/json');
  if (branchId) headers.set('x-branch-id', branchId);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError({ statusCode: 0, message: 'No se pudo conectar con el servidor' });
  }

  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Respuesta sin cuerpo JSON
  }

  if (!response.ok) {
    const errorEnvelope: ErrorEnvelope = (json as ErrorEnvelope) ?? {
      statusCode: response.status,
      message: `Error ${response.status}`,
    };
    throw new ApiError(errorEnvelope);
  }

  return (json as Envelope<T>)?.payload as T;
}
