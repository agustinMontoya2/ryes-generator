# Ryes generar remitos

Herramienta interna para gestionar las órdenes de trabajo de un laboratorio dental y generar remitos de entrega por Rye.

## Funcionalidades

- **Órdenes**: alta, edición, baja y cambio de estado (pendiente → completada → entregada).
- **Pacientes, odontólogos y servicios**: CRUD completo desde la misma pantalla.
- **Remitos**: selección de órdenes completadas, generación de remito con totales y vista imprimible.
- **Filtros**: órdenes por estado (pendientes, completadas, entregadas).

## Stack

- React 18 + TypeScript (modo estricto)
- Vite 6
- Tailwind CSS 4 + componentes shadcn/ui (Radix UI)
- React Router 7
- date-fns

## Requisitos

- Node.js 18 o superior

## Instalación

```bash
npm i
```

## Desarrollo

```bash
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Quality gates

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run format      # prettier --write .
npm run format:check
```
