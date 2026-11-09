# Cómo contribuir

¡Gracias por sumarte! Este proyecto se trabaja con **GitHub Flow**.

## Flujo
1. Hacé un fork (o, si sos colaborador, una rama) desde `main`.
2. Nombrá la rama según lo que hacés: `feature/...`, `fix/...`, `docs/...`, `refactor/...`.
3. Antes de abrir el PR, corré localmente:
   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```
4. Abrí un Pull Request hacia `main`. Completá la plantilla.
5. El CI (`verify`) tiene que pasar antes de mergear. `main` está protegida: no se puede empujar directo.

## Commits
- Mensajes en imperativo y claros, por ejemplo: `fix(ideas): mostrar error al guardar`.
- Prefijos sugeridos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.

## Base de datos
- Los cambios de esquema van con migración generada por Drizzle (`npm run db:generate`).
- Nunca se commitean credenciales ni datos personales. Usá `.env.example` como guía.

## Reportar problemas
Abrí un issue con la plantilla correspondiente. Si es un problema de seguridad, seguí `SECURITY.md`.

Al participar aceptás el [Código de conducta](CODE_OF_CONDUCT.md).
