@AGENTS.md

# Reglas de flujo de trabajo Git

El flujo de trabajo completo (nombramiento de ramas, convención de commits, pull requests) está documentado en [CONTRIBUTING.md](./CONTRIBUTING.md). Reglas operativas para asistencia con IA en este repo:

- Nunca commitear ni pushear directamente sobre `main`. Toda tarea empieza creando una rama nueva desde `main` actualizado, con el formato `tipo/descripcion-corta` (ver tipos en CONTRIBUTING.md).
- Todos los mensajes de commit siguen Conventional Commits (`tipo(scope opcional): descripción`). No crear commits sin prefijo de tipo.
- Un commit por cambio lógico. No mezclar en un mismo commit una feature con formateo, refactors no relacionados o actualización de dependencias.
- Antes de proponer un commit, confirmar que `npm run lint` y `npm run build` pasan.
- No usar `git push --force`, `git reset --hard` ni `git commit --amend` sobre commits ya compartidos sin confirmación explícita del usuario.
- Al abrir un PR, usar como título el mismo formato que el commit principal (`tipo: descripción`).
