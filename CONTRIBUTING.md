# Guía de Contribución

Convenciones de ramas, commits y pull requests para el **frontend de Branches** (`ryes-generator`).

Estas reglas están **enforced por hooks de git** (Husky). Si no las cumplís, el commit o el push se rechazan.

---

## 1. Ramas

Formato: `<tipo>/<slug>`

| Tipo        | Uso                                      |
| ----------- | ---------------------------------------- |
| `feat/`     | Nueva funcionalidad                      |
| `fix/`      | Corrección de bugs                       |
| `chore/`    | Tareas de mantenimiento, rename, tooling |
| `refactor/` | Refactor sin cambio de comportamiento    |
| `docs/`     | Documentación                            |
| `test/`     | Tests                                    |
| `build/`    | Cambios de build/empaquetado             |
| `ci/`       | Pipeline / integración continua          |
| `style/`    | Formato, whitespace, lints               |
| `perf/`     | Performance                              |
| `revert/`   | Revert de commits                        |
| `release/`  | Preparación de releases                  |

Ejemplos:

```
feat/login-screen
fix/remito-print
chore/rename-ryes-to-branches
refactor/auth-guards
```

Trunks permitidos (sin `<tipo>/`): `main`, `develop`, `dev`, `staging`. También se permiten `dependabot/*` y `renovate/*`.

El slug va en kebab-case y en minúsculas.

## 2. Commits (Conventional Commits)

Formato del asunto:

```
<tipo>(<scope>): <asunto imperativo>
```

- `<tipo>`: igual que la lista de ramas (`feat`, `fix`, `chore`, ...).
- `<scope>`: opcional; contexto corto (módulo, archivo, área).
- `<asunto>`: imperativo, en minúsculas, sin punto final, ≤ 100 caracteres.

Ejemplos:

```
feat(auth): add login screen
fix(remito): fix print layout
chore: rename project ryes to branches
refactor(router): extract auth guards
```

Breaking changes: agregar `!` tras el tipo/scope.

```
feat(auth)!: require token on all routes
```

El cuerpo del commit (opcional) va separado por una línea en blanco; se puede usar para explicar el _por qué_. Los footers van al final (ej. `Refs: #123`).

Los commits de merge (`Merge branch ...`) están permitidos y no se validan.

## 3. Hooks de git

| Hook         | Qué valida                                               | Cuándo falla                            |
| ------------ | -------------------------------------------------------- | --------------------------------------- |
| `pre-commit` | Nombre de rama, `lint-staged`, `lint:check`, `typecheck` | Rama inválida o código sucio            |
| `commit-msg` | Mensaje de commit (Conventional Commits)                 | Mensaje que no cumple el formato        |
| `pre-push`   | Nombre de rama                                           | Push desde una rama fuera de convención |

Para bypasear (temporal): `git commit --no-verify` / `git push --no-verify`. Usar solo cuando sea realmente necesario.

## 4. Pull Requests

- Título con formato Conventional Commits, ej.: `feat: login screen`.
- Descripción concisa: qué hace, por qué, y cómo se probó.
- Una PR = una unidad lógica de trabajo (una feature o un fix).
- Si la PR cierra un issue, referenciarlo en la descripción (ej. `Closes #123`).
- Correr localmente antes de abrir: `npm run lint:check`, `npm run typecheck`, `npm run build`.
