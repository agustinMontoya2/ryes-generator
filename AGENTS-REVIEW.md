# AGENTS-REVIEW.md — Revisión de calidad de código reutilizable

Template portable para revisar la calidad de código de **cualquier proyecto** (frontend, backend, monorepo). Copiá este archivo a la raíz del proyecto objetivo y ejecutá la revisión con la sección "Instrucciones de uso".

## Instrucciones de uso

1. Copiá este archivo a la raíz del proyecto a revisar (ej. `AGENTS-REVIEW.md`).
2. Ejecutá la revisión con este prompt:

```
Hacé una revisión de calidad de código de este proyecto. NO modifiques nada, solo análisis.
Seguí la checklist de AGENTS-REVIEW.md al pie de la letra: contexto → cobertura completa →
quality gates → checklist por categoría → entrega con severidad y prioridades.
```

3. Reglas del reviewer: **no editar archivos**, **no asumir frameworks**, reportar severidad primero y evitar sobre-ingeniería.

---

## 1. Contexto (5 min)

- `AGENTS.md` (si existe), `README.md`, `package.json`, `tsconfig`, config de linter/formatter.
- Stack y versiones, scripts de calidad disponibles, arquitectura canónica documentada.
- Framework/librerías realmente usados (no los asumas por el nombre del repo).

## 2. Cobertura completa

- Leé **todos** los archivos fuente: componentes, hooks, servicios, utils, estilos, config, datos, tipos.
- No saltees archivos "aburridos" (config, datos) — ahí suelen estar los bugs de contenido.
- Para proyectos grandes, priorizá por capas: entrada → UI → lógica → datos → infra.

## 3. Quality gates

- Si el proyecto documenta comandos de calidad, ejecutalos y reportá el resultado real:
  `typecheck`, `lint`, `build`, `format` (o equivalentes).
- Un hallazgo de la revisión manual NO vale si los quality gates fallan.

## 4. Checklist por categoría

### Bugs

- Imports/export rotos, props mal tipadas, anclas/links con destino inexistente.
- Estado que no resetea, condiciones imposibles, `undefined` no controlado.
- Valores hardcodeados que contradicen la fuente de datos (precios, textos, links).
- Lógica duplicada / copy-paste que debería centralizarse.

### Arquitectura

- ¿Respeta la estructura canónica del proyecto? ¿dónde debería vivir cada cosa?
- Datos de negocio centralizados o repetidos en componentes.
- Una sola fuente de verdad: config, datos tipados, builders/templates.
- Composición limpia: componentes de presentación sin estado ni estilos inline.

### Estilos

- Colores/fuentes/spacing inline repetidos en vez de tokens de diseño.
- Clases inexistentes, utilidades mal escritas, estilos duplicados entre CSS y JSX.
- Consistencia con el sistema de diseño existente.

### Accesibilidad

- Landmarks (`header/main/footer/nav`), jerarquía de títulos.
- Roles ARIA correctos (tabs, dialogs, alerts) y `aria-*` coherentes con el estado.
- `alt` en imágenes, `aria-hidden` en decorativos, `label`/`title` en iframes.
- `target="_blank"` SIEMPRE con `rel="noopener noreferrer"`.
- Navegación por teclado: focus visible, orden de tab, patrón de tabs con flechas.
- Contraste evidente, textos que se leen sin contexto.

### Rendimiento

- `loading="lazy"` en imágenes below-the-fold (no en las de arriba).
- Re-renders innecesarios (estado subido de nivel, keys inestables).
- Bundles grandes o librerías pesadas para algo trivial.

### Seguridad

- Secretos/API keys en el repo o en el bundle.
- Input de usuario inyectado como HTML (usar `dangerouslySetInnerHTML` solo con sanitización).
- URLs armadas con datos sin encode (query params, redirecciones).

## 5. Entrega

Clasificá cada hallazgo con esta severidad (ejemplos):

- **[BUG]** Rompe funcionalidad o muestra datos falsos. Ej: link a `#seccion` que no existe, precio hardcodeado que contradice la data.
- **[ACCESIBILIDAD]** Impacta usuarios de teclado/lector de pantalla.
- **[MENOR]** Inconsistencia o mejora de calidad con poco riesgo.
- **[OPCIONAL]** Preferencia o pulido; puede descartarse.

Formato por hallazgo:

```
- [SEVERIDAD] Descripción concisa — `archivo:línea`
  Fix sugerido: ...
```

Cierre:

- **Top 5 prioridades** (los que primero corregiría).
- **Descartables** (los que el dueño puede ignorar sin drama).
- **Quality gates**: resultado real de cada comando.
