import { request } from './client';
import type { GenericID } from './types';
import type { LoginResponse } from '../types';

export interface LoginDto {
  credential: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface ForgotPasswordDto {
  credential: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export function login(dto: LoginDto): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', { method: 'POST', body: dto });
}

export function register(dto: RegisterDto): Promise<GenericID> {
  return request<GenericID>('/auth/register', { method: 'POST', body: dto });
}

export function forgotPassword(dto: ForgotPasswordDto): Promise<{ success: true }> {
  return request<{ success: true }>('/auth/forgot-password', { method: 'POST', body: dto });
}

export function resetPassword(dto: ResetPasswordDto): Promise<{ success: true }> {
  return request<{ success: true }>('/auth/reset-password', { method: 'POST', body: dto });
}

export function refresh(dto: RefreshTokenDto): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/refresh', { method: 'POST', body: dto });
}
