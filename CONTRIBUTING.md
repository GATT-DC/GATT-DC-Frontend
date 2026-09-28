# Guía de contribución

Reglas de flujo de trabajo para este repositorio: ramas, commits y pull requests. Aplican tanto a desarrollo manual como asistido por IA (Claude Code u otros).

## Ramas

- `main` está siempre en estado desplegable. Nunca se commitea directo sobre ella.
- Toda tarea nace de una rama nueva creada desde `main` actualizado:

  ```
  git checkout main
  git pull
  git checkout -b <tipo>/<descripcion-corta>
  ```

- Formato: `tipo/descripcion-corta-en-kebab-case`.
- Tipos de rama (igual a los tipos de commit, ver abajo): `feature`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`.
- La descripción es corta (3-5 palabras), en minúsculas, sin acentos ni espacios.

  ```
  feature/login-form
  fix/navbar-overflow-mobile
  chore/update-dependencies
  refactor/extract-api-client
  ```

- Una rama = una tarea. Si el alcance crece a algo no relacionado, se abre otra rama.

## Commits — Conventional Commits

Formato:

```
<tipo>(<scope opcional>): <descripción corta en imperativo>

[cuerpo opcional explicando el porqué, no el qué]
```

### Tipos

| Tipo       | Uso                                                              |
|------------|-------------------------------------------------------------------|
| `feat`     | Nueva funcionalidad visible para el usuario                       |
| `fix`      | Corrección de un bug                                               |
| `docs`     | Solo documentación (README, comentarios, este archivo, etc.)      |
| `style`    | Formato, espacios, punto y coma — sin cambio de lógica            |
| `refactor` | Cambio de código que no arregla un bug ni agrega funcionalidad    |
| `perf`     | Cambio que mejora el rendimiento                                   |
| `test`     | Agregar o corregir tests                                           |
| `build`    | Cambios en dependencias, build system (npm, next.config, etc.)    |
| `ci`       | Cambios en pipelines/CI                                            |
| `chore`    | Tareas de mantenimiento que no encajan en las anteriores           |

### Reglas

- Descripción en minúscula, imperativo, sin punto final: `fix: corrige overflow del navbar en mobile`, no `Fixed navbar bug.`
- Un commit = un cambio lógico. Evitar commits que mezclen features con formateo o refactors no relacionados.
- El `scope` (entre paréntesis) es opcional y nombra el área afectada: `feat(auth): agrega login con google`.
- Si el cambio rompe compatibilidad, se agrega `!` después del tipo/scope y se explica en el cuerpo: `feat(api)!: cambia forma de la respuesta de /users`.

### Ejemplos

```
feat: agrega formulario de login
fix(navbar): corrige overflow en pantallas menores a 375px
docs: documenta convención de commits y ramas
refactor: extrae lógica de fetch a un hook useApi
chore: actualiza next a 16.3.6
```

## Pull Requests

- Se abre PR de la rama de trabajo hacia `main`.
- Título del PR sigue el mismo formato que el commit principal (`tipo: descripción`).
- La descripción explica **qué** cambia y **por qué**, no cómo (el diff ya muestra el cómo).
- Antes de abrir el PR: `npm run lint` y `npm run build` deben pasar localmente.
- El merge a `main` se hace con **squash and merge**, usando como mensaje final el título del PR en formato Conventional Commits.

## Buenas prácticas generales

- No commitear código comentado, `console.log` de debug, ni archivos generados (`.next/`, `node_modules/`).
- No hacer `git push --force` sobre ramas compartidas sin avisar al equipo.
- Si una tarea toca varias áreas no relacionadas, dividirla en varias ramas/PRs pequeños en vez de uno grande.
