# Project Structure

Two apps live side by side at the repo root plus product documentation.

```
LMS/
├── .kiro/                              # Kiro steering, specs, settings
├── FEATURES_ROADMAP.md                 # Product feature catalog (P0–P3)
├── FEATURE_IMPLEMENTATION_MASTERPLAN.md
├── MODERNIZATION_PLAN.md
├── PROJECT_AUDIT.md
├── lms-backend-main/                   # NestJS + Prisma API
└── lms-frontend-main/                  # React + Vite SPA
```

## Backend (`lms-backend-main/`)

```
lms-backend-main/
├── prisma/
│   ├── schema.prisma                   # Single source of truth for DB models
│   ├── migrations/                     # Versioned SQL migrations
│   ├── seed.ts                         # npm run seed
│   └── import-csv.ts                   # npm run import-csv
├── src/
│   ├── main.ts                         # Bootstrap: Swagger, CORS, static uploads
│   ├── app.module.ts                   # Root module, middleware, global guard
│   ├── app.service.ts
│   ├── tasks.service.ts                # @Cron scheduled jobs
│   ├── prisma/                         # Global PrismaModule + PrismaService
│   ├── auth/                           # JWT + SMS OTP
│   │   ├── auth.{controller,service,module}.ts
│   │   ├── decorator/                  # @Roles, @CurrentUser
│   │   ├── guard/                      # RolesGuard (APP_GUARD)
│   │   └── middleware/                 # AuthMiddleware (injects req.user)
│   ├── users/                          # Staff accounts
│   ├── students/                       # Learner records
│   ├── mentors/
│   ├── groups/
│   ├── courses/
│   ├── lessons/                        # Includes attendance (StudentOnLesson)
│   ├── exam/                           # Exams + ExamGrade
│   ├── branches/
│   ├── leeds/                          # Sales funnel
│   ├── transactions/                   # Money movements
│   ├── fine/        bonus/             # Per-staff penalties & rewards
│   ├── avatar/                         # File uploads served from /uploads
│   ├── sms/                            # SMS gateway integration
│   ├── common/
│   │   ├── config/env.validation.ts    # Joi env schema
│   │   └── filters/all-exceptions.filter.ts
│   └── shared/
│       ├── dto/                        # PaginationDto, etc.
│       ├── types/                      # PaginatedResult<T>, etc.
│       └── utils/
├── uploads/                            # Runtime asset storage (served statically)
├── test/                               # Jest e2e config
├── Dockerfile
├── nest-cli.json   tsconfig.json   .eslintrc.js   .prettierrc
└── package.json
```

### Module shape (per domain)

Every feature domain follows the same layout:

```
src/<domain>/
├── <domain>.controller.ts      # @ApiTags, thin HTTP layer, @Roles() guards
├── <domain>.service.ts         # Business logic, talks to PrismaService
├── <domain>.module.ts          # Registers controller + service (import PrismaModule only if it's not already provided globally)
└── dto/
    ├── create-<entity>.dto.ts  # class-validator + @ApiProperty
    └── update-<entity>.dto.ts
```

When adding a new domain: create the folder, register the module in `AppModule.imports`, and add migrations via `npx prisma migrate dev`.

### File naming

- `kebab-case` for files (`create-student.dto.ts`).
- `PascalCase` for classes and types.
- Tests as `*.spec.ts` co-located with source (Jest `rootDir` is `src`).

## Frontend (`lms-frontend-main/`)

Organized in a light Feature-Sliced Design layout. Alias `@` points to `src/`.

```
lms-frontend-main/
├── index.html
├── public/
├── src/
│   ├── app/                    # Composition root
│   │   ├── main.tsx            # ReactDOM entry
│   │   ├── app-shell.tsx
│   │   ├── routes.tsx          # Route tree
│   │   ├── i18n.ts             # i18next init
│   │   ├── index.css           # Tailwind base
│   │   ├── providers/          # Redux, router, theme providers
│   │   ├── store/              # RTK store + redux-persist
│   │   ├── layouts/
│   │   └── helpers/
│   ├── pages/                  # Route-level screens
│   ├── features/               # Feature slices (forms, widgets tied to a use case)
│   │   ├── auth-form/   confirm-form/
│   │   ├── student-form/   add-student-form/   student-bonus-form/   student-trasaction-form/
│   │   ├── group-form/   course-form/   branch-form/
│   │   ├── create-lesson-form/   lesson-status/   schedule/
│   │   ├── leed-form/   staff-form/   fines-form/   exprence-form/
│   │   ├── settings/   test-form/   student-bonus-form/
│   │   └── ...
│   ├── components/             # Reusable UI (shadcn/ui components land here)
│   ├── hooks/
│   ├── lib/                    # `cn` and other utilities (alias `@/lib/utils`)
│   ├── common/                 # Shared types, constants, helpers
│   └── vite-env.d.ts
├── components.json             # shadcn/ui config (adds to @/components, uses @/lib/utils)
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── knip.json                   # Dead-code scan config
├── Dockerfile   nginx.conf   vercel.json
└── package.json
```

### Conventions

- Keep route screens in `src/pages`, reusable feature logic in `src/features/<feature-name>`, pure UI primitives in `src/components`.
- shadcn/ui components are generated into `src/components` and must be imported via the `@/components/...` alias.
- Translation keys: add to i18next resources; run `yarn parseTL` to sync from the Google Sheet.
- Forms use `react-hook-form` + `zod` schemas; do not mix form libraries.

## Kiro workspace (`.kiro/`)

```
.kiro/
├── steering/           # This folder — always-on guidance for the AI
├── specs/              # Per-feature spec folders created by spec workflows
└── settings/           # Optional workspace settings (e.g. mcp.json)
```

Spec files live under `.kiro/specs/<feature-name>/` as `requirements.md`, `design.md`, `tasks.md` (or `bugfix.md` for bug specs).
