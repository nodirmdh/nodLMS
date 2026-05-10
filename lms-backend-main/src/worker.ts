import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

// Must be set BEFORE any module is imported that uses shouldHostWorkers()
process.env.IS_WORKER = 'true';

import { initSentry } from './common/sentry/sentry.init';
import { WorkerModule } from './worker.module';

/**
 * Standalone BullMQ worker entrypoint.
 *
 * Жизненный цикл:
 *  - Поднимается как `ApplicationContext` (без HTTP-сервера).
 *  - NestJS дожидается, пока каждый `@Processor` поднимет Worker.
 *  - `enableShutdownHooks` закрывает их в правильном порядке при SIGINT/SIGTERM.
 *
 * Деплой:
 *  - Render / Docker: отдельный сервис с командой `node dist/src/worker`.
 *  - В dev: `npm run start:worker`.
 */
async function bootstrap() {
  initSentry();

  const logger = new Logger('Worker');
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: false,
  });
  app.enableShutdownHooks();
  logger.log(
    `Worker started [NODE_ENV=${process.env.NODE_ENV ?? 'development'}]`,
  );

  const shutdown = async (signal: string) => {
    logger.warn(`Received ${signal} — shutting down…`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Worker crashed at bootstrap', err);
  process.exit(1);
});
