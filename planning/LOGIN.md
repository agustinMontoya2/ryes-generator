# Plan — Login en lab Cv

Fecha: 2026-08-14 · Estado: **planificación** (no implementado)

Agrega autenticación de acceso a la plataforma. Hoy la app es 100% abierta: `routes.tsx` expone `/` (BranchSelection) y `/branches/:id` (BranchDashboard) sin ninguna barrera.

Este documento es complementario de [`API-CONTRACT.md`](./API-CONTRACT.md), que en su decisión "Autenticación: **Sin auth**" queda **obsoleta a partir de esta feature**.

## 1. Contexto

- **Frontend** (`src/app/`): React 18 + react-router 7 + Tailwind 4 + shadcn/Radix. Ruteo por `createBrowserRouter` en `routes.tsx`. Sin contexto global de usuario ni guardias de ruta.
- **Backend**: aún no existe (mock local en `mockData.ts`). El contrato de API está definido en `planning/API-CONTRACT.md` y prevé NestJS + Prisma.
- **Referencia visual**: el diseño en Open Design (`ryes-app.html`, `renderLogin()`) ya incluye la pantalla de login que queremos replicar:
  - Marca centrada `lab Cv`, subtítulo de contexto.
  - Campos `email` (con `autocomplete="email"`) y `password` (con `autocomplete="current-password"` + botón ojo para mostrar/ocultar contraseña).
  - Botón primario `Ingresar` full-width (accent azul marino `#030213`).
  - Estilo plano light-first: fondo gray-50, tarjeta blanca, radios 8px en controles, inputs rellenos `#f3f3f5`.

## 2. Decisiones tomadas

| Decisión                 | Valor                                              | Justificación                                                                         |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Mecanismo                | JWT (access token)                                 | Stateless, encaja con la API REST del contrato                                        |
| Login                    | `POST /auth/login` (email + password)              | Un solo endpoint, sin flujos de registro por ahora                                    |
| Usuario                  | Modelo `User` nuevo: `{ id, email, passwordHash }` | App de una sola persona; sin roles ni vínculo a sucursal. Se siembra desde el backend |
| Almacenamiento del token | `localStorage` (`<BRAND_SLUG>_token`)              | Simplicidad; se acepta el riesgo XSS del token (herramienta interna)                  |
| Persistencia de sesión   | `localStorage` → la sesión sobrevive al reload     | Recargar la app no debe desloguear                                                    |
| Protección de rutas      | Guardia de ruta en el router + redirect a `/login` | React-router `loader`/`Component` con wrapper `RequireAuth`                           |
| Contraseñas              | `bcrypt` (hash, nunca en claro) en el backend      | Regla de seguridad mínima                                                             |

> Alternativa descartada: sesión por cookie `httpOnly`. Es más segura pero requiere manejar CSRF y es un cambio mayor en el contrato; se evalúa en una iteración futura.

## 3. Modelo de datos (backend)

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

- `User.email` es único a nivel global (el login no requiere contexto de sucursal).

## 4. Endpoints

Base: `/api/v1`. Se agrega un `AuthModule` con `AuthController`.

| Método | Path          | Descripción                                   | Éxito                         | Errores                                            |
| ------ | ------------- | --------------------------------------------- | ----------------------------- | -------------------------------------------------- |
| `POST` | `/auth/login` | Autentica con `{ email, password }`           | `200` `{ accessToken, user }` | `400` (validación), `401` (credenciales inválidas) |
| `GET`  | `/auth/me`    | Perfil del usuario autenticado (token válido) | `200` `{ user }`              | `401` (token ausente/inválido/vencido)             |

### 4.1 Payloads

`POST /auth/login` body:

```json
{ "email": "operador@lab-cv.com", "password": "supersecreto" }
```

`200` response:

```json
{
  "accessToken": "<jwt>",
  "user": { "id": "...", "email": "operador@lab-cv.com" }
}
```

### 4.2 Errores

- `400` — campos faltantes o email con formato inválido.
- `401` — credenciales incorrectas (respuesta genérica, no revela si el email existe).
- `401` — token ausente, malformado o expirado en recursos protegidos.

## 5. Reglas de negocio

1. **Logout es client-side** (se descarta el token del `localStorage`); no se mantiene lista de revocación.
2. **Seed**: crear un usuario para desarrollo.

## 6. Plan de integración del frontend

1. **Tipos**: agregar `User`, `LoginResponse` a `src/app/types.ts`.
2. **API client**: en `src/app/api/client.ts` agregar `login(email, password)` y `me()`; el client de recursos pasa a enviar `Authorization: Bearer <token>` además de `X-Branch-Id`.
3. **Auth context**: `src/app/auth/AuthContext.tsx` con `{ user, status, login, logout }`; en el mount llama a `me()` con el token guardado para restaurar sesión.
4. **Página de login**: `src/app/pages/Login.tsx` replicando el diseño del deck de Open Design (brand `lab Cv`, email + password con toggle, botón `Ingresar`). Errores de credenciales → `sonner` toast y campo marcado.
5. **Guarda de ruta**: wrapper `RequireAuth` que, si `status === 'unauthenticated'`, redirige a `/login`; si está autenticado y entra a `/login`, redirige a `/`. Layout sin autenticación (login) vs con autenticación (BranchSelection/BranchDashboard) quedan separados en el router.
6. **Logout**: botón en `BranchSelection` (como el `hub-logout` del deck) que invoca `logout()` y vuelve a `/login`.
7. **Verificación**: `npm run typecheck && npm run build`; flujo manual: login ok → navega a sucursal; login fallido → 401 con mensaje; reload → sesión restaurada; logout → vuelve a `/login` y las rutas internas redirigen.

## 7. Alcance

### Incluye

- Login/logout, restauración de sesión, guardia de rutas.
- Contrato de backend (`AuthModule`, `User`, `POST /auth/login`, `GET /auth/me`).
- Seed de un usuario para desarrollo.

### Fuera de alcance (futuras iteraciones)

- CRUD de usuarios.
- Recuperación/cambio de contraseña y registro.
- Cookies `httpOnly` + CSRF, 2FA, refresh tokens.

## 8. Impacto en documentación existente

- `planning/API-CONTRACT.md` §2 — cambiar la fila "Autenticación: Sin auth" por referencia a este documento.
- `planning/API-CONTRACT.md` §4 — el header `X-Branch-Id` pasa a exigir además `Authorization: Bearer <token>`.
- `planning/API-CONTRACT.md` §8 — quitar "Autenticación y roles" de la lista de fuera de alcance.
