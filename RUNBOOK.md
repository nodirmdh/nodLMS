# RUNBOOK

Как поднять dev-окружение LMS с нуля. Использовать, когда садишься работать в новом сеансе.

---

## 1. Разовый setup

Нужно один раз после `git clone` или смены ветки.

### 1.1 Зависимости

```cmd
:: бэк
cd lms-backend-main
npm install

:: фронт
cd lms-frontend-main
yarn install   :: либо npm install
```

### 1.2 `.env`

В `lms-backend-main/.env` (не коммитим, см. `.env.example`):

```
DATABASE_URL="postgresql://...@...-pooler...neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://...@...neon.tech/neondb?sslmode=require&channel_binding=require"
ACCESS_TOKEN_SECRET="local-dev-secret-change-me"
CORS_ORIGIN="http://localhost:3001"
PORT=3002

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
BULL_PREFIX=bull-dev

NOTIFY_VIA_QUEUE=true
SCHEDULER_VIA_QUEUE=true
WORKERS_IN_API=true

TELEGRAM_BOT_TOKEN=<твой токен>
TELEGRAM_WEBHOOK_SECRET=<любая длинная строка>

# опционально
SENTRY_DSN=
```

В `lms-frontend-main/.env`:

```
VITE_API_URL=http://localhost:3002
VITE_TELEGRAM_BOT_USERNAME=<username бота без @>
```

### 1.3 Миграции БД

Если БД чистая:

```cmd
cd lms-backend-main
npx prisma generate
npx prisma migrate deploy
npm run seed
```

> При работе с Neon может зависнуть на advisory-lock. Обход: прогнать SQL из `prisma/migrations/*/migration.sql` через отдельный скрипт с `$executeRawUnsafe` и прописать запись в `_prisma_migrations` вручную (как делали 10 мая).

---

## 2. Ежедневный запуск

Три окна терминала:

### Терминал 1 — Redis

```cmd
docker start lms-redis
```

> Если контейнера нет: `docker run -d --name lms-redis -p 6379:6379 redis:7-alpine`.

### Терминал 2 — API

```cmd
cd lms-backend-main
npm run start:dev
```

Ждать строку `Application listening on :3002`. API и все воркеры крутятся в одном процессе (пока `WORKERS_IN_API=true`).

### Терминал 3 — фронт

```cmd
cd lms-frontend-main
yarn dev
```

Открыть `http://localhost:3001`.

### Креды для входа

- Телефон: `998770421939`
- Код: `000000` (dev-bypass)

---

## 3. Порты и адреса

| Сервис | URL |
|---|---|
| Фронт | http://localhost:3001 |
| API | http://localhost:3002 |
| Swagger | http://localhost:3002/docs |
| Health-check | http://localhost:3002/health |
| Bull Board | http://localhost:3002/admin/queues |
| Redis | localhost:6379 |

---

## 4. Частые задачи

### Пересидировать шаблоны уведомлений

```cmd
cd lms-backend-main
npm run seed
```

Заведёт 5 базовых шаблонов (auth.otp, debt.reminder, payment.confirmed sms+tg, lesson.reminder).

### Проверить типы / собрать

Бэк:
```cmd
cd lms-backend-main
npx nest build
```

Фронт:
```cmd
cd lms-frontend-main
npx tsc --noEmit
npx vite build
```

### Если «EADDRINUSE 3002»

Кто-то (или hot-reload) не отдал порт:

```powershell
Get-NetTCPConnection -LocalPort 3002 -State Listen | ForEach-Object {
  Stop-Process -Id $_.OwningProcess -Force
}
```

### Telegram webhook

Без публичного URL бот не получит команды. Два варианта:

1. **ngrok**:
   ```cmd
   ngrok http 3002
   curl -F "url=https://xxxxx.ngrok.io/telegram/webhook" -F "secret_token=<TELEGRAM_WEBHOOK_SECRET>" https://api.telegram.org/bot<TOKEN>/setWebhook
   ```

2. Без webhook — inbound-команды в боте работать не будут, но отправка из системы через очередь `telegram` работает.

---

## 5. Где что в коде

- `src/redis/*` — ioredis клиент.
- `src/queues/*` — BullMQ, Bull Board, DLQ, monitor.
- `src/auth/*` — JWT + refresh, OTP, user-cache.
- `src/notification/*` — Hub, шаблоны, лог, processor.
- `src/telegram/*` — webhook, link-codes, inbound commands.
- `src/tasks/*` — задачи менеджера (новый модуль).
- `src/cron-tasks.service.ts` — старый @Cron (no-op при `SCHEDULER_VIA_QUEUE=true`).
- `src/scheduler/*` — BullMQ repeat вместо @Cron.
- `src/reports/*` — Excel экспорт через очередь.
- `src/dashboard/*`, `src/debtors/*`, `src/payment-plans/*`, `src/homework/*` — фичи.
- `src/worker.ts` + `src/worker.module.ts` — отдельный worker entrypoint.

---

## 6. Куда смотреть при проблемах

1. **API не запускается** — проверь Redis (`docker ps`) и `.env` (DATABASE_URL, ACCESS_TOKEN_SECRET).
2. **401 на всех запросах** — refresh-токен истёк или сервер перезапустился без сохранённого user-cache. Перелогинься.
3. **Ошибка в очереди** — открой Bull Board (`/admin/queues`), посмотри failed-задачи. Если упала 5 раз подряд — уехала в DLQ.
4. **Что-то не обновилось** — watch mode мог пропустить файл. Останови API (`Ctrl+C`), запусти заново.
5. **Медленно** — DB latency до Neon ~190 ms на запрос. Холодный старт страницы может быть 2-3 сек, горячий путь ~4-50 ms (после user-cache).

---
