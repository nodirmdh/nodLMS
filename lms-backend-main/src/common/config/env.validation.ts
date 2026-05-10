import * as Joi from 'joi';

/**
 * Validation schema for environment variables.
 * Applied globally through ConfigModule.forRoot({ validationSchema }).
 * Required values throw at bootstrap, unknown are allowed.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(3002),

  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  DIRECT_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .optional()
    .allow(''),
  ACCESS_TOKEN_SECRET: Joi.string().min(16).required(),

  CORS_ORIGIN: Joi.string().optional().allow(''),

  // SMS gateway (optional for dev, but a warning is logged if missing in prod)
  SMS_USERNAME: Joi.string().optional().allow(''),
  SMS_SECRET_KEY: Joi.string().optional().allow(''),

  // Telegram (future-use, optional)
  TELEGRAM_BOT_TOKEN: Joi.string().optional().allow(''),
  TELEGRAM_WEBHOOK_SECRET: Joi.string().optional().allow(''),

  // OTP bypass for test/dev environments
  DEV_OTP_BYPASS: Joi.string().valid('true', 'false').optional(),

  // Swagger basic auth (optional; if set — docs require auth in production)
  SWAGGER_USER: Joi.string().optional().allow(''),
  SWAGGER_PASSWORD: Joi.string().optional().allow(''),

  // === Redis / BullMQ (optional in dev, required in prod once real
  // consumers land). App boots without Redis — health endpoint surfaces
  // status. ===
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .optional()
    .allow(''),
  REDIS_HOST: Joi.string().optional().allow(''),
  REDIS_PORT: Joi.number().optional(),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_DB: Joi.number().integer().min(0).optional(),
  REDIS_TLS: Joi.string().valid('true', 'false').optional(),
  REDIS_KEY_PREFIX: Joi.string().optional().allow(''),

  // BullMQ namespace prefix. Default "bull". Override in test envs to
  // avoid collisions between parallel runs.
  BULL_PREFIX: Joi.string().optional().allow(''),

  // Refresh-token TTL (days). Default 30.
  REFRESH_TOKEN_TTL_DAYS: Joi.number().integer().min(1).optional(),

  // Feature flag: если true — финансовые нотификации идут через
  // NotificationService (очередь + шаблоны). Если false (по умолчанию)
  // — остаётся старый синхронный путь через SMSService.
  NOTIFY_VIA_QUEUE: Joi.string().valid('true', 'false').optional(),

  // Feature flag: если true — периодические задачи (closeGroups,
  // processSalaries) регистрируются как BullMQ repeat-jobs вместо
  // @nestjs/schedule в API-процессе. Нужно для multi-instance deploy.
  SCHEDULER_VIA_QUEUE: Joi.string().valid('true', 'false').optional(),

  // Feature flag: если false — в API-процессе НЕ поднимаются @Processor'ы.
  // Имеет смысл выставить false после деплоя отдельного worker-процесса,
  // чтобы jobs обрабатывались только там. Default: true (dev / single-box).
  WORKERS_IN_API: Joi.string().valid('true', 'false').optional(),

  // Sentry (optional). При отсутствии DSN — Sentry выключен.
  SENTRY_DSN: Joi.string().uri().optional().allow(''),
  SENTRY_ENVIRONMENT: Joi.string().optional().allow(''),
  SENTRY_RELEASE: Joi.string().optional().allow(''),
  SENTRY_TRACES_RATE: Joi.number().min(0).max(1).optional(),
}).unknown(true);
