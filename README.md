# consultora-app

Portal interno de la consultora: directorio de colaboradores, armado de squads y generación de propuestas.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- PostgreSQL con Drizzle ORM
- Zod para validación
- Vitest para tests
- GitHub Actions para CI

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completar DATABASE_URL
npm run db:migrate
npm run dev
```

## Importar colaboradores

```bash
npm run import:colaboradores -- /ruta/colaboradores.json
```

Las personas entran con estado `pending`. Solo las confirmadas (`confirmed`) aparecen en squads y propuestas.
El archivo con datos personales no va al repo: la carpeta `data/` está en `.gitignore`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests unitarios |
| `npm run lint` | ESLint |
| `npm run build` | Build de producción |
| `npm run db:generate` | Genera migración desde el esquema |
| `npm run db:migrate` | Aplica migraciones |

## Flujo de trabajo

GitHub Flow: rama por feature, PR hacia `main`, CI en verde antes de mergear.
