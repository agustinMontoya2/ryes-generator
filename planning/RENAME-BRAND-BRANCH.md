# Plan — Renaming: marca Ryes → `lab Cv`, entidad Ryes → Branch

Fecha: 2026-08-14 · Estado: **planificación** (no ejecutado)

Reemplaza todas las referencias a "Ryes" en el repositorio, con dos objetivos separados:

1. **Marca** (strings visuales): "Ryes" → `lab Cv`, mediante una constante única `BRAND_NAME` para que el nombre definitivo sea un cambio de un solo lugar.
2. **Entidad sucursal**: el tipo `Ryes` y su identificador (`ryesId` / `RyesId` / `X-Ryes-Id`) pasan a `Branch` / `branchId` / `BranchId` / `X-Branch-Id`, en todo el stack (código, docs y spec OpenAPI).

## 0. Mapa de renombres (una sola fuente)

| Antes                                                     | Después                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| `Ryes` (marca, strings visuales)                          | `{BRAND_NAME}` con `BRAND_NAME = 'lab Cv'`                     |
| `ryes` (slug en keys/creds)                               | `BRAND_SLUG = 'lab-cv'`                                        |
| `interface Ryes` / `model Ryes`                           | `Branch`                                                       |
| `mockRyes`                                                | `mockBranches`                                                 |
| `RyesSelection` / `RyesDashboard` (+ archivos)            | `BranchSelection` / `BranchDashboard`                          |
| ruta `/ryes/:id`                                          | `/branches/:id`                                                |
| `ryesId` (campo)                                          | `branchId`                                                     |
| `RyesId` (param / openapi)                                | `BranchId`                                                     |
| header `X-Ryes-Id`                                        | `X-Branch-Id`                                                  |
| `RyesModule`, `@RyesId()`                                 | `BranchModule`, `@BranchId()`                                  |
| `/ryes` (endpoint), `listRyes`, schema `Ryes`, tag `Ryes` | `/branches`, `listBranches`, `Branch`                          |
| `ryes_token` / `ryes_user`                                | `` `${BRAND_SLUG}_token` `` / `` `_user` ``                    |
| `u-ryes-1`                                                | `` `u-${BRAND_SLUG}-1` ``                                      |
| `operador@ryes.com` / `ryes2026`                          | `` `operador@${BRAND_SLUG}.com` `` / `` `${BRAND_SLUG}2026` `` |
| `ryes-generator` (package name)                           | `branch-generator` (ver Notas)                                 |

## 1. Código fuente

**Nuevo:** `src/app/config/brand.ts` → exporta `BRAND_NAME` y `BRAND_SLUG` (lugar único para el futuro nombre).

**Renombrados (con `git mv` para preservar historia):**

- `src/app/pages/RyesSelection.tsx` → `BranchSelection.tsx`
- `src/app/pages/RyesDashboard.tsx` → `BranchDashboard.tsx`

**Editados:**

- `src/app/types.ts` — `interface Ryes` → `Branch`.
- `src/app/data/mockData.ts` — import y `mockRyes` → `mockBranches`. Los valores `Talar`/`Moron`/`Ballester` se mantienen: son nombres de sucursal, no "ryes".
- `src/app/routes.tsx` — imports a `Branch*`; ruta `/ryes/:id` → `/branches/:id`.
- `src/app/pages/BranchSelection.tsx` — `Ryes` del `<h1>` → `{BRAND_NAME}`; "Selecciona un Ryes para gestionar" → "Selecciona una sucursal para gestionar"; variable `ryes` → `branch`; `to={`/branches/${branch.id}`}`.
- `src/app/pages/BranchDashboard.tsx` — "Volver a Ryes" → "Volver a sucursales"; variable `ryes` → `branch`.
- `src/app/pages/Login.tsx` — brand → `{BRAND_NAME}`; placeholder del email demo derivado del slug.
- `src/app/auth/auth.ts` — keys de storage, credenciales demo y user id derivados de `BRAND_SLUG`.
- `src/app/App.tsx` — `document.title = BRAND_NAME` en un efecto (single-source además del title estático).
- `index.html` — `<title>` → `lab Cv`.

## 2. Artefactos de paquete

- `package.json` name → `branch-generator`.
- `package-lock.json` se regenera con `npm install --package-lock-only`.

## 3. Documentación (planning + README)

- `README.md` — título → `# lab Cv generar remitos`.
- `planning/API-CONTRACT.md` — toda la entidad (tabla de decisiones, modelo, endpoints, Prisma, módulos, seed) a `Branch`/`branchId`/`X-Branch-Id`/`GET /branches`; marca → `lab Cv`; bump de versión `1.2.0 → 2.0.0` con nota del rename.
- `planning/api-contract.yaml` — `title`, tag `Ryes` → `Branch`, `/ryes` → `/branches`, `operationId: listRyes` → `listBranches`, schema `Ryes` → `Branch`, parámetro `RyesId` → `BranchId`, header `X-Ryes-Id` → `X-Branch-Id`, campos `ryesId` → `branchId`.
- `planning/LOGIN.md` — marca → `lab Cv`; refs a `RyesSelection`/`RyesDashboard` → `Branch*`; `/ryes/:id` → `/branches/:id`; keys demo; `X-Ryes-Id` → `X-Branch-Id`; fix de `routes.ts` → `routes.tsx`.
- **No se toca** `planning/REVIEW-2026-08-14.md` (snapshot histórico).

## 4. Diseño en Open Design (externo al repo)

- Editar `ryes-app.html` (brand en login / landing / hub, hint demo) y `brand-spec.md` con `lab Cv`.
- Nota: si el MCP de Open Design no expone escritura, este paso es manual desde la app de Open Design.

## 5. Verificación

- `npm run typecheck`
- `npm run build`
- `npm run lint`
- Flujo manual: login demo → selección de sucursal → dashboard de una sucursal (ruta `/branches/:id`).

## Notas / efectos colaterales

- El cambio de keys de `localStorage` invalida la sesión guardada (solo desarrollo, no hay datos reales).
- **Manuales, cuando se defina el nombre:** renombrar la carpeta `ryes-generator` y el repo/remote de GitHub (requieren cerrar el editor y `gh repo rename`).
- `dist/` se regenera con el build.
- El nombre del paquete `branch-generator` es provisional hasta definir la marca; puede alinearse con el slug final en una iteración posterior.
