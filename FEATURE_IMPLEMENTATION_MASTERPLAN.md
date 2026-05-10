# FEATURE_IMPLEMENTATION_MASTERPLAN.md

Документ описывает стратегию внедрения новых фичей в LMS/CRM. Подготовлено на базе `PROJECT_AUDIT.md` и `MODERNIZATION_PLAN.md`. Фокус — архитектура и порядок, а не код.

Stack: NestJS 10 + Prisma 5 + PostgreSQL, React 18 + Vite + RTK Query + shadcn/ui.

---

## 1. FEATURE CATEGORIES

Категории будущих фичей. Внутри каждой — примеры направлений.

| № | Категория | Примеры |
|---|-----------|---------|
| 1 | **Security** | 2FA, device sessions, audit log, IP whitelisting, suspicious login, password-less magic link |
| 2 | **CRM** | Воронка лидов, drag-and-drop pipeline, источники, причины отказа, конверсия, автоматические задачи |
| 3 | **LMS** | Домашние задания, оценки, материалы уроков, прогресс студента, сертификаты, онлайн-экзамены |
| 4 | **Finance** | Рассрочка, онлайн-оплата (Click/Payme), QR-квитанции, автосписания, касса, сверки, экспорт Excel/PDF |
| 5 | **Analytics** | BI по филиалам, LTV студента, churn, cohort, payment heatmap, attendance heatmap, custom dashboards |
| 6 | **AI** | AI-ассистент CEO, прогноз оттока, автогенерация отчётов, AI-проверка эффективности менторов, prediction долгов |
| 7 | **Notifications** | SMS + Telegram + Email + Push. Единый notification hub + шаблоны + расписания + очередь |
| 8 | **Telegram** | Bot + Mini App (студент/родитель/ментор), Telegram-login, оплаты через Telegram |
| 9 | **Mobile/PWA** | PWA, offline, push, QR-attendance, mobile-first layouts, camera-scan для посещаемости |
| 10 | **Reporting** | Конструктор отчётов, экспорт в Excel/PDF, scheduled reports, email digests |
| 11 | **Admin** | Permissions matrix, role editor, feature flags, SMS-template editor, salary constructor |
| 12 | **UX** | Command palette, global search, bulk actions, keyboard shortcuts, drag-and-drop scheduling |
| 13 | **Performance** | Redis cache, BullMQ queues, websocket realtime, CDN для аватаров, lazy-load pages |
| 14 | **Integrations** | 1C, Google Sheets (двусторонняя), Google Calendar, Payme/Click, внешние CRM через webhooks |
| 15 | **Enterprise** | Multi-tenant, франшизы, white-label, plugin system, centralized analytics сети центров |
| 16 | **Automation** | Авто-напоминания о долгах, авто-расчёт зарплат, авто-закрытие групп, авто-рассылки по триггерам |

---

## 2. FEATURE PRIORITY MATRIX

Шкала:
- **P0** — критично, блокер бизнеса или безопасности
- **P1** — очень полезно, высокий ROI
- **P2** — улучшения UX/DX
- **P3** — future ideas

### P0 — критично

| Фича | Business impact | Complexity | Backend | Frontend | DB | Scale |
|------|:---------------:|:----------:|:-------:|:--------:|:--:|:-----:|
| Security hardening (ValidationPipe + Throttler + helmet + env validation) | 🔴 High | 🟢 Low | 🟡 Medium | 🟢 None | 🟢 None | 🟢 None |
| Refresh-token flow | 🔴 High | 🟡 Medium | 🟡 Medium | 🟢 Low | 🟢 None | 🟡 Medium |
| Audit log (кто, что, когда менял финансовые записи) | 🔴 High | 🟡 Medium | 🟡 Medium | 🟡 Medium | 🔴 Yes (new table) | 🟢 None |
| Notification hub (SMS + Telegram через очередь) | 🔴 High | 🟠 High | 🟠 High | 🟢 Low | 🟡 Yes (templates, log) | 🟡 Medium |
| Backup + restore policy (Neon уже делает, но нужно расписание) | 🔴 High | 🟢 Low | 🟢 None | 🟢 None | 🟢 None | 🟢 None |
| Health-check + uptime monitoring | 🔴 High | 🟢 Low | 🟢 Low | 🟢 None | 🟢 None | 🟢 None |

### P1 — очень полезно

| Фича | BI | Complexity | BE | FE | DB | Scale |
|------|:--:|:---:|:-:|:-:|:-:|:-:|
| Домашние задания + сдача | 🟠 High | 🟡 Medium | 🟡 Medium | 🟠 High | 🔴 Yes | 🟡 |
| Личный кабинет студента/родителя | 🟠 High | 🟠 High | 🟠 High | 🟠 High | 🟡 Small | 🟡 |
| Telegram-бот с напоминаниями и балансом | 🟠 High | 🟠 High | 🟠 High | 🟢 Low | 🟡 Small | 🟡 |
| Воронка лидов с drag-and-drop | 🟠 High | 🟡 Medium | 🟡 Medium | 🟠 High | 🟢 None | 🟢 |
| Онлайн-оплата Click/Payme | 🔴 High | 🟠 High | 🟠 High | 🟡 Medium | 🟡 Small | 🟡 |
| Рассрочка + scheduled payments | 🟠 High | 🟡 Medium | 🟡 Medium | 🟡 Medium | 🟡 Small | 🟢 |
| BI-дашборд (branch metrics, KPI) | 🟠 High | 🟠 High | 🟠 High | 🟠 High | 🔴 Yes (views) | 🟠 |
| Экспорт Excel/PDF (транзакции, списки) | 🟠 High | 🟢 Low | 🟡 Medium | 🟡 Medium | 🟢 None | 🟢 |
| Command palette + global search | 🟡 Medium | 🟡 Medium | 🟡 Medium | 🟠 High | 🟢 None | 🟢 |

### P2 — улучшения

| Фича | BI | C | BE | FE | DB | Scale |
|------|:-:|:-:|:-:|:-:|:-:|:-:|
| AI-резюме по филиалу для CEO | 🟡 | 🟠 | 🟡 | 🟡 | 🟢 | 🟡 |
| Churn prediction | 🟠 | 🟠 | 🟠 | 🟢 | 🟡 | 🟠 |
| 2FA для сотрудников | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟢 |
| Device / session management | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟢 |
| Gamification студентов | 🟡 | 🟡 | 🟡 | 🟠 | 🟡 | 🟢 |
| QR-check-in посещаемости | 🟠 | 🟡 | 🟡 | 🟠 | 🟢 | 🟢 |
| Shift planner / workload менторов | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟢 |
| Feature flags + A/B-тесты | 🟢 | 🟡 | 🟡 | 🟡 | 🟡 | 🟢 |

### P3 — future ideas

| Фича | BI | C | Note |
|------|:-:|:-:|------|
| Multi-tenant / франшизы | 🔴 | 🔴 | Только после стабилизации |
| Plugin marketplace | 🟡 | 🔴 | Долгая миссия |
| Video lessons + recording | 🟡 | 🟠 | Storage/CDN heavy |
| AI-агент для оператора колл-центра | 🟠 | 🔴 | Зависит от зрелости AI |
| Pluggable payment adapters | 🟡 | 🟠 | После 2-3 интеграций |
| Offline-first mobile app | 🟡 | 🔴 | После PWA |

---

## 3. SAFE IMPLEMENTATION ORDER

### 3.1 Можно внедрять сразу (без cleanup)
- **Security hardening** (ValidationPipe, Throttler, helmet, env validation) — ничего не ломает.
- **Health-check + uptime** — новый модуль, изолированный.
- **Backup policy + monitoring** — внешние сервисы, конфигурация.
- **Feature flags** (простой `FeatureFlagService` + env) — новый tooling, не лезет в существующую логику.
- **Экспорт в Excel/PDF** — read-only, новый модуль (`ExportModule`).

### 3.2 Только после cleanup (Этап 2 из MODERNIZATION_PLAN)
- **Audit log** — требует единого точки логирования = interceptor + DTO-слой.
- **Notification hub** — требует, чтобы SMS был вычищен и SMS-шаблоны вынесены.
- **Refresh-token flow** — требует рефактора `AuthService` (убрать `Scope.REQUEST`).
- **Воронка лидов drag-and-drop** — требует консистентного RTK Query слоя (Этап 3 FE cleanup).
- **BI-дашборд** — требует вынесения агрегаций в отдельные запросы / views.

### 3.3 Только после performance optimization (Этап 5)
- **Личный кабинет студента/родителя** — добавит trafic, нужен Redis-кеш и оптимизированные запросы.
- **Telegram mini app** — высокая частота запросов, нужен webhook-слой + очередь.
- **Real-time уведомления через WebSocket** — требует stateful-инфраструктуры.
- **AI-прогнозы** — нужны денормализованные данные + cron для обучения/обновления моделей.

### 3.4 Требуют миграции БД
- Audit log → новая таблица `AuditLog`.
- Notifications → `NotificationTemplate`, `NotificationLog`, `NotificationChannel`.
- Homework → `Homework`, `HomeworkSubmission`.
- Рассрочка → `PaymentPlan`, `PaymentPlanItem`.
- Telegram → `TelegramLink`, `TelegramSession`.
- AI data → `AiInsight`, `AiPrediction`.
- Reporting → materialized views или агрегирующие таблицы.
- Feature flags → `FeatureFlag`.

### 3.5 Требуют redesign
- **Multi-tenant** — переделка всего слоя доступа, расширение `branchId` до `tenantId`.
- **White-label** — вынесение брендинга (logo, colors, domain) из хардкода.
- **Plugin system** — hot-module loading в NestJS.
- **Marketplace** — отдельный продукт поверх текущего.

---

## 4. FEATURE DEPENDENCIES

Карта зависимостей. `A → B` означает "A требует B".

```
Security hardening (P0)
  └── всё остальное

Refresh-token flow
  ├── Rate-limiter (security)
  └── Redis cache (OTP, refresh blacklist)

Telegram Mini App
  ├── Stable auth (refresh-token)
  ├── API versioning /api/v1
  ├── Notification layer
  └── CORS + rate-limit для webhook

AI analytics
  ├── Reporting layer (нормализованные/агрегированные таблицы)
  ├── Queues (BullMQ) — для тяжёлых batch-задач
  ├── Cron optimization (вынос из HTTP-процесса)
  ├── Event bus (domain events) — для сборки features
  └── Redis / Neon read-replica

Online payments (Click/Payme)
  ├── Idempotency layer (important!)
  ├── Webhook handler with signatures
  ├── Transaction log
  └── Audit log

Parent/Student cabinet
  ├── Student-facing auth (отдельно от сотрудников)
  ├── Notification layer
  ├── Stable API (versioning)
  └── Personal data guard (role-based)

Homework system
  ├── File uploads → S3
  ├── Notification layer
  └── Comments/reviews

BI Dashboard
  ├── Reporting tables / views
  ├── Cache layer (Redis или in-app)
  └── Export module (Excel/PDF)

Multi-tenant
  ├── Всё с branchId должно переехать на tenantId
  ├── Auth — per-tenant
  ├── Biling — per-tenant
  └── Domain routing

Mobile PWA
  ├── API versioning
  ├── Push notifications (VAPID или FCM)
  ├── Offline-capable RTK Query (persist + optimistic)
  └── Service Worker

Gamification
  ├── Event bus (attendance, exam, lesson completed)
  └── Leaderboard computation (cron или streaming)

Audit log
  ├── Interceptor / middleware
  ├── Request context
  └── Retention policy (partitioning или cron-archive)
```

---

## 5. BACKEND EXPANSION PLAN

### 5.1 Новые модули (предварительный список)
| Модуль | Назначение | Зависит от |
|--------|------------|------------|
| `NotificationModule` | Единый hub отправки (SMS/Telegram/Email/Push), шаблоны, очередь | BullMQ, Redis |
| `AuditModule` | Логирование действий пользователей | Interceptor |
| `ReportModule` | Генерация отчётов (in-memory + async) | BullMQ для тяжёлых |
| `ExportModule` | Excel/PDF export | exceljs, puppeteer/react-pdf |
| `PaymentModule` | Интеграция Click/Payme, webhook, idempotency | — |
| `PaymentPlanModule` | Рассрочка, scheduled payments | Payment, Cron |
| `HomeworkModule` | CRUD заданий и сдач | Files, Notification |
| `FileModule` | Загрузка в S3 (переезд с локальной `uploads/`) | S3 SDK |
| `TelegramModule` | Bot handler, webhook, mini-app API | Notification, Auth |
| `DashboardModule` | Агрегированные данные для BI | Cache |
| `AiModule` | OpenAI/Claude prompts, embedding, prediction | Redis, Report |
| `FeatureFlagModule` | Включение/выключение фичей по user/role/branch | Redis |
| `SessionModule` | Активные сессии, device management | Redis |
| `CommonQueueModule` | BullMQ-инфраструктура | Redis |
| `SearchModule` | Full-text (pg_trgm) + возможно Typesense | — |
| `PermissionsModule` | RBAC с гранулярными permissions | Audit |

### 5.2 Сервисы, которые нужно разделить
- `LessonsService` → `LessonScheduleService` + `AttendanceService` + `LessonPaymentService`.
- `TransactionsService` → `PaymentService` (доходы) + `ExpenseService` (расходы) + `SalaryService`.
- `StudentsService` → `StudentService` + `StudentBonusService` + `StudentGroupService`.
- `UsersService` → `UserService` + `StaffService` (сотрудники) + `MentorLinkService`.

### 5.3 Cron jobs, которые нужно вынести
- Закрытие групп (23:59:59) → worker-процесс + distributed lock.
- Начисление зарплат (10-го числа) → worker-процесс + аудит.
- Новые: notification scheduler (напоминания об оплате), отчёты, AI-precompute.

### 5.4 Где нужны queues (BullMQ + Redis)
- SMS-отправка.
- Telegram-отправка.
- Email-отправка.
- PDF-генерация отчётов.
- AI-инференс.
- Batch-операции (массовый импорт студентов, перерасчёт балансов).
- Webhook-retry (Click/Payme).

### 5.5 Где нужен Redis
- Cache OTP (вместо in-memory).
- Rate-limit counters.
- Refresh-token blacklist.
- Session storage.
- BullMQ backend.
- Pub/Sub для websocket.
- Кеш BI-агрегатов.

### 5.6 Где нужен WebSocket
- Live-журнал посещаемости (ментор отмечает → координатор видит мгновенно).
- Уведомления в UI (новый лид, новая оплата).
- Chat support (если появится).
- Dashboard updates.
- Drag-and-drop воронки — broadcast между юзерами.

### 5.7 Где нужен S3
- Аватары (`uploads/` → S3).
- Файлы домашних заданий.
- Материалы уроков (PDF, видео).
- Генерированные отчёты (PDF).
- Backup экспорт.

---

## 6. FRONTEND EXPANSION PLAN

### 6.1 Как масштабировать routes
- Разбить `routes.tsx` по фичам: `private-routes.tsx`, `admin-routes.tsx`, `ceo-routes.tsx`, `mentor-routes.tsx`, `student-routes.tsx`.
- Ввести `AppRoute[]` с мета (icon, title, roles, featureFlag) — генерировать и sidebar, и router из одного источника.
- Lazy-load по разделу (`students/*`, `groups/*`, `accounting/*`).
- Error boundary на уровне root + на каждом разделе.

### 6.2 Как улучшить layouts
- Ввести `<AppLayout>` (sidebar + topbar + content).
- `<PublicLayout>` для auth-страниц.
- `<StudentLayout>` / `<ParentLayout>` для будущих ЛК.
- `<PageHeader>` + `<Breadcrumb>` + `<PageActions>` унифицированы.
- `<Section>` для вертикальной сетки.

### 6.3 Как унифицировать pages
- Вводить паттерны: `ListPage`, `DetailPage`, `CreatePage`, `UpdatePage`.
- `ListPage`: заголовок + фильтры + `<DataTable>` + пагинация.
- `DetailPage`: заголовок + tabs + content.
- `CreatePage`/`UpdatePage`: заголовок + `<FormLayout>`.
- Создать шаблоны через кодогенерацию (plop.js) — один cli-вызов генерирует страницу + service + schema.

### 6.4 Dashboard system
- `<DashboardGrid>` + `<Widget>` компоненты.
- Widgets: `<MetricCard>`, `<ChartWidget>`, `<ListWidget>`, `<ActivityFeed>`.
- Персонализация: widget-layout хранится в `user.settings` (JSON).
- Role-based default-дашборды (CEO, Manager, Mentor, Student).

### 6.5 Feature modules
- Feature-sliced design: `features/<feature>/{ui, model, api, lib, types}`.
- Уже есть `features/` — доразвить, вынести API-слой (сейчас он в `app/store/services`).
- Cross-feature через `entities/` слой (Student, Group, Lesson как entity).

### 6.6 Mobile-first architecture
- Переработать Tailwind breakpoints: стандартные `sm/md/lg/xl/2xl` с `min-width`.
- Вводить responsive primitives: `<Stack>`, `<Row>`, `<Grid>` с `cols={{ base: 1, md: 2, lg: 3 }}`.
- Таблицы: `<DataTable mobileVariant="cards">` — на узких экранах превращаются в карточки.
- Touch-friendly: крупные tap-targets, swipe actions.
- Offline UX: optimistic updates + sync indicator.

---

## 7. DATABASE EVOLUTION PLAN

**НЕ МЕНЯЕМ schema сейчас.** Ниже — описание будущих миграций с контекстом.

### 7.1 Будущие таблицы

#### AuditLog
- `id, userId, action, entity, entityId, diff JSON, ip, userAgent, createdAt`
- Индексы: `(userId, createdAt)`, `(entity, entityId)`, `(createdAt)` для partitioning.
- Retention: 12 месяцев, затем архив.

#### NotificationTemplate
- `id, code, channel (sms/telegram/email/push), subject, body, locale, variables JSON`
- Уникально: `(code, channel, locale)`.

#### NotificationLog
- `id, templateId, recipient, channel, status, payload JSON, sentAt, deliveredAt, errorMessage`
- Индекс: `(recipient, createdAt)`.

#### TelegramLink
- `id, userId / studentId, telegramUserId, username, linkedAt, active`
- Уникально: `telegramUserId`.

#### TelegramSession
- `id, telegramUserId, state, context JSON, updatedAt` — для bot FSM.

#### RefreshToken
- `id, userId, tokenHash, deviceId, userAgent, ip, expiresAt, revokedAt`
- Индекс: `(userId)`, `(tokenHash)`.

#### UserSession (если нужен device management)
- `id, userId, deviceId, deviceName, ip, lastSeenAt, createdAt`

#### PaymentPlan
- `id, studentId, totalAmount, monthsCount, startDate, status, createdAt`

#### PaymentPlanItem
- `id, planId, dueDate, amount, paidAmount, status` — графики платежей.

#### PaymentWebhook (Click/Payme)
- `id, provider, externalId, payload JSON, status, createdAt`
- Уникально: `(provider, externalId)` — для idempotency.

#### Homework
- `id, lessonId / groupId, title, description, attachments JSON, dueDate, createdBy, createdAt`

#### HomeworkSubmission
- `id, homeworkId, studentId, files JSON, comment, grade, reviewedBy, submittedAt, reviewedAt`

#### FeatureFlag
- `id, key, enabled, scope (global/branch/role/user), scopeValue, createdAt`

#### AiInsight
- `id, kind (ceo-summary/churn/etc.), targetType, targetId, data JSON, confidence, generatedAt, expiresAt`

#### Report (generated)
- `id, kind, params JSON, fileUrl, generatedBy, generatedAt, expiresAt`

#### StudentTag / LeedTag (mini-CRM)
- `id, name, color, branchId`
- `StudentTagLink(studentId, tagId)` many-to-many.

#### Materialized views для reporting
- `mv_branch_metrics_monthly`
- `mv_student_lifetime_value`
- `mv_mentor_efficiency`
- `mv_group_health`

### 7.2 Индексы, которые понадобятся
- `Lesson(date, groupId, status)` — для журналов и cron.
- `Transaction(date, branchId, type)` — для финансовых отчётов.
- `Student(status, branchId)` — для списков.
- `Student` — full-text по `fio`, `phone` (pg_trgm).
- `GroupStudent(studentId, status)`.
- `User(phone)` — уже уникальный.
- `Leed(status, authorId, createdAt)` — для воронки.

### 7.3 Отдельно про денормализацию для AI
- AI-модели не должны читать оперативную БД в hot-path.
- Nightly ETL → таблицы `dw_students`, `dw_payments`, `dw_attendance` с только нужными полями и агрегатами.
- Или использовать внешний warehouse (ClickHouse / BigQuery) через CDC.

---

## 8. AI FEATURES ARCHITECTURE

### 8.1 AI Assistant (general)
- Отдельный `AiModule`.
- LLM-провайдер абстрактный (OpenAI/Claude/локальный): интерфейс `AiProvider { chat(), embed() }`.
- Prompts хранятся в БД или файлах `src/ai/prompts/*.md` с версионированием.
- Rate-limiting и бюджет per-branch / per-user.
- Логирование всех запросов для аудита и обучения.

### 8.2 AI Reporting (summary)
- Cron или on-demand: собирает метрики за период → промпт → текстовое резюме для CEO/менеджера.
- Данные: branch metrics, top-leads, churn students, payment overview.
- Генерация в queue, результат в `AiInsight` table.
- UI: блок на dashboard "AI пишет отчёт...".

### 8.3 AI Analytics
- Анализ паттернов посещаемости, долгов, успеваемости.
- Использует агрегаты из reporting-таблиц.
- Output: insights ("В филиале А рост пропусков на 18% за 2 недели, возможно связан с ментором X").

### 8.4 AI Recommendations
- Recommendations для менеджера: кому позвонить сегодня (ML-score на основе истории лидов).
- Для CEO: какие курсы масштабировать, кого повысить.
- Для ментора: с каким студентом поговорить отдельно.

### 8.5 AI Notification generation
- При наличии шаблона + контекста — персонализация сообщения.
- "Уважаемый родитель, Ахмад на 3 урока пропустил подряд и имеет долг 450 000. Свяжитесь с [нашим менеджером]".
- Использование ИИ только если шаблон разрешает — иначе fallback на статичный.

### 8.6 AI Debt prediction
- Модель: classification (заплатит в срок / не заплатит / под угрозой).
- Features: история платежей студента, посещаемость, сумма долга, сколько детей в семье (если есть).
- Обновление еженедельно через cron job.
- Output: `risk_score` в dashboard долгов.

### 8.7 AI Attendance prediction
- Для каждого студента — вероятность пропуска следующего урока (timeseries / XGBoost).
- Помогает ментору готовиться, менеджеру — проактивно связываться.
- Алерт: риск > 70% → уведомление координатора.

### 8.8 Инфраструктура
- Провайдер: OpenAI GPT-4o-mini для лёгких задач, Claude для сложных summary.
- Embedding: text-embedding-3-small или локальный.
- Vector store (для поиска по материалам): pgvector в PG или Qdrant/Pinecone.
- Cost control: бюджеты в env + алерты.

---

## 9. TELEGRAM ECOSYSTEM

### 9.1 Telegram bot
- Отдельный `TelegramModule` с webhook-endpoint.
- FSM через `TelegramSession` таблицу или Redis.
- Команды: `/start`, `/balance`, `/schedule`, `/homework`, `/support`.
- Linking: студент/родитель получает уникальный код → вводит в боте.

### 9.2 Telegram Mini App
- Frontend в iframe внутри Telegram WebApp.
- Авторизация через `initData` от Telegram (HMAC-SHA256 проверка на бэке).
- Отдельный набор роутов на фронте: `/tg/student`, `/tg/parent`, `/tg/mentor`.
- Переиспользует существующий API (через `TelegramLink`-based auth → JWT).

### 9.3 Parent cabinet (через Telegram)
- Баланс детей.
- Расписание.
- Посещаемость (статусы).
- История платежей.
- Кнопка "Оплатить" → Click/Payme внутри Telegram.
- Чат с администрацией.

### 9.4 Mentor cabinet (Telegram)
- Список групп.
- Расписание на сегодня.
- Отметка посещаемости.
- Комментарии по студентам.
- Уведомления о заменах.

### 9.5 Notifications (Telegram как channel)
- Напоминания об уроке.
- Уведомления о пропусках.
- Уведомления об оплатах.
- Домашние задания.

### 9.6 Telegram Attendance Confirm
- Родитель может подтвердить, что ребёнок отсутствует по уважительной причине, через inline-кнопки.

### 9.7 Telegram Homework
- Студент загружает фото/файл → обрабатывается botом → привязывается к `HomeworkSubmission`.

### 9.8 Telegram Payment Integration
- Через Telegram Payments API (YooMoney / Stripe / локальные шлюзы через Payme/Click).
- Либо deep-link на web-page оплаты.

### 9.9 Telegram Support Chat
- Inline-обращение в поддержку.
- Получает менеджер-на-смене в Telegram-группе.

---

## 10. ENTERPRISE SCALING

### 10.1 Multi-tenant
- Ввести `Tenant` table: `id, name, domain, brand JSON, plan, createdAt`.
- Все сущности получают `tenantId` (миграция с default).
- Access middleware: резолвит tenant по subdomain / header.
- Per-tenant: config, branding, SMS credentials, payment provider keys.

### 10.2 Franchise mode
- Parent-child tenants (`Tenant.parentId`).
- Централизованная отчётность для родителя-франшизодержателя.
- Per-child customization внутри рамок parent policy.

### 10.3 Branch isolation
- Уже есть `Branch` + `UserBranch` — базовое разделение.
- Усилить: queries автоматически фильтруются по `branchId` через NestJS request-scoped context (без `Scope.REQUEST` — через `AsyncLocalStorage`).

### 10.4 Centralized analytics
- Data warehouse (ClickHouse или PG read-replica).
- CDC из основной БД.
- Dashboard с кросс-tenant аналитикой для сети центров.

### 10.5 White-label
- Тема, логотип, фавикон, название → из `Tenant.brand`.
- Email/SMS-шаблоны с подстановкой brand.
- Кастомный домен.
- В UI убрать хардкод "RUSTAMBEK" — хранить в `Tenant.name`.

### 10.6 Plugin system
- Long-term. NestJS dynamic modules + manifest.
- Плагин регистрирует: endpoints, cron-jobs, UI-widgets, notification-channels.
- Sandboxing и версионирование.

---

## 11. IMPLEMENTATION WAVES

### Wave 1 — Stabilization (недели 1–4)
**Цель:** production-safe, secure, monitored.
- Security hardening (P0).
- Refresh-token.
- Audit log (базовый).
- Health-check + Sentry/Logtail.
- Backup policy.
- S3 для uploads.
- Redis (cache + OTP).
- CI/CD (GitHub Actions).

### Wave 2 — Architecture (недели 5–10)
**Цель:** устранить technical debt, подготовить почву для фичей.
- DTO на все контроллеры (Этап 2 MODERNIZATION).
- Убрать `Scope.REQUEST`.
- Разделить большие сервисы.
- Единый RTK Query + decomposed routes.
- ValidationPipe + глобальный error filter.
- BullMQ + queues для SMS и notification-hub.
- Notification module (SMS + Telegram basic).

### Wave 3 — UX (недели 11–16)
**Цель:** design system и мобильный UX.
- `<PageHeader>`, `<DataTable>`, `<FormLayout>`.
- Mobile-first re-layout страниц.
- Command palette + global search.
- Bulk actions, saved filters.
- PWA + push.
- Экспорт Excel/PDF.

### Wave 4 — Automation (недели 17–22)
**Цель:** автоматизация рутины.
- Воронка лидов drag-and-drop.
- Авто-напоминания о долгах.
- Авто-расчёт зарплат (переписка).
- Scheduled reports для CEO.
- Рассрочка.
- Online payments (Click/Payme).
- Webhook-centric architecture.
- Telegram bot (базовый + balance/schedule).

### Wave 5 — AI (недели 23–30)
**Цель:** AI-слой поверх зрелой платформы.
- AI-отчёты для CEO.
- Churn prediction.
- AI-рекомендации менеджеру.
- AI-анализ эффективности менторов.
- AI-помощник в notification generation.
- Telegram Mini App (студент/родитель/ментор).

### Wave 6 — Enterprise scaling (недели 30+)
**Цель:** multi-tenant, white-label, franchise.
- Multi-tenant architecture.
- White-label.
- Plugin system foundation.
- Gamification.
- Marketplace (долгосрочно).

---

## 12. CTO EXECUTION PLAN

### Месяц 1 (Wave 1)
- **Security hardening** (ValidationPipe, Throttler, helmet, env validation).
- **Refresh-token + device sessions** (новая таблица `RefreshToken`).
- **Audit log** (базовый, через interceptor).
- **Sentry** + uptime monitoring.
- **S3** для uploads.
- **Redis** (cache + OTP + BullMQ backend).
- **CI/CD** на GitHub Actions.
- Цель: production-ready без технических блокеров.

### Месяц 2–3 (Wave 2)
- **DTO rollout** по всем контроллерам (по 1 модулю/день).
- **Scope.REQUEST** убран.
- **BullMQ** + Notification hub.
- **Telegram bot** (базовый: /balance, /schedule, /homework read-only).
- **ExportModule** (Excel/PDF).
- **Command palette** на фронте.
- **RTK Query unified**.
- **Mobile-first** для топ-5 страниц.
- Цель: подготовка к фичам + первые пользовательские фичи.

### Месяц 4–6 (Wave 3–4)
- **Design system** унифицирован (PageHeader, DataTable, FormLayout).
- **PWA** + push notifications.
- **Воронка лидов** drag-and-drop.
- **Рассрочка** + **Online payments** (Click/Payme).
- **Homework system**.
- **Parent cabinet** (первая версия через Telegram Mini App).
- **BI Dashboard** с ключевыми метриками по филиалу.
- **Автоматизации**: напоминания о долгах, scheduled reports.
- Цель: фичи для CEO/менеджера + parent-кабинет.

### Месяц 7–12 (Wave 5–6)
- **AI-слой**: CEO-summary, churn prediction, рекомендации.
- **Telegram Mini App** для всех ролей.
- **Gamification** студентов.
- **Multi-tenant** foundation (подготовка схемы, без активации).
- **White-label** (бренд в БД, не в коде).
- **Reporting warehouse** (PG read-replica или ClickHouse).
- **Marketplace** idea MVP (один-два плагина через manifest).
- Цель: конкурентоспособная SaaS-платформа, готовая к франшизам.

---

## 13. IMPORTANT

**Сейчас код НЕ пишем.** Этот документ — strategy-only.

Запреты на этой фазе:
- Не пишем код фичей.
- Не меняем Prisma schema.
- Не создаём миграции.
- Не меняем routes.
- Не обновляем major versions.

Следующий шаг — согласование с владельцем бизнеса приоритетов Wave 1 и получение ответа на:
1. Какие роли пользователей войдут в Wave 1 (только сотрудники — или parent cabinet тоже сразу)?
2. Какой payment provider первым (Click или Payme — оба или один)?
3. SLA на uptime и backup retention?
4. Бюджет на AI (OpenAI tokens per month)?
5. Telegram — bot или сразу Mini App?

После ответов готовится **technical spec на Wave 1** с user stories, acceptance criteria, migration plan.
