# Contrato de API — Ryes generar remitos

Versión: 1.2.0 — Fecha: 2026-08-14
Estado: **planificación** (no implementado)

Este documento define el contrato entre el frontend React (`ryes-generator`) y el backend que se va a construir. Complementa la spec machine-readable en [`api-contract.yaml`](./api-contract.yaml).

## 1. Contexto

La plataforma es una herramienta interna de un laboratorio dental con varias sucursales ("Ryes"). Hoy el frontend funciona 100% con datos mock (`src/app/data/mockData.ts`) y estado local en `RyesDashboard` (los cambios se pierden al recargar). Para hacerla funcional se reemplazan los mocks por llamadas a una API REST.

## 2. Decisiones tomadas

| Decisión | Valor | Justificación |
| --- | --- | --- |
| Stack backend | Node + NestJS | Framework estructurado; el frontend ya es TypeScript |
| Autenticación | Sin auth | Herramienta interna de uso cerrado |
| Alcance de datos | Todo por sucursal | Cada Ryes tiene sus órdenes, pacientes, odontólogos, servicios y remitos |
| Ryes (sucursales) | Fijos, solo lectura (`GET /ryes`) | Se siembran en la base; no se administran desde la app |
| Base URL | `/api/v1` | Versionado explícito |
| Contexto de sucursal | `ryesId` en el header obligatorio `X-Ryes-Id` | Los endpoints son por entidad (`/patients`, `/orders`, ...), no anidados bajo `/ryes/{ryesId}`; el contexto no viaja en la ruta ni en el body |
| IDs | UUID (generados por backend) | Reemplaza el bug actual de `id: String(length + 1)` |
| Moneda | Enteros en ARS | `price` / `totalPrice` sin decimales (como hoy) |
| Fechas | ISO-8601 (`YYYY-MM-DD` para fechas de negocio; `createdAt`/`updatedAt` con hora) | Formato estándar |

## 3. Modelo de datos

```
Ryes       { id: uuid, location: string }
Patient    { id: uuid, ryesId: uuid, fullname: string, dni: int, createdAt, updatedAt }
Dentist    { id: uuid, ryesId: uuid, name: string, lastname: string, createdAt, updatedAt }
Service    { id: uuid, ryesId: uuid, name: string, price: int, createdAt, updatedAt }
Order      { id: uuid, ryesId: uuid, patientId, dentistId, dispatchDate, dueDate,
             lab, status, serviceIds[], createdAt, updatedAt }
JobReport  { id: uuid, ryesId: uuid, deliveryDate, totalPrice, orderIds[], createdAt }
```

### 3.1 Relaciones

- **Patient**: `(ryesId, dni)` es único → el `lookup` por DNI del formulario de órdenes es confiable.
- **Order**: referencia a `Patient`, `Dentist` y `Service[]` por ID.
- **JobReport**: referencia a `Order[]`. Al generarse se guarda el **snapshot** de cada orden (ver regla 3).

### 3.2 Forma de los request vs response

- **Requests** (crear/editar): las órdenes y remitos envían **IDs** (`patientId`, `dentistId`, `serviceIds`, `orderIds`).
- **Responses**: los objetos completos se **embeben** (`patient: Patient`, `dentist: Dentist`, `services: Service[]`, `orders: Order[]`) para que los componentes (`OrderList`, `JobReportView`, etc.) sigan consumiendo los mismos campos de hoy y no hagan joins client-side.

## 4. Endpoints

Base: `/api/v1`. Un controlador por entidad (`PatientsController`, `OrdersController`, ...). Todos los recursos **excepto `/ryes`** requieren el header obligatorio `X-Ryes-Id` con el UUID de la sucursal. El `ryesId` nunca viaja en la ruta ni en el body.

Ejemplo: `GET /api/v1/orders` con header `X-Ryes-Id: a1b2...` · `POST /api/v1/reports` con header `X-Ryes-Id: a1b2...`

| Método | Path | Descripción | Éxito | Errores |
| --- | --- | --- | --- | --- |
| `GET` | `/ryes` | Lista de sucursales (fija) | `200` | — |
| `GET` | `/patients` | Lista pacientes. `?search=` por nombre o DNI | `200` | `400` |
| `GET` | `/patients/lookup?dni=` | Autofill del OrderForm | `200` | `400`, `404` |
| `POST` | `/patients` | Crear paciente | `201` | `400`, `409` (DNI duplicado) |
| `GET` | `/patients/{id}` | Detalle | `200` | `400`, `404` |
| `PUT` | `/patients/{id}` | Actualizar | `200` | `400`, `404`, `409` |
| `DELETE` | `/patients/{id}` | Eliminar | `204` | `400`, `404`, `409` (referenciado) |
| `GET` | `/dentists` | Lista. `?search=` por nombre/apellido | `200` | `400` |
| `POST` | `/dentists` | Crear | `201` | `400` |
| `GET` | `/dentists/{id}` | Detalle | `200` | `400`, `404` |
| `PUT` | `/dentists/{id}` | Actualizar | `200` | `400`, `404` |
| `DELETE` | `/dentists/{id}` | Eliminar | `204` | `400`, `404`, `409` (referenciado) |
| `GET` | `/services` | Lista | `200` | `400` |
| `POST` | `/services` | Crear | `201` | `400` |
| `GET` | `/services/{id}` | Detalle | `200` | `400`, `404` |
| `PUT` | `/services/{id}` | Actualizar | `200` | `400`, `404` |
| `DELETE` | `/services/{id}` | Eliminar | `204` | `400`, `404`, `409` (referenciado) |
| `GET` | `/orders` | Lista. `?status=` y `?search=` | `200` | `400` |
| `POST` | `/orders` | Crear | `201` | `400`, `422` |
| `GET` | `/orders/{id}` | Detalle | `200` | `400`, `404` |
| `PUT` | `/orders/{id}` | Actualizar | `200` | `400`, `404`, `409` |
| `DELETE` | `/orders/{id}` | Eliminar | `204` | `400`, `404`, `409` (en remito) |
| `POST` | `/orders/{id}/complete` | `pending → completed` | `200` | `400`, `404`, `422` (estado no válido) |
| `GET` | `/reports` | Lista remitos | `200` | `400` |
| `GET` | `/reports/{id}` | Detalle | `200` | `400`, `404` |
| `POST` | `/reports` | Generar remito | `201` | `400`, `422` (órdenes no completadas) |
| `DELETE` | `/reports/{id}` | Eliminar remito (opcional) | `204` | `400`, `404` |

> Todos los requests a recursos de entidad llevan el header `X-Ryes-Id` (la tabla no lo repite en cada fila).

### 4.1 Esquema de errores

Todos los errores devuelven:

```json
{
  "error": {
    "code": "ORDER_NOT_COMPLETED",
    "message": "Solo las órdenes completadas pueden incluirse en un remito",
    "details": { "orderId": "..." }
  }
}
```

| Código HTTP | Uso |
| --- | --- |
| `400` | Validación de campos (incluye header `X-Ryes-Id` ausente o inválido) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (DNI duplicado, entidad referenciada) |
| `422` | Regla de negocio (transición de estado inválida, remito con órdenes no completadas) |

## 5. Reglas de negocio

1. **Estados de orden**: `pending → completed → submitted`. Solo transiciones válidas:
   - `pending → completed` (endpoint `POST .../orders/{id}/complete`).
   - `completed → submitted` (implícito al generar un remito).
   - Editar o borrar una orden `submitted` → `409`.
2. **Remito**: solo puede incluir órdenes `completed`.
3. **Generar remito es atómico** (`POST /reports`):
   - Valida que todas las `orderIds` existan y estén `completed`.
   - Calcula `totalPrice` = suma de los precios **vigentes** de los servicios de cada orden.
   - Persiste el remito con el snapshot de cada orden (la orden embebida queda congelada en ese momento).
   - Marca cada orden como `submitted`.
   - Todo dentro de una única transacción de base.
4. **Total de una orden** = suma de los precios de sus servicios (calculado en el backend, nunca enviado por el cliente).
5. **DNI único por Ryes**. El OrderForm busca paciente por DNI (`GET /patients/lookup?dni=` con header `X-Ryes-Id`); si no existe, primero `POST /patients` y luego `POST /orders` con el `patientId` nuevo.
6. **Odontólogo por nombre**: el OrderForm ofrece sugerencias (`GET /dentists?search=` con header `X-Ryes-Id`). Si no existe el odontólogo escrito, se crea con `POST /dentists` antes de crear la orden (corrige el bug actual en `OrderForm.tsx:106-122` donde el odontólogo nunca se persistía).
7. **Borrado con referencias**: eliminar un `Patient`, `Dentist` o `Service` que esté referenciado por una orden o remito → `409`.

## 6. Consideraciones para implementar en NestJS

- **Módulos**: un módulo por recurso (`RyesModule`, `PatientsModule`, `DentistsModule`, `ServicesModule`, `OrdersModule`, `ReportsModule`) + `PrismaModule` global. Cada controller usa su ruta base (`@Controller('patients')`, `@Controller('orders')`, ...).
- **Contexto de sucursal**: un decorador `@RyesId()` que lea el header `X-Ryes-Id`, valide que sea un UUID y que la sucursal exista (en `RyesModule`), y lo inyecte en el handler. Todos los repositorios filtran SIEMPRE por `ryesId`, nunca solo por `id`.
- **ORM**: Prisma con este schema relacional:

```prisma
model Ryes      { id String @id @default(uuid()); location String }
model Patient   { id String @id @default(uuid()); ryesId String; fullname String; dni Int
                  orders Order[]; @@unique([ryesId, dni]) }
model Dentist   { id String @id @default(uuid()); ryesId String; name String; lastname String; orders Order[] }
model Service   { id String @id @default(uuid()); ryesId String; name String; price Int
                  orders OrderService[] }
model Order     { id String @id @default(uuid()); ryesId String; patientId String; dentistId String
                  dispatchDate DateTime; dueDate DateTime; lab String; status OrderStatus
                  patient Patient @relation(fields: [patientId], references: [id])
                  dentist Dentist @relation(fields: [dentistId], references: [id])
                  services OrderService[]; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
model OrderService { orderId String; serviceId String; service Service @relation(fields:[serviceId], references:[id]) @@id([orderId, serviceId]) }
model JobReport { id String @id @default(uuid()); ryesId String; deliveryDate DateTime; totalPrice Int
                  orders JobReportOrder[]; createdAt DateTime @default(now()) }
model JobReportOrder { reportId String; orderId String; orderSnapshot Json @@id([reportId, orderId]) }
enum OrderStatus { pending completed submitted }
```

  > El snapshot de cada orden dentro del remito se puede persistir como `Json` en `JobReportOrder` (congela paciente/odontólogo/servicios al momento de generar).

- **Validaciones** con `class-validator` (DNI numérico positivo, fechas válidas, `orderIds`/`serviceIds` no vacíos, `dueDate >= dispatchDate`).
- **Excepciones** mapeadas a `400/404/409/422` con el formato de error del contrato (custom `ExceptionFilter` o `HttpException` con body consistente).
- **Transacciones**: el `POST /reports` y el `POST /orders/{id}/complete` usan `prisma.$transaction`.
- **Seed**: crear los 3 Ryes fijos (`Talar`, `Moron`, `Ballester`) y datos de ejemplo para desarrollo.

## 7. Plan de integración del frontend (fases)

1. **Tipos canónicos**: reemplazar `src/app/types.ts` por los tipos del contrato (mismos nombres de campo, suma `ryesId`, mantiene compatibilidad con componentes).
2. **Capa de API client**: `src/app/api/client.ts` (fetch tipado con `VITE_API_URL`, manejo de errores del contrato) + módulos por recurso (`ryes.ts`, `patients.ts`, `dentists.ts`, `services.ts`, `orders.ts`, `reports.ts`). Cada función recibe `ryesId` y lo envía como header `X-Ryes-Id`.
3. **RyesSelection**: reemplazar `mockRyes` por `GET /ryes`.
4. **RyesDashboard**: reemplazar los `useState(mock...)` por data fetching; los handlers (`handleSubmitOrder`, `handleGenerateReport`, etc.) pasan a llamar la API (crear/actualizar/eliminar) y refrescan la colección.
5. **OrderForm**: el alta de paciente/odontólogo "inline" pasa a `POST /patients` / `POST /dentists` (función async antes de `POST /orders`).
6. **Verificación**: `npm run build`; probar el flujo completo (crear orden → completar → generar remito → imprimir).

## 8. Fuera de alcance (futuras iteraciones)

- Autenticación y roles.
- CRUD de Ryes.
- Paginación server-side (hoy listas completas por sucursal).
- Búsqueda por rango de fechas en órdenes.
- Descarga/imprimir remito en PDF server-side (hoy el front imprime el DOM).
