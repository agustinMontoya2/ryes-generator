import type { Branch, LoginResponse, Paginated, User, UserProfile } from '../types';
import { mockBranches } from '../data/mockData';
import { ApiError } from './errors';

interface MockUser {
  id: string;
  email: string;
  username: string;
  password: string;
  isSuperAdmin: boolean;
  branches: string[];
}

const inMemoryUsers: MockUser[] = [
  {
    id: 'u1',
    username: 'operador',
    email: 'operador@lab-cv.com',
    password: 'lab-cv2026',
    isSuperAdmin: false,
    branches: ['1', '2'],
  },
  {
    id: 'u2',
    username: 'administrador',
    email: 'admin@lab-cv.com',
    password: 'admin2026',
    isSuperAdmin: true,
    branches: ['1', '2', '3'],
  },
];

export const DEMO_RESET_TOKEN = 'demo-reset-token';

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const isStrongPassword = (value: string) => STRONG_PASSWORD_RE.test(value);

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

function resolveBranches(ids: string[]): Branch[] {
  return ids
    .map((id) => mockBranches.find((b) => b.id === id))
    .filter((b): b is Branch => Boolean(b));
}

function toUser(user: MockUser): User {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    isSuperAdmin: user.isSuperAdmin,
    branches: resolveBranches(user.branches),
  };
}

function toProfile(user: MockUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    isSuperAdmin: user.isSuperAdmin,
  };
}

function buildToken(user: MockUser): string {
  return btoa(
    JSON.stringify({
      sub: user.id,
      isSuperAdmin: user.isSuperAdmin,
      exp: Date.now() + 8 * 60 * 60 * 1000,
    }),
  );
}

function findByIdentifier(credential: string): MockUser | undefined {
  const needle = credential.trim().toLowerCase();
  return inMemoryUsers.find(
    (u) => u.email.toLowerCase() === needle || u.username.toLowerCase() === needle,
  );
}

export async function login(input: {
  credential: string;
  password: string;
}): Promise<LoginResponse> {
  await delay();

  const user = findByIdentifier(input.credential);

  if (!user || user.password !== input.password) {
    throw new ApiError({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Credenciales inválidas',
    });
  }

  return {
    accessToken: buildToken(user),
    refreshToken: btoa(JSON.stringify({ sub: user.id, type: 'refresh' })),
  };
}

export async function getCurrentUser(accessToken: string): Promise<UserProfile> {
  await delay();

  let sub: string | undefined;

  try {
    const payload = JSON.parse(atob(accessToken)) as { sub?: string; exp?: number };
    sub = payload.sub;

    if (payload.exp && payload.exp < Date.now()) {
      throw new Error('expired');
    }
  } catch {
    throw new ApiError({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Sesión inválida',
    });
  }

  const user = inMemoryUsers.find((u) => u.id === sub);

  if (!user) {
    throw new ApiError({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Sesión inválida',
    });
  }

  return toProfile(user);
}

export async function register(input: {
  email: string;
  username: string;
  password: string;
}): Promise<{ id: string }> {
  await delay();

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim();

  if (!email || !username || !input.password) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_INPUT',
      message: 'Por favor complete todos los campos',
    });
  }

  if (!EMAIL_RE.test(email)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_INPUT',
      message: 'Ingresá un correo válido',
      property: 'email',
    });
  }

  if (username.length < 3 || username.length > 30) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_INPUT',
      message: 'El nombre de usuario debe tener entre 3 y 30 caracteres',
      property: 'username',
    });
  }

  if (!isStrongPassword(input.password)) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_INPUT',
      message:
        'La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo',
      property: 'password',
    });
  }

  if (
    inMemoryUsers.some(
      (u) => u.email.toLowerCase() === email || u.username.toLowerCase() === username,
    )
  ) {
    throw new ApiError({
      statusCode: 409,
      code: 'USER_ALREADY_EXISTS',
      message: 'Ya existe una cuenta con ese correo o usuario',
    });
  }

  const user: MockUser = {
    id: `u${inMemoryUsers.length + 1}`,
    email,
    username,
    password: input.password,
    isSuperAdmin: false,
    branches: [],
  };

  inMemoryUsers.push(user);

  return { id: user.id };
}

export async function forgotPassword(input: { credential: string }): Promise<{ success: true }> {
  await delay();

  if (!input.credential.trim()) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_INPUT',
      message: 'Ingresá tu email o usuario',
    });
  }

  return { success: true };
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<{ success: true }> {
  await delay();

  if (input.token !== DEMO_RESET_TOKEN) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_RESET_TOKEN',
      message: 'Token de restablecimiento inválido o expirado',
    });
  }

  if (input.password.length < 8) {
    throw new ApiError({
      statusCode: 400,
      code: 'INVALID_INPUT',
      message: 'La contraseña debe tener al menos 8 caracteres',
      property: 'password',
    });
  }

  return { success: true };
}

export async function getUsers(): Promise<Paginated<User>> {
  await delay();

  return {
    data: inMemoryUsers.map(toUser),
    pagination: {
      totalItems: inMemoryUsers.length,
      limit: inMemoryUsers.length,
      currentPage: 1,
      pages: 1,
    },
  };
}

export async function assignUserBranches(
  userId: string,
  branchIds: string[],
): Promise<{ id: string }> {
  await delay();

  const user = inMemoryUsers.find((u) => u.id === userId);

  if (!user) {
    throw new ApiError({
      statusCode: 404,
      code: 'RESOURCE_NOT_FOUND',
      message: 'No encontramos la cuenta',
    });
  }

  if (user.isSuperAdmin) {
    throw new ApiError({
      statusCode: 422,
      code: 'CANNOT_ASSIGN_BRANCHES_TO_SUPER_ADMIN',
      message: 'No se pueden asignar sucursales a un super admin',
    });
  }

  user.branches = branchIds;

  return { id: user.id };
}

export async function getBranches(): Promise<Branch[]> {
  await delay();
  return mockBranches;
}
