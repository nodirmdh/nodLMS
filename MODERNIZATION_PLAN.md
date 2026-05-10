# MODERNIZATION_PLAN.md

Документ подготовлен на основе `PROJECT_AUDIT.md`. Цель — безопасная пошаговая модернизация LMS/CRM-системы без переписывания, без ломки API, без изменений Prisma-схемы и routes. Каждое изменение — incremental и реверсируемо.

**Стек:** NestJS 10 + Prisma 5 + PostgreSQL (backend), React 18 + Vite 5 + Redux Toolkit + RTK Query (frontend), shadcn/ui + Tailwind.

---

## 1. PROJECT HEALTH SCORE

Оценка каждого измерения по 10-бальной шкале. Баллы — экспертная оценка из анализа кода. Комментарии — ключевые факты.

| Категория | Балл | Комментарий |
|-----------|:----:|-------------|
| Architecture | **5/10** | Корректная модульная структура NestJS и feature-sliced frontend, но смешение бизнес-логики (SMS + финансы в одной транзакции), 15 отдельных `createApi`, Scope.REQUEST для `AuthService`, плоский `routes.tsx` |
| Scalability | **4/10** | In-memory cache для OTP (не работает в multi-instance), локальная папка `uploads/` (не переживёт рестарт Render), нет очередей, cron в том же процессе, нет индексов по горячим полям |
| Maintainability | **5/10** | TS, единый стиль, но `any` разрешён, `strictNullChecks: false`, `routes.tsx` и `lib/utils.ts` — мусоросборники, опечатки в доменных именах (mounth, exprence, trasaction, assistent) |
| Security | **3/10** | Нет `ValidationPipe`, нет rate-limiting, нет helmet, Swagger открыт на prod, OTP brute-force возможен, MD5 для SMS-подписи, секрет JWT без валидации при старте |
| Frontend structure | **6/10** | Чёткое разделение `app/pages/features/components/common/hooks/lib`, shadcn/ui, i18n на 5 языков. Минусы: `routes.tsx` плоский, много одинаковых `createApi`, нет единого `<PageHeader>`/`<DataTable>` |
| Backend structure | **5/10** | NestJS-modules чистые, Prisma через DI, cron в отдельном сервисе. Минусы: контроллеры принимают Prisma-типы вместо DTO, длинные методы в финансовых сервисах, одна init-миграция |
| DX (Developer Experience) | **4/10** | Dev-mode работает, Swagger есть, i18n удобно. Минусы: нет тестов, warn'ы Prisma version mismatch, CI/CD нет, логов нет, нет hot-reload продакшн-близкого окружения |
| Performance | **4/10** | Prisma со вложенным `include` без лимитов, N+1 в `TasksService` и `confirmLesson`, бандл фронта 1.25MB, `Scope.REQUEST` пересоздаёт всё дерево зависимостей на запрос |
| Consistency | **5/10** | shadcn/ui держит стиль UI-примитивов, но нет `PageHeader`/`EmptyState`/`DataTable`, страницы собраны по-разному, заголовки вручную, SMS-шаблоны хардкодом |

**Общий усреднённый балл: 4.6 / 10.** Проект рабочий, но technical debt значительный.

---

## 2. CRITICAL RISKS

### 2.1 Что может сломаться при рефакторинге

1. **Включение глобального `ValidationPipe({ whitelist: true, transform: true })`** — сломает эндпоинты, которые принимают `@Body() data: Group` (Prisma-тип), потому что у таких тел нет validator-декораторов и `transform` приведёт к пустому объекту. Нужно либо временно включить без `whitelist`, либо сразу покрыть DTO (что уже рефакторинг).
2. **Замена `AuthMiddleware` на `@nestjs/passport` JWT strategy** — изменит форму `req.user` и shape декоратора `@CurrentUser`. Если не синхронизировать — сломаются все контроллеры, использующие `user.branch` / `user.role`.
3. **Убрать `Scope.REQUEST` с `AuthService`** — сломает `getMe()`, который использует `@Inject(REQUEST)`. Нужно переписать на `@CurrentUser`.
4. **Укрепление TS-flags (`strictNullChecks`, `noImplicitAny`)** — вызовет сотни ошибок типизации сразу.
5. **Миграция с локальной `uploads/` на S3** — сломает `useStaticAssets` + все ссылки на старые аватары.
6. **Консолидация RTK Query в один `createApi`** — изменит `reducerPath` → redux-persist выбросит предыдущий state → пользователи вылетят из системы (токен сохранён как `authState.token`, но если ключ хранения поменяется — возможны проблемы).
7. **Переименование `mounth-year-picker`, `exprence-form`, `assistent` role** — Role хранится в БД как enum, переименование enum-значения требует миграции.
8. **Добавление индексов в Prisma** — безопасно, но при больших таблицах миграция блокирует таблицу надолго.

### 2.2 Самые опасные модули (трогать осторожно)

| Модуль | Риск | Почему |
|--------|:----:|--------|
| `src/lessons/lessons.service.ts` — `confirmLesson`, `payLesson` | 🔴 Очень высокий | Финансовая логика + SMS + транзакции. Баг = деньги ушли не туда, или студенту списали/не списали |
| `src/transactions/transactions.service.ts` — `create`, `update` | 🔴 Очень высокий | Расчёт зарплат, балансов менторов и студентов. Много условных веток (`salaryMentorType`, `profitType`) |
| `src/students/students.service.ts` — `addBonus`, `removeBonus`, `update` | 🔴 Очень высокий | Меняет баланс студента и ментора одновременно, `prisma.$transaction` |
| `src/groups/groups.service.ts` — `update`, `activateGroup` | 🟠 Высокий | Создаёт уроки через `LessonsService.createLessonsForGroup`. Тонкая связь со статусами групп |
| `src/auth/auth.middleware.ts` + `auth.service.ts` | 🟠 Высокий | Любая ошибка = никто не залогинен |
| `src/tasks.service.ts` — cron закрытия групп | 🟠 Высокий | Автоматически меняет статусы. Ошибка может закрыть активные группы |
| `src/sms/sms.service.ts` | 🟡 Средний | Внешний провайдер. Упадёт — пользователи не получат SMS и критичные уведомления о платежах |

### 2.3 Части, которые трогать можно спокойно

- `src/branches/` (CRUD, без побочных эффектов)
- `src/courses/` (простой CRUD)
- `src/fine/`, `src/bonus/` — записи без пересчёта балансов сторонних сущностей
- Фронтенд `src/components/ui/*` — примитивы shadcn
- Стили Tailwind/CSS-переменные
- i18n JSON-файлы
- Любой не финансовый `findAll`/`findOne`

---

## 3. SAFE REFACTOR MAP

### Этап 1 — Security & Stability
**Цель:** устранить блокеры безопасности, сделать проект production-safe без изменения поведения.

| Файлы | Что делаем |
|-------|------------|
| `src/main.ts` | Подключить `ValidationPipe` (без `whitelist`, только `transform`), `helmet`, условный Swagger |
| `src/app.module.ts` | Подключить `ThrottlerModule` глобально, `ConfigModule` с валидацией env через Joi |
| `prisma/schema.prisma` | **НЕ трогаем** |
| `.env.example` | Задокументировать новые переменные |
| `src/common/config/env.validation.ts` | Новый файл — Joi schema |
| `src/health/` | Новый модуль с `/health` эндпоинтом |

**Риск:** 🟢 Низкий. ValidationPipe без `whitelist` не отбросит лишние поля.
**Expected impact:** Закрытие SVN-рисков, rate-limit против brute-force OTP.
**Rollback:** `git revert` commit'а. Никаких миграций БД.

---

### Этап 2 — Backend cleanup
**Цель:** упорядочить слой контроллеров и DTO, убрать мусор, добавить логгер.

| Файлы | Что делаем |
|-------|------------|
| `src/*/dto/` | Написать DTO для всех `@Body()` вместо Prisma-типов. Начать с branches → courses → fines → bonuses → groups → students → transactions → lessons |
| `src/*/*.controller.ts` | Заменить `@Body() data: Group` → `@Body() data: UpdateGroupDto` |
| `src/common/filters/http-exception.filter.ts` | Новый — единый error-handler |
| `src/common/logger/` | Pino-logger (опционально) |
| `src/users/users.service.ts` | `return error` → `throw error` |
| `src/auth/auth.service.ts` | Убрать `Scope.REQUEST`, переписать `getMe` через `@CurrentUser` |
| Удаление мусора | `1b.csv`, `uploads/*.png` (в `.gitignore`), `src/groups/test.json`, `console.log`, `@ts-ignore`, закомментированные блоки |

**Риск:** 🟡 Средний — DTO с `whitelist` могут отсеять поля, которые фронт передаёт «на всякий случай». Нужно делать по одному модулю + QA.
**Expected impact:** Типобезопасность запросов, читаемость, единообразие ошибок.
**Rollback:** pofile-изменения по коммитам на модуль. Каждый модуль — отдельный коммит.

---

### Этап 3 — Frontend architecture cleanup
**Цель:** декомпозировать `routes.tsx`, унифицировать RTK Query, вынести утилиты.

| Файлы | Что делаем |
|-------|------------|
| `src/app/routes/` | Разбить `routes.tsx` → `public-routes.tsx`, `private-routes.tsx`, `admin-routes.tsx` |
| `src/app/routes/with-role.tsx` | Вынести `RoleCheck` в отдельный wrapper (было инлайн) |
| `src/app/store/api/` | Объединить 15 `createApi` в 1 `api.ts` с `injectEndpoints`. Сохранить существующие hooks export-имена |
| `src/lib/` | Разбить `utils.ts` на `format.ts`, `date.ts`, `role.ts`, `url.ts`, `cn.ts`, `debounce.ts` |
| `src/common/constants/` | Новое: роли, enum-маппинги, SMS-шаблоны |
| `src/vite-env.d.ts` | Добавить типы для `VITE_API_URL` |

**Риск:** 🟠 Высокий при объединении RTK Query — persist хранит state по `reducerPath`. Нужно аккуратно: либо оставить старые пути, либо добавить миграцию persist-state.
**Expected impact:** Меньше boilerplate, читаемый роутинг, удобство добавления новых endpoints.
**Rollback:** если persist "сносит" пользователей — bump `persist.version` + migration.

---

### Этап 4 — Design system
**Цель:** унификация layout'ов и повторяющихся паттернов.

| Файлы | Что делаем |
|-------|------------|
| `src/components/page/page-header.tsx` | Новое: заголовок + breadcrumb + actions |
| `src/components/page/empty-state.tsx` | Новое |
| `src/components/page/data-table.tsx` | Обёртка над `@tanstack/react-table` + pagination + filters |
| `src/components/page/form-layout.tsx` | Обёртка над react-hook-form с единым стилем |
| `src/pages/*/index.tsx` и create/update | Постепенно мигрировать на новые обёртки — по одному разделу |
| `src/common/locales/*/common.json` | Добавить ключи `actions.create`, `actions.save`, `actions.cancel`, `actions.delete`, `labels.search` и т.п. |

**Риск:** 🟢 Низкий — страницы мигрируются по одной, старый код продолжает работать.
**Expected impact:** Визуальная консистентность, меньше дублирования Tailwind-классов.
**Rollback:** возврат по странице.

---

### Этап 5 — Performance optimization
**Цель:** убрать N+1, code-splitting фронта, добавить индексы.

| Файлы | Что делаем |
|-------|------------|
| `prisma/schema.prisma` → новая миграция | Индексы: `Lesson(date, groupId)`, `Transaction(date, branchId)`, `Student(status)`, `GroupStudent(studentId, status)` |
| `src/tasks.service.ts` | Переписать цикл на один Prisma-запрос с агрегацией |
| `src/lessons/lessons.service.ts` | `confirmLesson` — убрать цикл `upsert` в пользу `createMany` + `updateMany` |
| `src/app/routes/*` | Лениво грузить тяжёлые страницы (accounting, students, groups) |
| `vite.config.ts` | `build.rollupOptions.output.manualChunks` — выделить vendor |
| `src/components/layout/sidebar/sidebar.tsx` | Мемоизация |

**Риск:** 🟡 Средний. Индексная миграция на продакшне на живых данных блокирует таблицу. Запускать в окно maintenance с `CONCURRENTLY`.
**Expected impact:** Быстрее списки, меньше памяти на запрос, меньше размер бандла.
**Rollback:** migration revert + git revert.

---

### Этап 6 — Developer Experience
**Цель:** CI/CD, тесты, типизация, документация.

| Файлы | Что делаем |
|-------|------------|
| `.github/workflows/ci.yml` | Lint + build + typecheck на PR |
| `.github/workflows/deploy.yml` | Автодеплой на Render/Vercel по merge в main |
| `src/**/__tests__/` | Unit-тесты для финансовых методов (payLesson, addBonus, create transaction) |
| `test/*.e2e-spec.ts` | 3-5 smoke e2e на auth + одну CRUD-сущность |
| `tsconfig.json` | Постепенно включить `strictNullChecks: true` по файлам через `// @ts-strict` комментарии (или `strict: true` с `exactOptionalPropertyTypes: false`) |
| `CONTRIBUTING.md` | Гайд для новых разработчиков |
| `README.md` (backend/frontend) | Актуализировать |

**Риск:** 🟢 Низкий.
**Expected impact:** Скорость разработки, меньше регрессий.
**Rollback:** отключить workflow.

---

### Этап 7 — Future scaling
**Цель:** подготовить проект к росту.

| Задача | Что делаем |
|--------|------------|
| Multi-instance cache | Подключить Redis через `cache-manager-redis-store` вместо in-memory. OTP и rate-limit будут работать в кластере |
| Файлы | Интеграция с S3-совместимым хранилищем (DigitalOcean Spaces / Cloudflare R2 / AWS S3) |
| Очереди | `@nestjs/bullmq` для SMS и фоновых задач, чтобы рассылка не блокировала HTTP-запрос |
| Cron | Вынести в отдельный worker (если появится несколько app-инстансов) |
| Reporting | Отдельный модуль с денормализованными view в БД |
| Telegram bot | Отдельный микросервис (или модуль) для notifications |
| Mobile / API для клиентов | Версионирование API: `/api/v1/*`, OpenAPI export |

**Риск:** Вариативно по задаче.
**Expected impact:** Горизонтальное масштабирование, интеграции.
**Rollback:** feature-flag или включение через env.

---

## 4. FRONTEND PROBLEMS

### 4.1 Дубли компонентов
- `Timer/Timer.tsx` и `Timer/send-sms.tsx` — пересекающаяся логика.
- `select/select.tsx` vs `components/ui/select.tsx` vs `components/ui/select-chouse.tsx` — три близких варианта.
- `multi-select/` и `comebox/` — похожие паттерны.
- Каждая страница `*/create.tsx` и `*/update.tsx` собирается вручную — общего `FormLayout` нет.

### 4.2 Inconsistent layouts
- `AppShell` даёт сайдбар + `<Outlet />`, но внутри страниц каждый сам собирает верх страницы.
- `Layout` из `app/layouts/index.tsx` используется преимущественно в Sidebar — не применяется как общая оболочка.
- На мобилке `pt-[45px]` вшит в Sidebar; на десктопе `md:ml-14`/`md:ml-64` — в AppShell. Связь «магическая».

### 4.3 Repeated Tailwind patterns
- `flex justify-between items-center` встречается везде — напрашивается `<Row>` / `<Stack>`.
- `grid gap-2`, `grid gap-4` — повторяется в формах без абстракции.
- `text-2xl font-bold mb-4` для заголовков — нет `<Heading>`.
- Классы с `md:` / `2xl:` дублируются в разных вариантах для одного UX-паттерна.

### 4.4 Плохие названия
| Сейчас | Должно быть |
|--------|-------------|
| `mounth-year-picker` | `month-year-picker` |
| `exprence-form` | `expense-form` |
| `student-trasaction-form` | `student-transaction-form` |
| `auth.sevice.ts` | `auth.service.ts` |
| `comebox` | `combobox` |
| `page-accessed` | непонятно что делает |
| `links.ts` | `nav-items.ts` |
| `discount.tsx` (в ui) | непонятно, зачем в ui |
| Role `assistent` | `assistant` |

### 4.5 Большие файлы
- `src/app/routes.tsx` — 350+ строк плоского списка.
- `src/lib/utils.ts` — 10+ функций разных доменов.
- `src/pages/groups/group-info.tsx`, `src/pages/accounting/view.tsx`, `src/pages/lessons/check-student.tsx` — вероятно, самые "тяжёлые" страницы (нужно проверить по LOC).

### 4.6 Проблемы `routes.tsx`
- Нет группировки по ролям/фичам.
- `RoleCheck` инлайновый — дублируется в каждом item.
- `allowedRoles={["CEO"]}` — роли магическими строками, нет enum.
- Отсутствует редирект корня (`/`) для не-CEO ролей, хотя dashboard доступен всем.
- Нет error boundary на уровне router.

### 4.7 Проблемы store
- 15 `createApi` — каждый со своим `reducerPath`, своим middleware. Дублирование.
- `reducer.ts` вручную объединяет всех — любое добавление API требует правки 2 файлов.
- `persistConfig.whitelist = ["authState", "userState"]` — корректно, но при смене ключа `reducerPath` у api возможны утечки старого кеша.
- Нет `useAppSelector` (только `useAppDispatch`).

### 4.8 Проблемы RTK Query
- `baseQueryWithAuth` определён в `base-query.ts`, но в `authApi`, `userApi` используется `baseQuery` — 401 не обрабатывается единообразно. Нужно проверить все сервисы.
- Нет tag-based invalidation — после create/update списки обновляются вручную.
- Hooks экспортируются индивидуально без централизованного барреля.

### 4.9 Проблемы адаптива
- Брейкпоинты перевёрнуты (`max:`). Менее предсказуемо.
- `useMediaQuery` используется точечно — расчёты адаптива разбросаны.
- Таблицы на мобилке почти не адаптированы (нужна карточная раскладка).
- Sidebar на десктопе занимает 256px всегда, на узких 1024px — тесно.

### 4.10 Проблемы design consistency
- Нет единых spacing-токенов (кроме Tailwind-дефолтов).
- `boxShadow: "custom-light"` — единственный кастом, остальное дефолт. Непонятно, где используется.
- Формы разного визуального веса: в одних `Card`-обёртка, в других голый `<form>`.
- Toasts есть, но `error` / `success` используются ad-hoc, без единого хелпера.

---

## 5. BACKEND PROBLEMS

### 5.1 Плохие service responsibilities
- `LessonsService` содержит: CRUD уроков + генерация расписания + посещаемость + расчёт зарплат менторам + списание со студентов + SMS-нотификации. Разбить на: `LessonScheduleService`, `AttendanceService`, `LessonPaymentService`.
- `TransactionsService.create` ветвится на 3 разные бизнес-логики (платёж студента, зарплата, прочее) внутри одной функции.
- `UsersService.create` делает + user + mentor + userBranch одновременно, без транзакции.
- `StudentsService.create` — кроме создания студента, удаляет `leed`.

### 5.2 Длинные методы
- `LessonsService.confirmLesson` (~80 строк, несколько responsibility).
- `LessonsService.payLesson` (~60 строк).
- `TransactionsService.create` (~90 строк) и `update` (~80 строк).
- `StudentsService.update` (~70 строк).
- `StudentsService.addBonus` (~50 строк с 3 ветками).

### 5.3 Отсутствие DTO
- `groups.controller.ts`: `@Body() data: Group` во всех методах.
- `courses.controller.ts`: `@Body() updateCourseDto: Course` (Prisma-тип, не DTO несмотря на имя).
- `fine.controller.ts`, `bonus.controller.ts`, `transactions.controller.ts`, `lessons.controller.ts` — аналогично.
- DTO существуют для `CreateStudentDto`, `CreateBranchDto`, `CreateCourseDto`, `CreateBonusStudentDto`, `addExamDto` — но они не валидируются (нет `ValidationPipe`).
- `CreateStudentDto.groups: any` — no-op.

### 5.4 Проблемы transaction logic
- `confirmLesson` в одной `$transaction` делает: update `StudentOnLesson`, update `Lesson.status`, read `Group`, send SMS, `payLesson` → update баланса. SMS-фейл → роллбек БД → пользователь не узнает.
- `addBonus` кидает `BadRequestException` внутри `$transaction` после уже выполненных `findUnique` — неэффективно.
- `TransactionsService.create` содержит вложенный `$transaction` и внешний create транзакции без transaction — рассинхронизация возможна.

### 5.5 Проблемы validation
- Нет глобального `ValidationPipe`.
- Нет `class-transformer` на вход (числовые query-параметры приходят строками — в сервисе `+page`, `+filter.courseId`).
- Телефон не валидируется — любой формат принимается.
- ID в URL — строки, приводятся вручную `+id`.

### 5.6 Проблемы auth
- JWT-секрет используется без проверки наличия.
- `AuthMiddleware` делает SELECT в БД на каждый запрос (нет кеша).
- `AuthService` — `Scope.REQUEST` — тяжело.
- `getMe` через `@Inject(REQUEST)` вместо `@CurrentUser` декоратора.
- OTP в in-memory cache — рестарт = все залогиненные пользователи застревают.
- Нет refresh-token механизма. Токен действителен 1 день, после — полный re-login.
- Нет logout-эндпоинта (только клиентское удаление токена).

### 5.7 Проблемы performance
- `StudentsService.find(id)` — вложенный include: `groupStudents.group`, `courses`, `lessons.lesson`, `examGrades.exam`, `transactions`, `bonuses`. На одного студента может быть сотни записей.
- `TasksService.checkLessonsAndGroups` — цикл `for group` + вложенный `findMany lessons`.
- `TasksService.processSalaries` — цикл `for user` с `update` по одному.
- `CoursesService.findAll` — подгружает всех студентов/группы/менторов в каждом курсе.
- Нет индексов на `Lesson(date, groupId)`, `Transaction(date, branchId)`, `Student(status)`.

### 5.8 Проблемы Prisma usage
- Смешивание `prisma.$transaction(async (prisma) => ...)` и `this.prisma.` внутри — сбивает контекст, возможны утечки транзакций.
- Нет централизованной обработки `P2002` (unique violation), `P2025` (record not found) — клиент получает 500.
- `.finally(() => this.prisma.$disconnect())` нигде не применяется — и не нужен, если Prisma через DI.
- Warning `Versions of prisma@5.19.1 and @prisma/client@5.18.0 don't match`.

### 5.9 Проблемы cron jobs
- Cron в том же процессе, что и HTTP-сервер — при multi-instance deploy job выполнится N раз.
- `59 59 23 * * *` — строгое время, если процесс был в downtime — пропустится.
- Нет логирования результатов cron — невозможно сказать, отработал ли он.
- Нет lock (distributed lock), чтобы только один инстанс выполнял.
- Нет ретрая при ошибке.

---

## 6. DESIGN SYSTEM ANALYSIS

### 6.1 Текущие UI patterns
- **Примитивы:** shadcn/ui — `button`, `card`, `input`, `select`, `dialog`, `form`, `table`, `tabs`, `tooltip`, `toast`, `sheet`, `popover`, `scroll-area`, `badge`, `avatar`, `skeleton`.
- **Domain-level:** `comebox`, `masked-field`, `multi-select`, `data-picker-range`, `mounth-year-picker`, `image-uploader`, `search-input`, `table/table.tsx` (обёртка над tanstack), `Timer`, `select-chouse`, `discount`.
- **Layout:** `Layout` + `Layout.Header` + `Layout.Body` (из `app/layouts`), `Sidebar`, `Nav`.
- **Сервисные:** `no-items` (empty-state), `page-accessed` (для role-проверки), `loading-button`.

### 6.2 Reusable components (живые)
- `Button`, `Input`, `Card`, `Form`, `Select` — есть.
- `Table` (обёртка tanstack) — есть, но неконсистентно используется.
- `LoadingButton` — есть.
- `NoItems` — есть как empty-state.

### 6.3 Missing components
- `<PageHeader>` — нет. Заголовки страниц собираются вручную.
- `<PageLayout>` / `<Section>` — нет.
- `<DataTable>` с пагинацией + фильтрами + sort как единый компонент — нет (есть `table.tsx`, но без инфраструктуры).
- `<FormLayout>` — нет.
- `<Breadcrumb>` — нет.
- `<StatCard>` / `<MetricCard>` для дашборда — нет.
- `<ConfirmDialog>` для удаления — возможно, разбросан ad-hoc.
- `<ErrorBoundary>` — нет.
- `<AsyncBoundary>` (Suspense + ErrorBoundary) — нет.

### 6.4 Компоненты, которые должны быть unified
- `select` vs `select-chouse` vs `multi-select` vs `comebox` — 4 варианта. Решить, какой паттерн основной, остальные depreciate.
- `Timer/Timer.tsx` + `Timer/send-sms.tsx` + `confirm-form-timer.tsx` — объединить в один `<OtpTimer>`.
- `image-uploader` + `avatar` — могут быть близки.

### 6.5 Как улучшить shadcn/ui architecture
1. Создать `src/components/ui/index.ts` с реэкспортом (сейчас импорты глубокие).
2. Разделить `components/ui/*` (shadcn-примитивы) и `components/*` (доменные компоненты) — сейчас они вперемешку.
3. Ввести тонкий слой: `components/data-display/`, `components/inputs/`, `components/feedback/`, `components/layout/`.
4. Добавить Storybook (опционально).
5. Единая токен-система через CSS-переменные в `index.css`: spacing, typography, radii.

---

## 7. PERFORMANCE ANALYSIS

### 7.1 Тяжёлые запросы
| Метод | Проблема |
|-------|----------|
| `StudentsService.find(id)` | Вложенный include: groups, courses, lessons, examGrades, transactions, bonuses. Не лимитирован |
| `GroupsService.findOne(id)` | `groupStudents.student`, `exams`, отдельный `findFirst` для lastLesson |
| `GroupsService.getGroupsLessons(id, date)` | Агрегация вручную в JS поверх `findMany` |
| `CoursesService.findAll` | Для каждого курса: `students`, `groups`, `mentors` — без `select` |
| `TransactionsService.findAll` | 4 последовательных запроса (list, count, sumIn, sumOut) вместо объединённого raw SQL |

### 7.2 Потенциальные N+1
- `TasksService.checkLessonsAndGroups`: цикл по группам → `findMany lessons` внутри.
- `TasksService.processSalaries`: цикл по пользователям → `update` по одному.
- `LessonsService.confirmLesson`: цикл по студентам → `prisma.studentOnLesson.update` по одному.
- `LessonsService.payLesson`: цикл по студентам → `findUnique student` + `update student` каждый.
- `UsersService.create`: mentor + userBranch создаются последовательно.

### 7.3 Тяжёлые страницы
- `/groups/:id` (GroupInfo) — много данных + журнал.
- `/lessons/:id/check` (CheckStudent) — все студенты + форма по каждому.
- `/accounting` — таблица транзакций + агрегаты + дата-фильтры.
- `/students/:id` (ViewStudent) — все связанные сущности студента.
- Эти страницы должны быть lazy-loaded.

### 7.4 Большие bundles
- Главный чанк после `vite build` — **1.25MB** (gzip 365KB). Предупреждение `chunks are larger than 500 kB`.
- Причины: все страницы в main (нет lazy), `recharts`, `date-fns` (можно tree-shake), `react-beautiful-dnd`, `interactjs`, `i18next` со всеми локалями.

### 7.5 Unnecessary renders
- `Sidebar` делает `useGetMeQuery()` на каждом рендере — при маунте нового route потенциально заново.
- `AppShell` использует `useSelector` на `authState.authenticated` — при любом диспатче пересчитывается.
- Формы без `React.memo` и без `useCallback` в пропсах — большие формы будут перерисовываться.
- Redux-persist rehydration вызывает полный ре-рендер на старте.

### 7.6 Memory issues
- In-memory cache для OTP. Утечки нет, но память растёт с кол-вом активных OTP-кодов.
- `Scope.REQUEST` в `AuthService` — на каждый запрос пересоздаётся дерево зависимостей, GC-давление.
- `uploads/` в локальной FS Render — файлы теряются при рестарте (не memory, но storage).

---

## 8. SECURITY ANALYSIS

### 8.1 Auth vulnerabilities
- Phone-only login — если известен номер + можно подобрать OTP, полный compromise.
- JWT действителен 1 день, нет refresh-token, нет revocation list.
- `AuthMiddleware` делает SELECT users на каждом запросе, но не проверяет `user.status` — уволенный пользователь всё ещё может ходить по API до истечения JWT.
- `getMe` использует `Scope.REQUEST` — если кеш/mutex потечёт, можно получить чужой `req.user`.

### 8.2 OTP weaknesses
- 6 цифр = 1M комбинаций, TTL 15 мин. Без rate-limit это 1 попытка/мс = полный перебор за 17 минут.
- Нет счётчика неудачных попыток — можно спамить `/auth/confirm` бесконечно.
- OTP хранится как число в cache — leading zeros теряются (код `000123` → `123`).
- OTP предсказуем от `Math.floor(100000 + Math.random() * 900000)` — не криптостойкий (`Math.random`).
- Повторный `login` перезаписывает OTP — если запрошено параллельно, предыдущий невалиден.

### 8.3 Rate-limit issues
- Полное отсутствие. `@nestjs/throttler` в deps, но не включён.
- `/auth/login`, `/auth/confirm`, `/auth/send-sms` — открытые endpoint'ы без защиты.
- Файловый upload (`/avatars/upload`) — не защищён от DoS.

### 8.4 Upload risks
- `multer` без лимита размера файла.
- Нет валидации MIME-type.
- Нет проверки magic bytes (можно залить .exe с переименованием).
- Файлы сохраняются с оригинальным именем + timestamp — возможна коллизия / path traversal.
- Статика раздаётся через `useStaticAssets` без X-Content-Type-Options.

### 8.5 Swagger risks
- Открыт на prod по `/docs`.
- Показывает полный список эндпоинтов, DTO, Bearer-схему — подсказка для атакующего.

### 8.6 Validation problems
- Нет глобального `ValidationPipe` — DTO-декораторы декоративны.
- Нет санитизации строк (XSS в сохраняемых полях).
- Нет валидации числовых ID в query — `+filter.courseId` на `"abc"` → `NaN` → Prisma может упасть.
- Нет проверки, что `mentorId` в `GroupsService.create` действительно существует → 500.

### 8.7 Env validation
- Отсутствует. При старте не проверяется наличие `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `SMS_USERNAME`, `SMS_SECRET_KEY`.
- Можно случайно задеплоить без JWT_SECRET — первый запрос упадёт внутри `jsonwebtoken.sign`.

### 8.8 Token handling
- Фронт хранит токен в `localStorage` через redux-persist — уязвимо к XSS.
- Нет HttpOnly cookie-based варианта.
- `resetAuth` вызывается на 401, но сам баг «401 из-за истёкшего токена» не обрабатывается тихо — пользователь остаётся с старой формой.
- На бэке нет logout-эндпоинта — токен остаётся валидным до истечения.

---

## 9. FUTURE SCALING

### 9.1 Multi-branch scaling
- Текущая схема поддерживает `Branch` + `UserBranch` (many-to-many) + фильтр по `user.branch` — архитектурно готова.
- Но фильтр не всегда консистентен (в `GroupsService.findAll` count-часть забывает branch filter).
- Рекомендация: middleware / interceptor, автоматически добавляющий `branchId` к query, вместо ручного проставления.

### 9.2 Thousands of students
- Пагинация есть, но с hardcoded `take: 10`.
- Тяжёлые includes нужно убирать (Student.find с полной историей).
- Индексы критичны: `Student(status, fio)`, `GroupStudent(studentId, status)`, `Lesson(groupId, date)`.
- Добавить full-text search (pg_trgm) для поиска по ФИО/телефону.

### 9.3 Analytics
- Нет ClickHouse / data warehouse. Все запросы идут к оперативной БД.
- Для аналитики: либо materialized views в PG, либо event-bus → отдельное хранилище.
- Recharts уже на фронте.

### 9.4 Notifications
- SMS есть, но один провайдер, без очереди.
- Для scale: очередь (BullMQ) + несколько провайдеров + retry + dead-letter queue.
- Email — отсутствует, легко добавить через nodemailer.
- Push — требует SW на фронте + VAPID keys.

### 9.5 Mobile app
- Текущий API близок к REST, но сильно завязан на cookie-less JWT и in-memory OTP.
- Нужна версионность `/api/v1` и публикация OpenAPI-спека.
- Refresh-token в отдельный flow.
- Пуши через FCM.

### 9.6 Telegram integrations
- Уже используется `telegram` поле в User/Student.
- Архитектурно — отдельный модуль `TelegramModule` с грамматикой команд + webhook.
- Для сценариев "оплата через родителя" — отдельный bot с inline-keyboard.
- Это лучше делать отдельным сервисом для изоляции.

### 9.7 Reporting
- Нужны view-entity в Prisma (readonly + @@map на view) для сложных отчётов.
- ExcelJS для экспорта.
- PDF — через puppeteer или react-pdf (если нужен шаблон).

### 9.8 Queues
- `BullMQ` + Redis — стандарт NestJS.
- Процессоры: SMS, PDF-generation, bulk operations, scheduled notifications.
- Отделить от API-процесса.

### 9.9 Microservices (когда нужны)
- Пока monolith приемлем.
- Первый кандидат на выделение — SMS/notifications (изоляция внешних интеграций).
- Второй — reporting/analytics (разные требования к БД).
- Третий — auth (если появятся множественные клиенты / SSO).
- gRPC или HTTP-API между ними.

---

## 10. RECOMMENDED NEXT STEP

### Самый первый безопасный рефакторинг

**Этап 1a — Security hardening без изменения поведения.**

Конкретно: в одном PR добавить:
1. Глобальный `ValidationPipe({ transform: true, whitelist: false })` — `whitelist: false` важно, чтобы не отбросить лишние поля (которые фронт передаёт) и не сломать поведение.
2. `ThrottlerModule` на `/auth/login`, `/auth/confirm`, `/auth/send-sms` с лимитом 5 запросов/мин по IP.
3. `helmet()` с дефолтами.
4. Условный Swagger — только если `NODE_ENV !== 'production'`.
5. Валидация env через `ConfigModule.forRoot({ validationSchema })` — проверка `DATABASE_URL`, `ACCESS_TOKEN_SECRET`.
6. Health-check эндпоинт `/health` с проверкой БД.

### Почему именно это
- Минимальный риск (не трогает бизнес-логику).
- Максимальный security-payoff.
- После этого Этап 2 (DTO + cleanup) можно делать спокойно.
- Не требует согласования с фронтом.
- Rollback = один `git revert`.

### Какие файлы менять
| Файл | Изменение |
|------|-----------|
| `src/main.ts` | `app.useGlobalPipes(new ValidationPipe({ transform: true }))`, `app.use(helmet())`, условный Swagger |
| `src/app.module.ts` | Подключить `ThrottlerModule.forRoot({ ttl: 60, limit: 100 })` глобально |
| `src/auth/auth.controller.ts` | Добавить `@Throttle({ default: { limit: 5, ttl: 60000 } })` на login/confirm/send-sms |
| `src/common/config/env.schema.ts` | Новый: Joi schema |
| `src/health/health.controller.ts`, `src/health/health.module.ts` | Новый |
| `package.json` | `npm i helmet @nestjs/terminus` |

### Как проверить, что ничего не сломалось
1. `npm run build` — собирается.
2. `npm run start:dev` — поднимается, health-check отдаёт 200.
3. Локально: пройти flow `login → confirm → get /auth/me` — работает.
4. Локально: `/courses`, `/groups`, `/students` — существующий фронт работает как раньше.
5. `curl /auth/login` в цикле 6+ раз — должна прилететь 429.
6. На проде в `NODE_ENV=production` → `/docs` отдаёт 404.
7. Без `ACCESS_TOKEN_SECRET` — приложение падает при bootstrap (желаемое поведение).

---

## Executive Summary для CTO

**Что есть:** Рабочая LMS/CRM (NestJS + Prisma + React/Vite + RTK Query) для учебного центра. Покрывает ключевой функционал: филиалы, курсы, группы, уроки, посещаемость, экзамены, финансы, SMS, cron-задачи. Уже задеплоена на Render + Vercel + Neon. Общий health score — **4.6/10**: функционал работает, но technical debt значителен.

**Главные риски на сегодня:**
1. **Безопасность (3/10):** нет валидации запросов, нет rate-limit на auth, открытый Swagger в prod, MD5 для внешних подписей — реальная уязвимость к brute-force OTP и инъекциям через невалидированные поля.
2. **Производительность (4/10):** N+1 в crons и финансовых методах, бандл фронта 1.25MB без code-splitting, отсутствуют индексы в БД, `Scope.REQUEST` на `AuthService`.
3. **Согласованность (5/10):** контроллеры принимают Prisma-типы вместо DTO, финансовая логика + SMS в одной `$transaction`, большие файлы с смешанными ответственностями.

**Что предлагается:** 7 этапов incremental-модернизации. Каждый этап самодостаточен, reversable, не ломает API и БД. Первый этап (Security & Stability) даёт максимальный security-payoff при минимальном риске и должен быть сделан в течение 1 спринта.

**Что трогать осторожно:** финансовый модуль (Lessons/Transactions/Students), auth-флоу, cron-закрытие групп. Эти части влияют на деньги и бизнес-данные — любой рефакторинг здесь требует unit-тестов **до** изменений.

**Ожидаемый эффект после всех этапов:**
- Security score → 8/10
- Performance score → 7/10
- Maintainability score → 8/10
- Готовность к multi-instance deploy, к мобильному приложению, к подключению Telegram-интеграций и отчётности.

**Срок для Этапа 1:** 3–5 рабочих дней. Остальные этапы — 2–4 недели каждый, итерационно.

**Следующий шаг:** согласовать Этап 1 и зафиксировать test-plan для финансовых операций (Этапы 4–5 без тестов на деньги делать нельзя).
