# QUEUE_ARCHITECTURE.md

Инфраструктурная документация по Redis + BullMQ в `lms-backend-main`. Это **dev-вариант** — цель: поднять фундамент, не переезжая бизнес-логикой. Сюда же будут переехать SMS, Notification Hub, Telegram и генерация отчётов по мере готовности доменов.

Related: `FEATURE_IMPLEMENTATION_MASTERPLAN.md` § 5.4, `FEATURES_ROADMAP.md` этап A, `MODERNIZATION_PLAN.md` этап 7.

---

## 1. Layout

```
lms-backend-main/src/
├── redis/
│   ├── redis.config.ts      # resolve env → ioredis options
│   ├── redis.constants.ts   # DI token
│   ├── redis.service.ts     # ping, lifecycle, shared client
│   └── redis.module.ts      # @Global, exports REDIS_CLIENT + RedisService
└── queues/
    ├── queue.constants.ts   # QUEUE_NAMES, JOB_NAMES, QueueName type
    ├── queue.defaults.ts    # retry / backoff / retention defaults
    ├── queue-monitor.service.ts     # getJobCounts across all queues
    ├── queue-monitor.controller.ts  # GET /queues/stats (CEO/admin)
    └── queue.module.ts      # @Global, BullModule.forRootAsync + registerQueue
```

Существующий `/health` теперь вшивает проверку Redis и доступности очередей.

---

## 2. Queues

Поднято четыре очереди. Все зарегистрированы в `QueueModule` и доступны через `@InjectQueue(<name>)` в любом модуле.

| Queue | Назначение | Consumers (план) | Default attempts | Backoff |
|-------|-----------|------------------|:----------------:|---------|
| `notifications` | Фан-аут Notification Hub. Принимает "domain event → кому/чем отправить", дальше раскидывает в `sms`/`telegram`/email/push. | `NotificationModule` (Wave 2) | 6 | exp, 2s base |
| `sms` | Внешний SMS-gateway (`routee.sayqal.uz`). Отправка одиночек + массовых. | `SMSModule` (миграция из in-sync вызовов) | 6 | exp, 5s base |
| `telegram` | Исходящие в Telegram: бот, mini-app, напоминания. | `TelegramModule` (Wave 2–4) | 5 | exp, 3s base |
| `reports` | Тяжёлая генерация: Excel/PDF отчёты, экспорты списков, scheduled digests. | `ReportModule` / `ExportModule` | 3 | exp, 10s base |

Имена и job-names см. `queue.constants.ts`. Пример продюсера (когда дойдут руки):

```ts
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';

@Injectable()
export class DebtReminderService {
  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notifications: Queue,
  ) {}

  async notifyDebtor(studentId: number) {
    await this.notifications.add(
      JOB_NAMES.NOTIFICATIONS.SEND,
      { template: 'debt-reminder', studentId },
      { jobId: `debt:${studentId}:${Date.now()}` },
    );
  }
}
```

---

## 3. Redis connection

Одна shared ioredis-инстанс обслуживает **приложение** (cache / OTP / ad-hoc). BullMQ под капотом создаёт свои короткоживущие соединения (worker + queue + events).

Причины держать их раздельно:
- BullMQ требует `maxRetriesPerRequest: null` и `enableReadyCheck: false` на своих соединениях. Для обычного кеша это вредно — commands будут висеть бесконечно при обрыве Redis.
- `keyPrefix` у shared-клиента применяется к командам пользователя — BullMQ использует собственный `prefix` ("bull" по умолчанию, меняется через `BULL_PREFIX`).
- Разные стратегии ретраев: у shared — capped 10 попыток, у BullMQ — вечные ретраи (иначе worker падает).

### Env

| Var | Default | Назначение |
|-----|---------|------------|
| `REDIS_URL` | — | Полная строка `redis://:pass@host:port/db`. Побеждает over host/port. |
| `REDIS_HOST` | `127.0.0.1` | |
| `REDIS_PORT` | `6379` | |
| `REDIS_PASSWORD` | — | |
| `REDIS_DB` | `0` | |
| `REDIS_TLS` | `false` | `true` → wrap в TLS. Либо используйте `rediss://`. |
| `REDIS_KEY_PREFIX` | — | Префикс для shared клиента (не для BullMQ). |
| `BULL_PREFIX` | `bull` | Namespace BullMQ. В дев-`.env` выставляется `bull-dev` для изоляции. |

Локально запустить Redis:

```cmd
docker run -d --name lms-redis -p 6379:6379 redis:7-alpine
```

Если Redis выключен — приложение **всё равно поднимется**. `/health` вернёт `status: degraded` + причину, а любые попытки отправки в очередь упадут c понятной ошибкой. Это осознанное решение dev-режима: падение Redis не должно валить API на rolling restart.

---

## 4. Retry logic

`BASE_JOB_DEFAULTS` (см. `queue.defaults.ts`):

```
attempts: 5
backoff:  { type: 'exponential', delay: 2000 } → 2s, 4s, 8s, 16s, 32s
removeOnComplete: { age: 24h, count: 1000 }
removeOnFail:     { age:  7d }
```

Per-queue overrides:

| Queue | attempts | base delay | Почему |
|-------|:--------:|:----------:|--------|
| `sms` | 6 | 5 000 ms | SMS-шлюз часто отдаёт 5xx на первом запросе — чуть дольше ждём. |
| `notifications` | 6 | 2 000 ms | Fan-out операция, дешевле повторить. |
| `telegram` | 5 | 3 000 ms | Bot API стабильный, но у mini-app бывают сетевые глюки. |
| `reports` | 3 | 10 000 ms | Падение обычно детерминированное (нет данных, кривой шаблон). Больше ретраев не поможет. |

Failed job после всех попыток остаётся в `failed`-наборе 7 дней → доступен через BullMQ API для retry. Completed job живёт 24 ч или 1000 последних (по первому пределу).

### Идемпотентность

BullMQ даёт `jobId` — если явно задать, повторный `add()` с тем же id не создаёт дубликат. Шаблон для будущих продюсеров: `"<domain>:<entity>:<hash>"`, например `"sms:debt-reminder:student-42:2025-11-17"`. Это защищает от "cron выполнился дважды на двух инстансах".

---

## 5. Workers

**Пока нет.** Инфраструктура подготовлена, каждый feature-модуль должен сам завести свой `@Processor(QUEUE_NAMES.xxx)` класс, когда бизнес-логика переедет. Пример:

```ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';

@Processor(QUEUE_NAMES.SMS, { concurrency: 5 })
export class SmsProcessor extends WorkerHost {
  async process(job: Job) {
    switch (job.name) {
      case JOB_NAMES.SMS.SEND: {
        // вызов смс-шлюза
        return;
      }
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  }
}
```

### Concurrency guidance (стартовые значения)

| Queue | Concurrency | Комментарий |
|-------|:-----------:|-------------|
| `sms` | 3–5 | Внешний rate-limit шлюза. Не идти выше без согласования с провайдером. |
| `notifications` | 10 | Лёгкая fan-out работа. |
| `telegram` | 5 | Telegram API лимит — 30 msg/sec в один chat, 1 msg/sec в разных chat. Worker сам не упирается, но токен может. |
| `reports` | 1–2 | PDF/Excel генерация CPU-bound. |

---

## 6. Monitoring foundation

`GET /queues/stats` (роли `CEO`/`admin`) возвращает:

```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "queues": [
    {
      "name": "notifications",
      "paused": false,
      "reachable": true,
      "counts": {
        "waiting": 0, "active": 0, "completed": 0,
        "failed": 0, "delayed": 0, "prioritized": 0, "waitingChildren": 0
      }
    }
  ]
}
```

`/health` расширен полями `services.redis`, `services.redisLatencyMs`, `services.queues`.

Следующие шаги по мониторингу (не в этой итерации):
- Prometheus exporter (`bullmq-prometheus` либо собственный Counter по QueueEvents).
- Sentry breadcrumbs / tags `queue=...`, `job=...` при переходе на реальные worker'ы.

### Bull Board

Поднят на `GET /admin/queues` (см. `src/queues/bull-board.setup.ts`).

- В dev — открытый доступ.
- В prod — подключается только если заданы `SWAGGER_USER`/`SWAGGER_PASSWORD`. Защищён тем же basic-auth middleware, что и Swagger.
- `/admin/queues` добавлен в `AuthMiddleware.exclude` в `AppModule` — UI не требует Bearer-токена.
- Видно все четыре очереди: jobs по статусам, payload, retry history, logs, ручной retry/remove.

---

## 7. Scaling strategy

Текущее состояние — single-process dev. Финальная цель:

| Этап | Что | Эффект |
|------|-----|--------|
| 1. Сейчас | Producers + workers в одном Nest-процессе. Redis рядом в Docker. | Разработка, low-traffic. |
| 2. Wave 2 | Producers в API-процессе, workers остаются там же, но запускаются через `@Processor` с осознанной `concurrency`. Cron вынесен в очередь (`notifications.dispatch-scheduled`), больше не блокирует HTTP. | Рассылки перестают тормозить запросы пользователей. |
| 3. Scale-out | Отдельный entrypoint `src/worker.ts`, поднимается как отдельный Render service / Docker container с тем же кодом, но без HTTP-сервера. API-процесс только producer. | Горизонтально масштабируем воркеры независимо от API. Пример: 2 API-инстанса + 1 reports-инстанс + 1 sms/telegram-инстанс. |
| 4. Distributed lock для cron | `@nestjs/schedule` в API-процессе размножится при нескольких API-pod'ах. Надо либо (a) оставить `ScheduleModule` только в worker-процессе, либо (b) обернуть cron в `redis-semaphore` / BullMQ `repeat`. Предпочтительно (b): `queue.add(..., { repeat: { cron: '0 1 10 * *' } })` — BullMQ гарантирует ровно один запуск по cron-ключу. | Устраняем дубликаты "начислить зарплату" при multi-instance. |
| 5. Multi-tenant | `BULL_PREFIX` per-tenant (или Redis `db` per-tenant). BullMQ сам ничего не знает о tenant'ах. | Изоляция очередей между клиентами SaaS. |

### Разделение процессов (план будущего `worker.ts`)

```ts
// lms-backend-main/src/worker.ts
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
}
bootstrap();
```

`WorkerModule` импортирует `PrismaModule`, `RedisModule`, `QueueModule` и процессоры — без контроллеров. Дев-скрипт в `package.json`: `"start:worker": "nest start --entryFile worker"`.

---

## 8. Future usage

### Notification Hub (P0)
`NotificationModule.send({ channel, recipient, templateCode, variables })` кладёт задачу в `notifications`. Worker резолвит шаблон, рендерит, диспатчит в `sms` или `telegram`. Это заменит прямой вызов `SMSService.sendAuthSMS` из `AuthService`.

### OTP (Wave 1)
Сейчас OTP в `CacheModule`/in-memory → **не переживает multi-instance**. Следующая итерация — перевести на `RedisService.client.set(`otp:${phone}`, code, 'EX', 900)`. Уже подключено, осталось прописать миграцию `AuthService`.

### Rate limiting для auth
`@nestjs/throttler` работает in-memory. Для multi-instance добавим `@nest-lab/throttler-storage-redis` и будем считать лимиты по IP глобально через тот же `REDIS_CLIENT`.

### Scheduled notifications
Напоминания об оплате за 3/1 день (из `FEATURES_ROADMAP.md` §7.3) реализуются как `queue.add(name, data, { delay: msUntilTarget })`. Или `{ repeat: { cron } }` для ежедневных.

### Webhook retry для платежей
Click/Payme (Wave 4) шлют webhook'и. После валидации сразу кладём payload в очередь (`payments` — добавится отдельно) и отвечаем 200. Worker выполняет бизнес-обработку с атомарной БД-транзакцией и ретраями при неудаче — не зависим от дрожжания внешнего провайдера.

### AI / reports
LLM-запросы и batch-инференс (`FEATURE_IMPLEMENTATION_MASTERPLAN.md` §8) идут в `reports`-класс очередей (низкая concurrency, большие таймауты) или получают свою отдельную очередь `ai` по мере роста объёма.

---

## 9. Операционные заметки

- **Dead-letter queue** — BullMQ не имеет нативного DLQ. Альтернатива: слушаем `QueueEvents.failed`, если `attemptsMade >= attempts`, кладём job в отдельную очередь `<name>-dlq`. Добавим при первой же утере сообщения.
- **Backpressure** — если `waiting` растёт быстрее, чем worker успевает, это первый сигнал: либо увеличить concurrency, либо добавить инстанс воркера. `/queues/stats` — точка наблюдения.
- **Bulk enqueue** — для массовых рассылок используем `queue.addBulk([...])`: одна round-trip вместо N.
- **Graceful shutdown** — `@nestjs/bullmq` сам вызывает `worker.close()` на `onModuleDestroy`. Важно в worker-процессе: `app.enableShutdownHooks()`, иначе job в `active` останется и перевыдастся в другой worker (что обычно норм, если логика идемпотентна).
- **Мониторинг на проде (когда туда поедем)** — связать `QueueEvents` с Sentry/Logtail: `failed`, `stalled` события → alert. Redis latency — уже в `/health`.

---

## 10. Что сделано / что нет

Сделано сейчас:
- RedisModule + shared ioredis client (lazy-connect).
- QueueModule + 6 очередей (notifications/sms/telegram/reports/scheduler/dlq) с дефолтными retry/backoff.
- `QueueMonitorService` + `GET /queues/stats` (CEO/admin).
- `/health` расширен Redis и queues.
- Env-валидация: `REDIS_*`, `BULL_PREFIX`, `DIRECT_URL`, `REFRESH_TOKEN_TTL_DAYS`, `NOTIFY_VIA_QUEUE`, `SCHEDULER_VIA_QUEUE`, `WORKERS_IN_API`.
- `.env` / `.env.example` заполнены.
- **OTP в Redis** (`OtpService`, ключ `otp:<phone>`, TTL 900s, с in-memory fallback).
- **SmsProcessor** — concurrency 3, dry-run если нет SMS_USERNAME/SMS_SECRET_KEY.
- **SMSService** теперь producer + legacy-sync методы.
- **NotificationModule** — producer + worker + templates + log:
  - `NotificationService.sendFromTemplate(code, channel, recipient, variables, locale?)`.
  - `NotificationTemplateService.render()` + `{{ dotted.path }}` renderer.
  - `NotificationLogService`: `queued → sent / failed / skipped`.
  - Seed-скрипт засеивает 5 шаблонов.
  - **CRUD API** для шаблонов: `GET/POST/PATCH/DELETE /admin/notifications/templates` + preview-эндпоинт. Роли CEO/admin. Изменения аудируются через `@Audit`.
- **TelegramProcessor** — foundation worker, concurrency 5, skipped без `TELEGRAM_BOT_TOKEN`.
- `AuthService` без `Scope.REQUEST`, `getMe()` через `@CurrentUser`, auth-эндпоинты под `@Throttle`.
- **Prisma миграция `wave1_infra`** — `notification_templates`, `notification_logs`, `audit_logs`, `refresh_tokens` + индексы на hot-path.
- **Refresh-token flow**: `/auth/refresh`, `/auth/logout`, `/auth/logout-all`. Single-use rotation.
- **AuditModule**: `@Audit({ action, entity })` + `AuditInterceptor`. Примеры: транзакции, шаблоны уведомлений.
- **Bull Board UI** на `/admin/queues`.
- **NOTIFY_VIA_QUEUE** feature flag — финансовые SMS идут через очередь, sms-рассылка вынесена из `$transaction` в обоих путях.
- **SchedulerModule** + BullMQ repeat для cron'ов.
- **Worker entrypoint** `src/worker.ts` + `WorkerModule`. Скрипты `npm run start:worker` / `start:worker:prod`.
- **`shouldHostWorkers()`** — условная регистрация `@Processor`-провайдеров.
- **Dead-letter queue**: отдельная очередь `dlq`. `DlqService` слушает `QueueEvents.failed` на всех рабочих очередях и кладёт окончательно упавшие job'ы в DLQ. Админский API: `GET /admin/queues/dlq`, `POST /admin/queues/dlq/:id/redrive`, `POST /admin/queues/dlq/:id/drop`.
- **Rate-limit через Redis**: `RedisThrottlerStorage` реализует `ThrottlerStorage` из `@nestjs/throttler` v5. Счётчики живут в Redis (ключ `throttle:<name>:<tracker>`), лимиты работают согласованно между несколькими инстансами API. Фоллбек на in-memory Map при сбое Redis.
- **Reports worker** (`src/reports`): `ReportsProcessor` генерит Excel через ExcelJS, кладёт base64 в Redis (`report:result:<jobId>`, TTL 1 час). Producer: `POST /admin/reports`. Статус: `GET /admin/reports/:jobId/status`. Скачивание: `GET /admin/reports/:jobId/download`. Первый kind: `transactions.excel`. Дополнительно: на `POST /transactions/export.xlsx` появился экспорт-shortcut (под ролями CEO/admin), дергающий ту же очередь.
- **Sentry**: `initSentry()` вызывается в bootstrap API и worker'а. Глобальный `SentryExceptionFilter` (заменил `AllExceptionsFilter`) форвардит 5xx и unknown ошибки в Sentry с контекстом (method, url, userId, ip, userAgent). 4xx HttpException не шлём. Выключается отсутствием `SENTRY_DSN`.

Не сделано (намеренно, идёт позже):
- Telegram inbound (webhook, mini-app auth, `TelegramLink` таблица).
- Расширение kind для reports (students.excel, debtors.excel, PDF).
- Расширенный diff-capture в Audit (before/after); сейчас пишется только request.body.
- Удаление `@nestjs/schedule` + `TasksService` (оставим, пока не переведены все cron'ы).
- Prometheus exporter.
