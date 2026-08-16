# Plan — Rediseño Lab Cv según prototipo de Open Design

Adaptación del diseño `lab-cv-redesign.html` (proyecto "Tenes Acceso Este Diseño" en Open Design) al proyecto React `ryes-generator` ("Lab Cv generar remitos").

## Decisiones tomadas

- **Layout:** fiel al prototipo — shell centrado (max 560px), topbar con back + logo, tabbar inferior fija con 5 pestañas, dialogs bottom-sheet en mobile / centrados ≥500px en desktop.
- **Fuente display:** Plus Jakarta Sans (500–800) vía Google Fonts CDN.
- **Alcance:** solo presentación. No cambia lógica de negocio, tipos ni rutas.
- **Modo oscuro:** se mantiene el bloque `.dark` existente; la identidad se define para el tema claro.

## Tokens de diseño (brand spec)

- `--background`: `oklch(97.5% .008 250)` (fondo frío y luminoso)
- `--surface`: `oklch(100% 0 0)` (tarjetas y paneles)
- `--fg`: `oklch(22% .022 250)` · `--muted`: `oklch(50% .02 250)`
- `--border`: `oklch(90% .012 250)`
- `--accent`: `oklch(56% .12 170)` (teal, acción/marca) · `--accent-strong`: `oklch(47% .12 170)` · `--accent-soft`: `oklch(94% .05 170)`
- `--danger`: `oklch(56% .19 25)`
- Estados: Pendiente = ámbar, Completado = verde, Entregado = azul (badge fondo suave + texto alto contraste)
- Tipografía: `--font-display: 'Plus Jakarta Sans', system-ui, sans-serif`
- Radios: 12px controles, 16px cards, pills 999px

## Tareas

### 1. Base visual

- [ ] `index.html`: preconnect + link Google Fonts `Plus Jakarta Sans` (500–800)
- [ ] `src/styles/theme.css`: reescribir `:root` con tokens OKLCH del brand spec; tokens de estado; `--radius: 1rem`; `--font-display`; mapeo en `@theme inline` (`font-display`, `--color-status-*`, `--radius-*`)
- [ ] `src/styles/index.css`: fondo de página con gradientes radiales (teal arriba-derecha, azul abajo-izquierda) y `h1–h4` con fuente display

### 2. Componentes compartidos

- [ ] `BrandTile.tsx`: tile 44px, gradiente teal, logo de muela (`Molar` de lucide-react o SVG inline)
- [ ] `PageHero.tsx`: eyebrow uppercase + h1 display + subtítulo muted + CTA derecha
- [ ] `StatusBadge.tsx`: badge pill con dot coloreado (pendiente/completado/entregado)
- [ ] Ajuste de `ui/button.tsx` / `ui/card.tsx` / `ui/badge.tsx` según tokens

### 3. Layout y shell

- [ ] Shell centrado `max-w-[560px] mx-auto` en todas las pantallas
- [ ] `TopBar.tsx`: botón back (excepto en selección de sucursal), brand tile + "Lab Cv" + ubicación, logout
- [ ] `TabBar.tsx`: barra inferior fija con blur, 5 tabs (icono + píldora activa teal): Trabajos, Pacientes, Odontólogos, Servicios, Remitos
- [ ] `BranchDashboard`: reemplazar `Tabs` de shadcn por `TabBar`; dialogs bottom-sheet/centrados

### 4. Pantallas y componentes

- [ ] **Login**: brand block + card "Bienvenido de nuevo" + demo-box con autocompletar
- [ ] **BranchSelection**: hero + row-cards con `mapPin` + chevron
- [ ] **BranchDashboard**: hero con contadores de estado, filtro por estado (funnel), CTA "Nuevo Trabajo", `sel-bar` teal (N seleccionados + total + "Generar Remito")
- [ ] **OrderList**: order-card con paciente + badge + checkbox (solo completadas), meta DNI/dentista/entrega, filas de servicios, total, acciones (editar/completar/eliminar)
- [ ] **PatientList / DentistList / ServiceList**: row-cards con avatar/icono + título + sub + precio + acciones
- [ ] **JobReportList**: cards de remito (meta, chips de paciente, total, "Ver remito")
- [ ] **JobReportView**: hoja imprimible — header brand + "Remito #…", KPIs (fecha entrega / total), bloques por trabajo con servicios + subtotal, footer "TOTAL REMITO", botón imprimir; CSS print ajustado a la nueva estructura
- [ ] **JobReportDialog**: barra de selección + fecha de entrega
- [ ] **Forms** (Order/Patient/Dentist/Service): inputs con focus teal, combo de odontólogos, check-list de servicios con total vivo
- [ ] **Vacíos**: card dashed con tile de icono + mensaje

### 5. Verificación

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run format:check`
