import { INestApplication, Logger } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { ALL_QUEUE_NAMES } from './queue.constants';
import { QueueMonitorService } from './queue-monitor.service';

const BOARD_PATH = '/admin/queues';

/**
 * Регистрирует Bull Board UI.
 *
 * Dev: `/admin/queues` открыт без auth.
 * Prod: если заданы SWAGGER_USER/SWAGGER_PASSWORD — переиспользуем
 *       тот же basic-auth middleware (не городим отдельный). Если
 *       basic-auth не настроен — в prod UI вообще не поднимаем.
 */
export function registerBullBoard(
  app: INestApplication,
  basicAuthMiddleware?: (req: any, res: any, next: any) => void,
) {
  const logger = new Logger('BullBoard');
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd && !basicAuthMiddleware) {
    logger.log(
      'Bull Board disabled in production (no basic-auth middleware provided).',
    );
    return;
  }

  // Берём уже инициализированные Queue-инстансы прямо из nest DI.
  const monitor = app.get(QueueMonitorService);

  const queues = ALL_QUEUE_NAMES.map((name) => monitor.getQueue(name))
    .filter((q): q is Queue => !!q)
    .map((q) => new BullMQAdapter(q));

  if (!queues.length) {
    logger.warn('No BullMQ queues found — Bull Board not mounted.');
    return;
  }

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(BOARD_PATH);

  createBullBoard({
    queues,
    serverAdapter,
  });

  const http = app.getHttpAdapter().getInstance();
  if (basicAuthMiddleware) {
    http.use(BOARD_PATH, basicAuthMiddleware, serverAdapter.getRouter());
  } else {
    http.use(BOARD_PATH, serverAdapter.getRouter());
  }

  logger.log(
    `Bull Board mounted at ${BOARD_PATH}${isProd ? ' (basic-auth protected)' : ''}`,
  );
}
