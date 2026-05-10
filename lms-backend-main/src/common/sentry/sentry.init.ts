import * as Sentry from '@sentry/node';
import { Logger } from '@nestjs/common';

const logger = new Logger('Sentry');

/**
 * Инициализация Sentry. Должна быть вызвана до создания Nest-приложения.
 * При отсутствии SENTRY_DSN — не делает ничего (в dev можно без него).
 *
 * Параметры через env:
 *   SENTRY_DSN            — адрес DSN из Sentry проекта.
 *   SENTRY_ENVIRONMENT    — dev/staging/production. Default = NODE_ENV.
 *   SENTRY_RELEASE        — версия/коммит. Оптинальный.
 *   SENTRY_TRACES_RATE    — sample rate для performance, default 0 (off).
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) {
    logger.log('SENTRY_DSN not set — Sentry disabled.');
    return false;
  }

  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || undefined,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_RATE ?? 0),
    // В dev шлём всё. В проде можно добавить фильтры через beforeSend.
  });

  logger.log('Sentry initialized.');
  return true;
}

export { Sentry };
