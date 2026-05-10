# Tech Stack

Monorepo with two independent apps: `lms-backend-main` (API) and `lms-frontend-main` (SPA). They communicate over HTTP; no shared package.

## Backend — `lms-backend-main`

- **Runtime**: Node.js + TypeScript (target ES2021, CommonJS).
- **Framework**: NestJS 10 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`).
- **ORM / DB**: Prisma 5 client against PostgreSQL. Schema in `prisma/schema.prisma`, migrations in `prisma/migrations/`.
- **Auth**: Phone + SMS OTP, JWT via `jsonwebtoken`. Global `AuthMiddleware` injects `req.user`; `RolesGuard` + `@Roles()` decorator enforce RBAC.
- **Validation**: `class-validator` + `class-transformer` on DTOs; `Joi` for env validation (`src/common/config/env.validation.ts`).
- **Docs**: Swagger at `/docs` via `@nestjs/swagger`; decorate endpoints with `@ApiTags`, `@ApiOperation`, and DTOs with `@ApiProperty`.
- **Other**: `@nestjs/cache-manager`, `@nestjs/schedule` (cron jobs in `src/tasks.service.ts`), `@nestjs/throttler`, `helmet`, `multer` (uploads served from `/uploads`).
- **Testing**: Jest + `ts-jest`; specs live next to source as `*.spec.ts` (rootDir `src`). E2E uses `test/jest-e2e.json`.
- **Lint/format**: ESLint (`@typescript-eslint`) + Prettier (`singleQuote: true`, `trailingComma: 'all'`).

### Conventions

- One Nest module per domain: `src/<domain>/<domain>.{controller,service,module}.ts` + `src/<domain>/dto/*.dto.ts`.
- Controllers stay thin: parse input, delegate to services.
- Use the global `PrismaService` (from `PrismaModule`, marked `@Global`) — do not instantiate `PrismaClient` directly.
- Role-protected endpoints: `@Roles('CEO', 'admin')` above the handler. Public routes must be added to the `AuthMiddleware` exclude list in `AppModule`.
- Pagination uses `src/shared/dto/pagination.dto.ts` and returns `PaginatedResult<T>` from `src/shared/types/`.
- Prefer `@Body() dto: SomeDto` with `class-validator` decorations over ad-hoc shapes.

### Common commands (run from `lms-backend-main/`)

```cmd
npm install
npm run start:dev        :: nest start --watch
npm run start            :: nest start
npm run build            :: nest build -> dist/
npm run start:prod       :: node dist/src/main
npm run lint             :: eslint --fix
npm run format           :: prettier --write
npm test                 :: jest
npm run test:watch
npm run test:cov
npm run test:e2e
npm run seed             :: ts-node prisma/seed.ts
npm run import-csv       :: ts-node prisma/import-csv.ts
npx prisma generate
npx prisma migrate dev --name <change>
npx prisma migrate deploy
npx prisma studio
```

Production bootstrap (Render-style): `npm run render:build` then `npm run render:start`.

### Environment

Required vars (validated at boot, see `env.validation.ts`): `DATABASE_URL`, `ACCESS_TOKEN_SECRET`. Optional: `PORT` (default `3002`), `NODE_ENV`, `CORS_ORIGIN` (comma-separated list), `SMS_USERNAME`, `SMS_SECRET_KEY`, `DEV_OTP_BYPASS`, `SWAGGER_USER/PASSWORD`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`. Template: `.env.example`.

## Frontend — `lms-frontend-main`

- **Framework**: React 18 + TypeScript (strict mode on).
- **Build**: Vite 5 (`@vitejs/plugin-react`). Dev server on port `3001` (strict).
- **Routing**: `react-router-dom` v6.
- **State / data**: Redux Toolkit + `react-redux`, `redux-persist`. API calls via `axios`.
- **Forms**: `react-hook-form` + `zod` (via `@hookform/resolvers`), `react-imask` for masks.
- **UI**: shadcn/ui on top of Radix primitives, Tailwind CSS + `tailwindcss-animate`, `lucide-react` icons, `recharts` for charts, `@tanstack/react-table`, `react-beautiful-dnd` for drag-and-drop, `cmdk` for command palette.
- **i18n**: `i18next` + `react-i18next`. Translation sync script: `parseTL` reads from Google Sheets (`parse-translation-from-sheets.cjs`).
- **Import alias**: `@/*` → `src/*` (configured in `tsconfig.json` and `vite.config.ts`).

### Common commands (run from `lms-frontend-main/`)

```cmd
yarn install             :: or: npm install
yarn dev                 :: vite, port 3001
yarn build               :: tsc && vite build -> dist/
yarn preview
yarn lint                :: eslint, --max-warnings 0
yarn knip                :: dead-code check
yarn parseTL             :: refresh translations from Sheets
```

## Cross-cutting

- Use `cmd` syntax on Windows (`&` as command separator, not `&&`).
- Never start `start:dev`, `vite`, or any watch process via the shell tool — it blocks. Ask the user to run it, or use the background process tool.
- Backend and frontend both have `Dockerfile`s for container deploys.
