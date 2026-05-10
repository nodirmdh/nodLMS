# PROGRESS_LOG

Журнал работы по проекту LMS. Каждый раздел — одна сессия.
Последняя запись сверху, как changelog.

---

## 2026-05-10 — Wave 1 + Wave 2: инфраструктура и фичи

**Ветка:** `feat/wave1-wave2-infra` (3 коммита).
**PR:** https://github.com/nodirmdh/nodLMS/pull/new/feat/wave1-wave2-infra

### Что сделано

#### Инфраструктура (Wave 1, фундамент)

- **Redis + BullMQ**: 6 очередей (`notifications`, `sms`, `telegram`, `reports`, `scheduler`, `dlq`).
- **Bull Board UI** на `/admin/queues` (в dev открыт, в prod — под basic-auth через `SWAGGER_USER/PASSWORD`).
- **Dead-letter queue**: `DlqService` слушает `failed` события, складывает окончательно упавшие джобы в `dlq`. Админ-эндпоинты `/admin/queues/dlq`, `/redrive`, `/drop`.
- **Health-check** `/health` — БД + Redis + очереди.
- **Sentry integration** (опционально, активируется через `SENTRY_DSN`).
- **Redis-throttler storage** — rate-limit работает в кластере.
- **Worker entrypoint** `src/worker.ts` + `WorkerModule`. Запуск: `npm run start:worker`.
- **`shouldHostWorkers()`** — условная регистрация процессоров. В single-box dev оба процесса обрабатывают; в prod worker поднимает только процессоры, API — только продюсеров.

#### Auth

- **Refresh-token flow**: таблица `RefreshToken`, эндпоинты `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout-all`. Single-use rotation, SHA-256 хэш, TTL 30 дней (`REFRESH_TOKEN_TTL_DAYS`).
- **OTP переехал в Redis** (`OtpService`, ключ `otp:<phone>`, TTL 900s, fallback in-memory).
- **AuthService без `Scope.REQUEST`** — убран request-scoped провайдер, `getMe()` через `@CurrentUser`.
- **`UserCacheService`** — `user:<id>` в Redis (TTL 30s), `AuthMiddleware` больше не долбит БД на каждый запрос. На локальной конфигурации с Neon ответ упал с ~1300 ms до 4 ms.
- **`@Throttle`** на login/confirm/send-sms/refresh.

#### Prisma

- Миграция `wave1_infra` (20260510163638): `notification_templates`, `notification_logs`, `audit_logs`, `refresh_tokens`.
- Миграция `wave2_features` (20260510174010): `tasks`, `payment_plans`, `payment_plan_items`, `homeworks`, `homework_submissions`, `telegram_links`; `Leed.position` + `refusedReason`.
- Индексы на hot-path: `Lesson(date,groupId)`, `Transaction(date,branchId)`, `Student(status,fio)`, `GroupStudent(studentId,status)`, `Leed(status,authorId,position)`.
- Миграции применены через прямой SQL executor (баг Prisma + Neon advisory-lock).

#### Аудит

- **`AuditModule`** + декоратор `@Audit({ action, entity })` + глобальный `AuditInterceptor`.
- Навешен на транзакции, шаблоны уведомлений, задачи, канбан-движения, рассрочку, домашки.

#### Notification Hub

- `NotificationService.sendFromTemplate(code, channel, recipient, variables, locale?)`.
- `NotificationTemplateService.render()` + `{{ dotted.path }}` renderer.
- `NotificationLogService`: `queued → sent / failed / skipped`.
- Seed 5 базовых шаблонов: `auth.otp`, `debt.reminder`, `payment.confirmed` (sms + telegram), `lesson.reminder`.
- **CRUD API шаблонов**: `GET/POST/PATCH/DELETE /admin/notifications/templates` + preview. Роли: CEO/admin.

#### Telegram bot (inbound)

- `POST /telegram/webhook` (публичный, проверка `X-Telegram-Bot-Api-Secret-Token`).
- `POST /telegram/link-codes` (CEO/admin/manager) — генерация 8-символьного кода привязки родителя.
- Команды в боте: `/start <код>`, `/balance`, `/schedule`, `/help`.
- `TelegramProcessor` — фан-аут отправки, dry-run без `TELEGRAM_BOT_TOKEN`.

#### Reports worker

- `ReportsProcessor` генерит Excel через ExcelJS, кладёт base64 в Redis (`report:result:<jobId>`, TTL 1 ч).
- API: `POST /admin/reports`, `GET /admin/reports/:jobId/status`, `GET /admin/reports/:jobId/download`.
- Первый kind — `transactions.excel`. Shortcut на странице транзакций — `POST /transactions/export.xlsx`.

#### Фичи (Wave 2)

- **Канбан лидов**: `GET /leeds/kanban` + `PATCH /leeds/:id/move`. Drag-and-drop сохраняет status + position.
- **Задачи**: `/tasks` с CRUD и виджетом агенды «сегодня-завтра».
- **Должники 2.0**: `/debtors` с сегментацией (0-29 / 30-59 / 60-89 / 90+) и bulk-SMS через Notification Hub.
- **Рассрочка**: `/payment-plans` с авто-генерацией графика, отметкой оплат, cron «overdue».
- **Домашки**: `/homework` + `/submissions` + review с оценкой.
- **Dashboard CEO**: `/dashboard/summary`, `/dashboard/branches` — KPI по сети и филиалам.

#### Фронт

Новые страницы:
- `/dashboard-ceo` (KPI + таблица филиалов).
- `/tasks` (агенда + канбан по статусам).
- `/debtors` (фильтр bucket, bulk-SMS).
- `/payment-plans` (создание плана + график платежей).
- `/homework` (задания + карточки с сдачами).
- `/admin/notification-templates` (CRUD + preview JSON).

Обновлены:
- `/leeds` — канбан на новом API с `position`.
- `/accounting` — кнопка «Excel».
- `/students/:id` — кнопка «Telegram» с link-code и deep-link `t.me/<bot>?start=<code>`.

Добавлено:
- Переиспользуемый `<ExportExcelButton />` (поллинг статуса + download).
- 9 новых RTK Query сервисов (dashboard, tasks, debtors, homework, payment-plans, reports, telegram, leeds-kanban, notification-templates).
- Локали для nav (ru/en/uzLat/uzKir/qq) — ключи `ceoDashboard`, `tasks`, `homework`, `debtors`, `paymentPlans`, `notificationTemplates`.

### Feature flags

В `.env` dev-значения:

```
NOTIFY_VIA_QUEUE=true       # финансовые SMS идут через очередь, а не sync
SCHEDULER_VIA_QUEUE=true    # cron → BullMQ repeat (распределённый lock)
WORKERS_IN_API=true         # в dev один процесс делает всё
```

В проде: `WORKERS_IN_API=false` + отдельный `start:worker:prod` процесс.

### Багфиксы после первого тестирования

1. **`ThrottlerModule` DI** — `RedisThrottlerStorage` не виделся. Выделен в `ThrottlerStorageModule` (@Global).
2. **`GroupsModule`** провайдит `LessonsService` локально — добавлен импорт `NotificationModule`.
3. **`CreateCourseDto`** содержал мёртвое поле `duration` — удалено.
4. **`CreateStudentDto`** требовал `leadId` обязательно — сделан опциональным, остальные поля тоже optional кроме `fio/phone/birthday`.
5. **`BranchesService.create`** — убран хардкод `userId=1`, брат текущий `user.id`.
6. **`TransactionsService.create` (зарплата)** — добавлена проверка `data.amount > availableBalance` → 400 вместо ухода баланса в минус.
7. **Исторические минусовые балансы** — 3 сотрудника (id=3,4,5) сброшены в 0 через одноразовый скрипт.

### Производительность

Основной dev-bottleneck — Neon us-east-1 (~190 ms RTT):
- `/auth/me` до кеша: 1327 ms → после: **4 ms**.
- `/courses`: ~950 ms (DB-bound, без кеша). Для фич, которые тормозят — позже включим Redis-кеш на `findAll`.

Альтернатива для комфортного dev: локальная Postgres (5 ms latency). Не настроили — Neon оставили.

### Что запускать локально

```cmd
:: 1. Redis
docker run -d --name lms-redis -p 6379:6379 redis:7-alpine

:: 2. API (бэк)
cd lms-backend-main
npm run start:dev

:: 3. Фронт
cd lms-frontend-main
yarn dev
```

API на `http://localhost:3002`, фронт на `http://localhost:3001`.
Swagger — `/docs`, Bull Board — `/admin/queues`, health — `/health`.

### Креды для теста

- Телефон: `998770421939`
- OTP: `000000` (dev bypass активен при `NODE_ENV !== production`)

### Что осталось из roadmap

**Закрыто**: весь P0 (security hardening, refresh-token, audit, notifications через очередь, health, backup/queues, rate-limit Redis) и большая часть P1 (канбан, задачи, должники, рассрочка, домашки, dashboard CEO, Telegram bot inbound + link, админка шаблонов).

**Не сделано**:
- Student/Parent cabinet (web-ЛК, не через Telegram).
- Online payments (Click/Payme).
- 2FA для сотрудников.
- Расширенная BI-аналитика (cohort, retention, LTV).
- AI-фичи.
- Gamification.
- PWA / push notifications.
- Perf: Redis-кеш на горячие списки (courses, students).
- Клонирование Postgres в локаль для dev-скорости.

### Открытые задачи на завтра

1. Прогнать каждую фичу через UI по чеклисту, зафиксировать баги.
2. Проверить Telegram-webhook с ngrok (pinned user-flow: админ создаёт код → отправляет родителю → `/start CODE` → `/balance`).
3. Оценить, стоит ли тратить время на локальный Postgres vs доделать фичи на Neon.

---
