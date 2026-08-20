export interface ApiErrorPayload {
  statusCode: number;
  code: string;
  message: string;
  identifier?: string;
  property?: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly identifier?: string;
  readonly property?: string;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.code = payload.code;
    this.statusCode = payload.statusCode;
    this.identifier = payload.identifier;
    this.property = payload.property;
  }
}
