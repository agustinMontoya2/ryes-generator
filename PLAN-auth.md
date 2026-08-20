# Plan — Páginas de autenticación y admin en ryes-generator

Recreación de las pantallas `login`, `register`, `forgot`, `password` (reset) y `admin` del prototipo `lab-cv-redesign.html` (proyecto "Tenes Acceso Este Diseño" en Open Design) en el proyecto React `ryes-generator`.

> **Contexto de ramas:** esta rama es una **demo de diseño**; la API real ya está conectada en otra rama. Todo el acceso a datos pasa por una capa `src/app/api/` aislada que **mimetiza los contratos** de `contracts/` (auth, users, branches). Reemplazar la capa por el cliente real no debe tocar la UI.

## Decisiones tomadas

- **Mock en memoria:** cuentas demo fijas (operador + admin); `register` y asignaciones de `admin` viven solo en memoria/sesión.
- **Aislar en `src/app/api/`:** una función por endpoint del contrato, devolviendo los payloads exactos; un solo tipo de error (`ApiError` con `code`). Las páginas importan solo desde esa carpeta → swap trivial en otra sesión.
- **Alineado a `contracts/`:** `credential` (email o username) en login/forgot, `username`/`isSuperAdmin`, `branches` como `{ id, location }[]`, JWT `{ sub, isSuperAdmin }`, respuesta de register = `{ id }`.
- **Contraseña por contrato:** register exige contraseña fuerte (mayúscula, minúscula, número, símbolo) y reset pide min 8.
- **Auto-login tras registrar:** `register` devuelve `{ id }` (sin token); el frontend llama a `login` con esas credenciales.
- **Token de reset (demo):** token fijo `DEMO_RESET_TOKEN`; `resetPassword` lo valida y devuelve `INVALID_RESET_TOKEN` si no coincide. La pantalla de forgot muestra el enlace de demo `/password/{DEMO_RESET_TOKEN}`.
- **URLs en envs:** host y path base de la API (`VITE_API_BASE_URL` / `VITE_API_PREFIX`) van en variables de entorno, no hardcodeadas. La capa mock no hace fetch, pero la config de URL queda lista para el cliente real.
- **Sin template de email:** fuera de alcance `email-restablecer-contrasena.html`.
- **Alcance:** solo presentación y mock; `BranchSelection` y `mockData` no cambian.

## Tareas

### 1. Tipos (`src/app/types.ts`)

- [ ] `User` → shape del serializer de `contracts/users.md`: `{ id, email, username, isSuperAdmin, branches?: Branch[] }` (`branches` como objetos `{ id, location }`, ya no `string[]`). Renombra `name` → `username` y `superAdmin` → `isSuperAdmin`.
- [ ] `LoginResponse` → `{ accessToken, refreshToken }` (per `contracts/auth.md`).
- [ ] `UserProfile` (GET `/users/me`): `{ id, email, username, isSuperAdmin }` — la sesión guarda el perfil, no el objeto completo.

### 2. Capa API mock (`src/app/api/`)

- [ ] `src/app/api/config.ts` (nuevo): `VITE_API_BASE_URL` y `VITE_API_PREFIX` desde envs (con default de demo); exporta `apiBaseUrl` para el cliente real futuro.
- [ ] `src/app/api/errors.ts` (nuevo): `ApiError extends Error` con `{ code, message, identifier?, property? }` (envelope de error del contrato).
- [ ] `src/app/api/mock.ts` — refactor como cliente mock, una función por endpoint del contrato:
  - `login({ credential, password })` → `{ accessToken, refreshToken }` · `INVALID_CREDENTIALS`.
  - `getCurrentUser()` → `{ id, email, username, isSuperAdmin }` (`/users/me`).
  - `register({ email, username, password })` → `{ id }` · `USER_ALREADY_EXISTS`; validaciones: email, username 3–30, contraseña fuerte.
  - `forgotPassword({ credential })` → `{ success: true }`.
  - `resetPassword({ token, password })` → `{ success: true }` · `INVALID_RESET_TOKEN` si `token !== DEMO_RESET_TOKEN`; password min 8.
  - `getUsers()` → `{ data, pagination }` (solo superadmin; per `users.md`).
  - `assignUserBranches(userId, branchIds)` → `{ id }` · `CANNOT_ASSIGN_BRANCHES_TO_SUPER_ADMIN` (per `POST /users/:id/branches`).
  - `getBranches()` → `Branch[]` (array directo, no paginado; per `branches.md`).
  - Exporta cuentas demo (operador/admin), `DEMO_RESET_TOKEN` y helpers de validación (regex de password fuerte).

### 3. Auth

- [ ] `src/app/auth/auth.ts`: `login` = mock login + `getCurrentUser()`; JWT payload `{ sub, isSuperAdmin }`; `register` = mock register + auto-login; sesión guarda tokens + perfil.
- [ ] `AuthContext.tsx`: `user: UserProfile | null`; `register({ email, username, password })` (login automático tras el alta).
- [ ] `src/app/auth/RequireAdmin.tsx`: guard que redirige a `/` si no hay sesión o `!user.isSuperAdmin`.
- [ ] `src/app/routes.tsx`: rutas públicas `/register`, `/forgot`, `/password`, `/password/:token`; `/admin` bajo `RequireAdmin`; `/password` sin token requiere sesión (si no, a `/login`).

### 4. Layout compartido de auth

- [ ] `src/app/components/AuthLayout.tsx` (nuevo): refactor del layout actual de Login — fondo centrado `min-h-screen`, brand block (BrandTile + "Lab Cv" + subtítulo) y card contenedora.

### 5. Páginas

- [ ] **Login** (`Login.tsx`): campo `credential` ("Email o usuario"), link "¿Olvidaste tu contraseña?" → `/forgot`, link "Crear cuenta" → `/register`, demo-box con 2 botones (Operador / Admin) y redirección tras login a `/admin` si `isSuperAdmin`, si no a `/`.
- [ ] **Register** (`src/app/pages/Register.tsx`): "Crear cuenta" — `username`, email, contraseña fuerte, repetir contraseña; validaciones inline + toasts; link "¿Ya tenés cuenta? → Iniciar sesión". Al registrarse: auto-login y navegar a `/`.
- [ ] **ForgotPassword** (`src/app/pages/ForgotPassword.tsx`): campo `credential`; dos estados — formulario → "Enlace enviado" (ícono check + "Si la cuenta X existe, enviamos un enlace…") + enlace de demo `/password/{DEMO_RESET_TOKEN}` + botón "Volver al inicio de sesión".
- [ ] **ResetPassword** (`src/app/pages/ResetPassword.tsx`): "Restablecer contraseña" — nueva (min 8) + repetir; acepta `:token` vía `useParams` y valida `DEMO_RESET_TOKEN`; guarda y navega a `/login` con toast.
- [ ] **Admin** (`src/app/pages/Admin.tsx`): `AppShell` + `TopBar` (back + subtitle "Panel superadmin") + `PageHero` ("Administración" / "Usuarios") + lista de `UserCard`.
- [ ] **UserCard** (`src/app/components/UserCard.tsx`): avatar con iniciales de `username`, `username` + email, badge `Superadmin`/`Operador`, chips de `user.branches` (objetos, sin cruzar con `getBranches`) y botón "Asignar".
- [ ] **AdminBranchesDialog** (`src/app/components/AdminBranchesDialog.tsx`): `ui/dialog` con check-list de sucursales + Cancelar/Guardar; Guardar usa `assignUserBranches(userId, branchIds)` + toast "Sucursales actualizadas".
- [ ] **BranchSelection / mockData**: sin cambios.

### 6. Verificación

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Prettier (`--check`) en archivos tocados

## Referencia

- Contratos: [`contracts/auth.md`](./contracts/auth.md) · [`contracts/users.md`](./contracts/users.md) · [`contracts/branches.md`](./contracts/branches.md)
- Prototipo: `lab-cv-redesign.html` (proyecto "Tenes Acceso Este Diseño", Open Design)
