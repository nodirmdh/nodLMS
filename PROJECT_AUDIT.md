# PROJECT_AUDIT.md

Технический паспорт проекта. Документ подготовлен для передачи другому AI-ассистенту, который будет готовить промпты для модернизации. Стиль — фактический, без рекомендаций по маркетингу или UX-экспертизе, только технические наблюдения из кода.

---

## 1. Общая информация

| Параметр | Значение |
|----------|----------|
| Название | LMS (Learning Management System). Код-базы: `lms-backend-main`, `lms-frontend-main`. Внутренние namespaces: бэк `back-end` (`package.json`), фронт `front-end`. В UI упоминания `RUSTAMBEK OQIW ORAYI` (конкретный образовательный центр) |
| Назначение | CRM/LMS для учебного центра: управление филиалами, курсами, группами, преподавателями (менторы), студентами, уроками, посещаемостью, лидами, экзаменами, финансами (транзакции, зарплаты, бонусы, штрафы), SMS-уведомлениями |
| Стек (backend) | NestJS 10, Prisma 5 (PostgreSQL), TypeScript 5, class-validator, jsonwebtoken, @nestjs/cache-manager (in-memory), @nestjs/schedule (cron), @nestjs/swagger, crypto-js (MD5), date-fns, multer |
| Стек (frontend) | React 18, Vite 5, TypeScript 5, Redux Toolkit + RTK Query, redux-persist, react-router-dom v6, React Hook Form, Zod, Tailwind CSS, shadcn/ui (Radix + CVA), i18next (5 языков: en, ru, qq, uzLat, uzKir), date-fns, recharts, react-beautiful-dnd, interactjs, react-imask |
| БД | PostgreSQL (облачно — Neon для деплоя) |
| Кэш | In-memory через `cache-manager` (OTP и др.). Redis НЕ используется |
| Пакетный менеджер | npm (присутствуют `package-lock.json` и `yarn.lock` — смешанно, исторически) |
| Деплой (текущий) | Backend: Render.com (`https://nodlms-1.onrender.com`). Frontend: Vercel (`https://nod-lms.vercel.app`). DB: Neon |
| Команды (backend) | `npm run start:dev`, `npm run build`, `npm run start:prod`, `npm run render:build`, `npm run render:start`, `npm run seed`, `npm run lint` |
| Команды (frontend) | `npm run dev` (порт 3001), `npm run build`, `npm run lint`, `npm run preview`, `npm run knip` (dead-code) |

---

## 2. Структура проекта

### Корень репозитория (`nodLMS/`)
```
nodLMS/
├── lms-backend-main/    — NestJS API
├── lms-frontend-main/   — React SPA
├── .gitignore
└── PROJECT_AUDIT.md     — этот файл
```

### Backend: `lms-backend-main/`

| Путь | Назначение |
|------|------------|
| `src/main.ts` | Точка входа. Bootstrap NestJS, Swagger на `/docs`, CORS, статика `uploads/` |
| `src/app.module.ts` | Корневой модуль. Регистрирует все фичи, глобальный `RolesGuard`, `AuthMiddleware` (exclude: login/confirm/send-sms/avatars/dev-seed) |
| `src/auth/` | Авторизация по телефону + OTP, JWT, middleware, `RolesGuard`, декораторы `@Roles`, `@CurrentUser` |
| `src/users/` | Сотрудники (CEO/admin/manager/mentor/assistent), их филиалы, баланс |
| `src/mentors/` | Менторы (1:1 c `User`), назначение на группы |
| `src/students/` | Студенты: создание, группы, бонусы, баланс |
| `src/branches/` | Филиалы |
| `src/courses/` | Курсы |
| `src/groups/` | Группы (курс+ментор+расписание), статусы (waiting/active/frozen/completed) |
| `src/lessons/` | Уроки: генерация расписания, посещаемость, подтверждение, расчёт оплаты менторам и списание со студентов, SMS |
| `src/transactions/` | Финансы in/out, автоматический учёт зарплат и платежей |
| `src/fine/`, `src/bonus/` | Штрафы и бонусы сотрудникам |
| `src/exam/` | Экзамены, оценки |
| `src/leeds/` | Лиды (потенциальные студенты) |
| `src/sms/` | SMS-шлюз `routee.sayqal.uz` (MD5 token) |
| `src/avatar/` | Загрузка аватаров в локальную папку `uploads/` через multer |
| `src/tasks.service.ts` | Cron: (1) закрытие завершённых групп в 23:59:59, (2) начисление зарплат в 01:00 10-го числа |
| `src/prisma/` | `PrismaService` с `OnModuleInit`/`OnModuleDestroy` |
| `src/shared/` | `pagination.dto.ts`, `paginated-result.type.ts`, `lesson-price.ts`, `md5-generator.ts` |
| `prisma/schema.prisma` | Единая миграция `20241222153653_init` на все домены |
| `prisma/seed.ts` | Создаёт филиал id=1 и пользователя `998770421939` с ролью CEO |
| `Dockerfile` | Multi-stage build (после правок) |
| `.env` / `.env.example` | Локальный конфиг |

### Frontend: `lms-frontend-main/`

| Путь | Назначение |
|------|------------|
| `index.html`, `src/app/main.tsx` | Точка входа Vite + React |
| `src/app/routes.tsx` | Все роуты (createBrowserRouter), `RoleCheck`-обёртка, lazy-загрузка `AppShell` и `/` |
| `src/app/app-shell.tsx` | Основной каркас: сайдбар + `<Outlet />`, guard `authenticated` |
| `src/app/layouts/index.tsx` | Абстрактный Layout + Header + Body с контекстом offset/fixed |
| `src/app/providers/providers.tsx` | `<Provider>` + `<PersistGate>` + `<RouterProvider>` + `<Toaster>` |
| `src/app/store/` | Redux: `reducer.ts`, `store.config.ts` (redux-persist), `features/` (auth, user slice), `services/` (15 RTK Query API) |
| `src/app/helpers/base-query.ts` | `fetchBaseQuery` с `VITE_API_URL`, обработка 401 → logout |
| `src/app/i18n.ts` | i18next с 5 локалями, читает язык из `localStorage.persist:root` |
| `src/pages/` | 15+ разделов: accounting, auth, bonuses, branches, courses, exams, fines, groups, leeds, lessons, mentors, staffs, students, dashboard, forbidden-page, not-found, settings |
| `src/features/` | 18 фич-форм (auth-form, group-form, student-form, …) — каждая со своей zod-схемой |
| `src/components/ui/` | shadcn/ui примитивы (button, card, dialog, input, select, table, toast и т.д.) |
| `src/components/layout/` | sidebar, nav, links — навигация проекта |
| `src/components/{table,select,multi-select,search-input,masked-field,Timer,no-items,data-picker-range,mounth-year-picker,image-uploader,comebox,page-accessed}/` | Доменные переиспользуемые компоненты |
| `src/common/types/` | TS-интерфейсы (auth, students, transactions и т.д.) |
| `src/common/locales/{en,ru,qq,uzLat,uzKir}/` | JSON-переводы по разделам (≈27 файлов на язык) |
| `src/hooks/` | `use-check-active-nav`, `use-date-i18n`, `use-is-collapsed`, `use-local-storage` |
| `src/lib/utils.ts` | Утилиты (смешанный mixed bag: `cn`, `formatAmount`, `toAuthRoleCheck`, `useDebounce`, `generateTimeArray`, `cleanObject` и т.д.) |
| `vite.config.ts`, `tailwind.config.js`, `tsconfig.json` | Конфиг сборки |
| `Dockerfile`, `nginx.conf` | Прод-контейнер через nginx (серверный build) |
| `knip.json`, `parse-translation-from-sheets.cjs` | Dead-code анализ, парсинг переводов из Google Sheets |

---

## 3. Архитектура

### 3.1 Backend

- **Модульная структура NestJS.** На каждый домен — отдельный модуль (`controller` + `service` + `module`). DI через конструкторы.
- **Глобальный AuthMiddleware** применяется в `AppModule.configure()` ко всем маршрутам, кроме явного allowlist. Парсит `Bearer`-токен, через `UsersService.findOne` подкладывает `req.user`.
- **Глобальный RolesGuard** как `APP_GUARD`. Роли считываются из `@Roles()` через `Reflector`, сравниваются с `req.user.role`.
- **Prisma** — единый клиент через `PrismaService`. Транзакции через `prisma.$transaction(async ...)` в финансовых операциях.
- **ValidationPipe глобально НЕ подключён** — `class-validator` декораторы в DTO декоративны и не проверяются.
- **Swagger** открыт на `/docs` без защиты.
- **Cron** (`TasksService`):
  - `59 59 23 * * *` — в 23:59:59 каждого дня: перевод групп без будущих уроков в `completed`, студентов без активных групп — в `noActive`.
  - `0 1 10 * *` — 10-го числа месяца в 01:00: начисление зарплат (кроме `percentLesson`).
- **SMS** через внешний шлюз `routee.sayqal.uz`. MD5-подпись запроса.
- **Статика** uploads раздаётся `useStaticAssets`.

### 3.2 Frontend

- **Роутинг:** `createBrowserRouter`. Структура двухуровневая: публичные `/auth`, `/auth/confirm` и защищённый `/*` под `AppShell` (lazy). Внутри — плоский список `children` без вложенных layout'ов, все под одним сайдбаром.
- **Guard доступа:** `AppShell` делает `<Navigate to="/auth" />` при `!authenticated`. На уровне конкретных страниц — `<RoleCheck allowedRoles={...}>`, который возвращает `<ForbiddenPage />` при несовпадении роли.
- **Состояние:**
  - `@reduxjs/toolkit` + `RTK Query`.
  - `persistReducer` хранит `authState` и `userState` в `localStorage` (key `persist:root`).
  - 15 отдельных `createApi`: `authApi`, `userApi`, `branchApi`, `courseApi`, `groupApi`, `mentorApi`, `scheduleApi`, `studentAPI`, `leedApi`, `fineApi`, `bonusApi`, `lessonsApi`, `accountingApi`, `testApi`, `imageApi`. У каждого свой `reducerPath` и `middleware`.
- **API-слой:** один `baseQuery` на `VITE_API_URL`. `prepareHeaders` вшивает `Authorization: Bearer {token}`. `baseQueryWithAuth` ловит 401 → `resetAuth` + `logout` (но используется ли он во всех сервисах — нужно проверять отдельно).
- **Layout:** кастомный `Layout/Layout.Header/Layout.Body` на контексте. Используется преимущественно в `Sidebar`. На остальных страницах часто обычный `<div>` с Tailwind.
- **Компонентная база:** shadcn/ui — button/card/dialog/form/input/select/table/tabs/toast/tooltip/sheet и т.д. Стилизация через CSS-переменные (`--primary`, `--secondary`, `--background`…) в `index.css`, темизация через `class="dark"` подготовлена.
- **Стили:** Tailwind. Кастомные breakpoints реверсивные: `{2xl, xl, lg, md, sm, xs}` заданы через `max:` — то есть это **mobile-last** (мобильный как базовая ветка, через `2xl:` ограничиваются десктопы).
- **Формы:** React Hook Form + Zod resolver. Каждая форма — отдельная папка в `src/features/{feature}-form/` со схемой в `schema/`.
- **i18n:** `localStorage`-чтение `persist:root` для ленивой инициализации языка.
- **Конфиг API URL:** `import.meta.env.VITE_API_URL` в `base-query.ts` и `sidebar.tsx` (для аватаров).

---

## 4. Функциональность

### 4.1 Страницы (frontend)

| Раздел | Страницы |
|--------|----------|
| Auth | `/auth` (ввод телефона), `/auth/confirm` (ввод OTP) |
| Dashboard | `/` (index) |
| Branches | list, create, update |
| Courses | list, create, update |
| Staff (users) | list, view, create, update |
| Mentors | list, view |
| Students | list, view, create, update |
| Leeds | list, update, to-student (конверсия лида в студента) |
| Groups | list, group-info, create, update, jurnal (журнал) |
| Lessons | view, check-student (отметка посещаемости) |
| Accounting | list, view, create (расход), update, debtors |
| Fines | list, view, create, update |
| Bonuses | list, view, create, update |
| Exams | list, view, create, update |
| Settings | `/settings` |
| Service | `/forbidden-page/forbidden-page`, not-found (`*`) |

### 4.2 Модули (backend)

Auth, Users, Mentors, Students, Branches, Courses, Groups, Lessons, Transactions, Fine, Bonus, Exam, Leeds, Avatar, SMS, Tasks (cron), Prisma.

### 4.3 Роли

Enum `Role`: `CEO`, `admin`, `manager`, `mentor`, `assistent` (опечатка — должно быть `assistant`). Роли хранятся массивом в `User.role`. Разграничение: на фронте — через `RoleCheck`, на бэке — через `@Roles() + RolesGuard`.

### 4.4 Формы (frontend `src/features/`)

auth-form, confirm-form, add-student-form, branch-form, course-form, create-lesson-form, exprence-form, fines-form, group-form, leed-form, lesson-status, schedule, settings, staff-form, student-bonus-form, student-form, student-trasaction-form, test-form.

### 4.5 Интеграции

- **SMS-шлюз** `routee.sayqal.uz` (MD5 подпись, env `SMS_USERNAME`, `SMS_SECRET_KEY`). Endpoint типы: `TransmitSMS`, `MulticastSMS`, `StatusSMS`.
- **Google Sheets** для переводов — скрипт `parse-translation-from-sheets.cjs` на фронте.

### 4.6 Данные

- Персональные данные студентов и родителей: ФИО, телефоны (студент/мать/отец), ПИНФЛ, паспорт, дата рождения, адрес.
- Финансовые данные: балансы студентов и сотрудников, транзакции (in/out), зарплаты, бонусы, штрафы.
- Образовательные: группы, уроки, посещаемость, оценки за экзамены.

---

## 5. UI/UX и дизайн

### 5.1 Единый стиль
- Есть. shadcn/ui как основа — единые button/card/dialog/input. CSS-переменные темы.
- Primary-цвет фиолетовый (видно в `logo-lms.svg`, fill=`#7000ff`).

### 5.2 Повторяются ли header/footer
- **Header** — только верхняя полоска в `Sidebar` с аватаром пользователя (desktop). На мобильных верхняя панель с бургером.
- **Footer** — отсутствует как отдельная сущность.
- Внутри страниц шапка/подвал не унифицированы: каждая страница сама управляет своим `Layout.Header` или обычным `<div>`.

### 5.3 Одинаковость элементов
- Кнопки, карточки, инпуты — да, через shadcn/ui компоненты.
- Таблицы — общий компонент `src/components/table/table.tsx` на `@tanstack/react-table`. Но может использоваться неконсистентно.
- Заголовки страниц — нет единого `PageTitle` компонента. Каждая страница задаёт свой вручную.

### 5.4 Адаптив
- Tailwind-брейкпойнты задачи через `max:` (нестандартно). Усложняет чтение кода и рассчитан на «desktop → mobile», в шаблонах реальных страниц могут быть пропуски адаптива.
- `useMediaQuery` используется точечно в `Sidebar`.
- Сайдбар закрывается автоматически на мобилке (через локальный state `navOpened`).

### 5.5 Визуальная консистентность
- Отсутствует дизайн-система верхнего уровня (нет tokens-файла помимо CSS-переменных; нет документации компонентов).
- Много ad-hoc компонентов вроде `comebox`, `page-accessed`, `discount` с непрозрачными именами.
- В названиях папок ошибки: `mounth-year-picker` (должно `month`), `exprence-form` (expense), `student-trasaction-form` (transaction), enum `assistent`.
- В SMS-шаблонах и других местах строки захардкожены на каракалпакском/узбекском — не локализованы.

---

## 6. Код и качество

### 6.1 Дубли
- **Controllers принимают Prisma-типы** (`@Body() data: Group`, `@Body() data: Course`) вместо DTO — повторяется в большинстве контроллеров (groups, courses, fines, bonus, transactions и т.д.).
- **Паттерн пагинации** в сервисах повторяется вручную (`skip = (page-1)*10`) вместо выделенной хелпера.
- На фронте 15 одинаково структурированных `createApi` — много boilerplate, можно объединить эндпоинты.

### 6.2 Устаревшие подходы
- `jsonwebtoken` напрямую вместо `@nestjs/jwt` / `passport-jwt`.
- Собственный `AuthMiddleware` вместо `AuthGuard('jwt')`.
- MD5 для подписи SMS запросов.
- Запуск `nest start --watch` (dev) в контейнере production (прежняя версия Dockerfile).
- `class-validator` декораторы без `ValidationPipe` — работают как комментарии.
- Прямое чтение `localStorage.getItem("persist:root")` и `JSON.parse` в `i18n.ts` — хрупкая интеграция.
- Старый `Scope.REQUEST` для `AuthService` — на каждый запрос пересоздаётся всё дерево зависимостей.

### 6.3 Слишком большие файлы
- `src/app/routes.tsx` — длинный, плоский список всех routes, ~350 строк, много повторяющихся `RoleCheck`.
- `src/lib/utils.ts` — миксан функций (форматирование, даты, права, фильтры). Нужна декомпозиция.
- `src/transactions/transactions.service.ts` и `src/lessons/lessons.service.ts` — сложная финансовая логика в одном файле без разделения ответственности.
- `src/students/students.service.ts` — `update` и `addBonus` длинные, с циклами и вложенными транзакциями.

### 6.4 Неиспользуемые/мусорные
- `src/groups/test.json` — тестовый файл в исходниках.
- `1b.csv` в корне бэкенда — подозрительный артефакт (импорт CSV).
- Закомментированный код блоками (`getSMSStatus` в `sms.service.ts`, закомментированные эндпоинты в `groups.controller.ts`).
- `console.log(date)` в `groups.service.ts` → `getGroupsLessons`.
- `@ts-ignore` в нескольких местах (`auth.service.ts`, `groups.service.ts`).
- `uploads/file-1730043758871-938713800.png` — бинарник в репозитории.
- В `src/app/store/store.config.ts` есть `useAppDispatch`, но `useAppSelector` отсутствует (хотя ожидаем пару).

### 6.5 Слабые места архитектуры
- Financial flow в транзакциях смешан с SMS-нотификациями в одном `prisma.$transaction` — при ошибке SMS может откатываться БД.
- Сложные выборки c вложенным `include` без лимитов в `students.service.findOne` (подгружается вся история студента разом).
- В `tasks.service.ts` цикл по группам → вложенный запрос `findMany` внутри итерации → N+1.
- `UsersService.create`/`update` при ошибке возвращают `error` как результат (`return e` / `return error`) — в вызывающий код уходит объект ошибки вместо exception.

### 6.6 Потенциальные баги
- `confirm` принимает OTP числом: при перезапуске сервера кеш сбрасывается (in-memory) — пользователь в середине логина не сможет подтвердить код.
- `addBonus` в `students.service` при `user.salaryMentorType !== 'percentLesson'` кидает BadRequestException внутри транзакции — откатит бонус, но клиент получит невнятный ответ.
- Сортировка в `findAll` студентов по `id: desc` — комментарий говорит «по дате создания», но такого поля нет в модели.
- Валидация роли при `update` user захардкожена на `id === 1`.
- `CreateStudentDto` содержит `groups: any` — полностью без валидации.
- Одна миграция `20241222153653_init` — любое изменение схемы потребует ручной работы.

---

## 7. Безопасность и данные

| Пункт | Состояние |
|-------|-----------|
| Хранение env | `.env` (не коммитится, в `.gitignore`). `.env.example` есть. На проде — Render dashboard, Vercel dashboard |
| Авторизация | Phone + OTP (6 цифр, кеш 900с) → JWT `Bearer`. `ACCESS_TOKEN_SECRET` через env. Срок токена 1 день |
| Dev-обход OTP | Добавлен: при `NODE_ENV !== 'production'` OTP = `000000`. Эндпоинт `/auth/dev-seed` создаёт тестового пользователя |
| Rate-limiting | Отсутствует. `@nestjs/throttler` в зависимостях, но не подключён. OTP-эндпоинты уязвимы к brute-force |
| ValidationPipe | Не подключён — валидация тел запросов не работает |
| Helmet / CSP / secure headers | Отсутствуют |
| CORS | Из env `CORS_ORIGIN` (поддерживается список через запятую). Fallback — `http://localhost:3001` |
| Secrets в коде | В бэкенде не найдено. На фронте тоже. MD5-ключ SMS в env |
| JWT | HS256 default, ключ в env. При отсутствии — упадёт на первом запросе (нет явной проверки в bootstrap) |
| CSRF | Не настроен (но, так как через Bearer-токен и нет cookie-сессий, это менее критично) |
| Utility/CSV импорт | `prisma/import-csv.ts` читает `1b.csv` — должен запускаться только локально |
| Swagger | Открыт на `/docs` без auth |
| SQL-injection | Риск низкий (Prisma ORM) |
| Загрузка файлов | `multer` без ограничения размера и MIME. Файлы в локальной `uploads/` (теряется при рестарте Render) |
| Утечки персональных данных | В логах нет, но `console.log(date)` присутствует. Риск — в SMS (шаблоны вшиты в `sms.service.ts` с живыми номерами) |
| Защита API | AuthMiddleware + RolesGuard. Отдельные эндпоинты открыты на фронте без ролевой проверки |

---

## 8. Запуск и проверка

### 8.1 Зависимости
```bash
# Backend
cd lms-backend-main
npm install

# Frontend
cd lms-frontend-main
npm install
```

### 8.2 Локальный запуск
Требуется PostgreSQL. В проекте использовался Docker:
```bash
docker run -d --name lms-postgres \
  -e POSTGRES_USER=lms -e POSTGRES_PASSWORD=lms123 -e POSTGRES_DB=lms \
  -p 5432:5432 postgres:15
```

Backend:
```bash
cd lms-backend-main
# В .env: DATABASE_URL, ACCESS_TOKEN_SECRET, CORS_ORIGIN, PORT=3002
npx prisma migrate deploy
npx prisma generate
npx ts-node prisma/seed.ts
npm run start:dev
```

Frontend:
```bash
cd lms-frontend-main
# В .env: VITE_API_URL=http://localhost:3002
npm run dev   # запускается на 3001
```

### 8.3 Production build
```bash
# Backend
npm run build
npm run start:prod       # node dist/src/main (ВНИМАНИЕ: dist/src/main, не dist/main)

# Frontend
npm run build            # tsc && vite build → dist/
```

### 8.4 Проверка
- **Backend build:** `npm run build` — OK (последняя проверка прошла).
- **Frontend tsc:** `npx tsc --noEmit` — OK.
- **Frontend vite build:** OK, но главный бандл 1.25MB (предупреждение о размере — нужен code-splitting).
- **ESLint:** не запускался в аудите. Судя по конфигам: backend разрешает `any` глобально, frontend — стандартный recommended.

### 8.5 Ошибки при деплое (текущий след)
- Render изначально пытался Docker build без Root Directory — падал.
- После переключения на Native Node упал `sh: 1: nest: not found` (исправлено: `npx nest build` + `npm install --include=dev`).
- После — `Cannot find module '/opt/render/project/src/lms-backend-main/dist/main'`. Причина — NestJS из-за `sourceRoot: src` + `prisma/` в `include` складывает выходной файл в `dist/src/main.js`. Исправлено изменением start-команды.
- Текущий статус: бэкенд жив, фронтенд получает CORS-ошибку до добавления `VITE_API_URL` и `CORS_ORIGIN` к Vercel-домену.

---

## 9. Что можно улучшить

### 9.1 Срочно (security / блокеры)
1. Подключить `ValidationPipe({ whitelist: true, transform: true })` глобально — без этого DTO-валидация мёртвая.
2. Подключить `@nestjs/throttler` на `/auth/*` (≤5 попыток/мин).
3. Добавить `helmet` и базовые security-заголовки.
4. Закрыть Swagger на проде (`if (process.env.NODE_ENV !== 'production')`).
5. Убрать `1b.csv` и `uploads/*.png` из гита, добавить в `.gitignore`.
6. Сделать `ACCESS_TOKEN_SECRET` обязательной переменной с проверкой при старте.
7. Убрать `Scope.REQUEST` из `AuthService` — критично для производительности.
8. Убрать `console.log` и `@ts-ignore` из прод-кода.
9. В `users.service.ts` заменить `return error` → `throw error`.
10. Убрать смешение SMS и финансовых операций в одной `$transaction` (идемпотентность, atomicity).

### 9.2 Важно (качество / architecture)
1. Ввести DTO для всех `@Body()` параметров; убрать прямое использование `Prisma.Group`/`Course`/etc.
2. Добавить централизованный error-handler (exception filter) + logger (winston/pino).
3. Включить `strictNullChecks` и `noImplicitAny` в `tsconfig.json` постепенно.
4. Разбить `routes.tsx` на feature-ориентированные роут-группы; унифицировать guard через wrapper `<PrivateRoute>`.
5. Унифицировать таблицы и заголовки страниц (единый `<PageHeader>`, `<DataTable>`).
6. Вынести SMS-шаблоны и хардкод строк в конфиг/локали.
7. Добавить индексы в Prisma (`Lesson.date`, `Lesson.groupId`, `Transaction.date`, `Student.status`).
8. Добавить health-check эндпоинт `/health` для Render.
9. Ввести миграции для изменений (не одну init-миграцию на всю историю).
10. Декомпозировать `src/lib/utils.ts` на `format-utils.ts`, `date-utils.ts`, `role-utils.ts` и т.д.

### 9.3 Можно позже
1. Многоязычие SMS.
2. Замена локальной `uploads/` на S3 / Cloudinary (Render не держит state).
3. Переработать финансовый модуль в Saga/Command pattern.
4. Добавить e2e-тесты на критичные операции (оплата, посещаемость, активация группы).
5. Code-splitting фронта (лениво грузить большие страницы).
6. Обновить Prisma до 7.x (warn про mismatch 5.19 vs 5.18).
7. Исправить опечатки в названиях (`mounth` → `month`, `exprence` → `expense`, `trasaction` → `transaction`, `assistent` → `assistant`) — это критично для maintainability, но требует координации фронт+бэк.

---

## 10. Рекомендованный план модернизации

### Этап 1. Безопасная чистка (не ломает поведение)
- Удалить `1b.csv`, `uploads/*.png`, `test.json`, закомментированный код.
- Убрать `console.log` и `@ts-ignore`.
- Закрыть Swagger на prod.
- Сделать `.env`-переменные обязательными (валидация при bootstrap).
- Добавить `ValidationPipe`, `helmet`, `throttler`.
- Добавить health-check.
- Отдать на ревью и деплой — фронт продолжает работать как раньше.

### Этап 2. Унификация структуры
- Бэк: DTO на все контроллеры, единый exception-filter, единый response-wrapper.
- Фронт: декомпозиция `routes.tsx`, извлечение `<PageHeader>`, `<DataTable>`, `<PrivateRoute>`.
- Добавить миграции вместо одной init.
- Логгер (pino) в бэк.

### Этап 3. Дизайн-система
- Ввести `<PageHeader>`, `<Section>`, `<EmptyState>`, `<DataTable>`.
- Унифицировать формы (общий `<FormLayout>` поверх react-hook-form).
- Разобрать `components/ui/` и документировать какие компоненты готовы, какие кастомные.
- Создать Storybook (опционально).
- Согласовать spacing/typography tokens.

### Этап 4. Архитектура
- Заменить `AuthMiddleware` на `@nestjs/passport` + JWT strategy.
- Вынести финансовую логику из `transactions.service` и `lessons.service` в отдельные use-case сервисы.
- Убрать `Scope.REQUEST` из `AuthService`.
- Разделить RTK Query слой — один `createApi` + `injectEndpoints` вместо 15 отдельных.
- Ввести идемпотентность финансовых операций (idempotency-key).

### Этап 5. Новые функции
- Полноценный reporting / аналитика (графики на recharts уже в deps).
- Экспорт в Excel.
- Push-уведомления менторам (Telegram bot или WebPush).
- Role-based мульти-ветки дашборда (CEO vs mentor vs manager).

### Этап 6. Оптимизация и deploy
- Code-splitting фронта (lazy-load страниц).
- Перевести загрузку файлов на S3-совместимое хранилище.
- Настроить GitHub Actions: lint → build → deploy (Render/Vercel).
- Мониторинг (Sentry / Logtail).
- CDN для статики.
- Плановая нагрузочная проверка (k6/artillery).

---

## Резюме

**Коротко о проекте.** Это рабочая LMS/CRM для узбекского образовательного центра: NestJS API + Prisma + PostgreSQL + React/Vite SPA. Функционал широкий (филиалы, курсы, группы, уроки, посещаемость, экзамены, финансы, SMS, крон-задачи, роли). Архитектура стандартная для NestJS + RTK Query, без явных нестандартных решений. Код работающий, но с накопленным техническим долгом, особенно по валидации, безопасности и единообразию.

**Главные проблемы.**
1. Глобальный `ValidationPipe` не подключён — валидация запросов де-факто отсутствует.
2. Нет rate-limiting на аутентификации.
3. `Scope.REQUEST` у `AuthService` — тяжёлый performance-hit.
4. Контроллеры принимают Prisma-типы вместо DTO — нет контроля входящих данных.
5. Смешение финансовых транзакций и сайд-эффектов (SMS) в одной БД-транзакции.
6. Длинные файлы (`routes.tsx`, `transactions.service.ts`, `lessons.service.ts`, `lib/utils.ts`) и одна миграция на всю схему.
7. Опечатки в доменных именах (mounth, exprence, trasaction, assistent) — требуют согласованного рефакторинга.
8. Отсутствие тестов.

**Лучший следующий шаг.** Запустить Этап 1 из плана — безопасная чистка + подключение `ValidationPipe`, `throttler`, `helmet`, закрытие Swagger на prod. Это даёт максимальный security-payoff при минимальном риске сломать поведение. Дальше итерационно по Этапам 2–4.
