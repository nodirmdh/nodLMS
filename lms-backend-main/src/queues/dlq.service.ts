import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import { ALL_QUEUE_NAMES, QUEUE_NAMES, QueueName } from './queue.constants';
import { QueueMonitorService } from './queue-monitor.service';
import { buildBullConnectionOptions, resolveRedisConfig } from '../redis/redis.config';

/**
 * Dead-letter queue.
 *
 * BullMQ не имеет встроенного DLQ. Мы слушаем `QueueEvents.failed` на
 * всех производственных очередях и, если у job'а не осталось попыток
 * (`attemptsMade >= opts.attempts`), кладём копию в очередь `dlq`.
 *
 * Что лежит в dlq-задаче:
 *   { originQueue, originJobId, originName, data, failedReason, attemptsMade, movedAt }
 *
 * Ретрай из DLQ:
 *   - либо через Bull Board (job там виден, можно кликнуть retry);
 *   - либо через `DlqService.redrive(originJobId)` — кладёт payload
 *     обратно в исходную очередь (реализация — отдельный тикет).
 */
@Injectable()
export class DlqService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('DlqService');
  private readonly listeners: QueueEvents[] = [];

  /**
   * Очереди, с которых мы ловим failed. Сам `dlq` не слушаем, scheduler
   * не слушаем (он идемпотентный, одна попытка — ок).
   */
  private readonly monitored: QueueName[] = ALL_QUEUE_NAMES.filter(
    (n) => n !== QUEUE_NAMES.DLQ && n !== QUEUE_NAMES.SCHEDULER,
  );

  constructor(
    private readonly monitor: QueueMonitorService,
    @InjectQueue(QUEUE_NAMES.DLQ) private readonly dlq: Queue,
  ) {}

  async onApplicationBootstrap() {
    const prefix = resolveRedisConfig().bullPrefix;
    const connection = buildBullConnectionOptions();

    for (const name of this.monitored) {
      const events = new QueueEvents(name, { connection, prefix });

      events.on('failed', async ({ jobId, failedReason }) => {
        try {
          const originQueue = this.monitor.getQueue(name);
          const job = await originQueue.getJob(jobId);
          if (!job) return;

          const max = job.opts?.attempts ?? 1;
          const attemptsMade = job.attemptsMade ?? 0;
          if (attemptsMade < max) return; // ещё будут ретраи

          await this.dlq.add(
            `dlq:${name}`,
            {
              originQueue: name,
              originJobId: String(jobId),
              originName: job.name,
              data: job.data,
              failedReason,
              attemptsMade,
              movedAt: new Date().toISOString(),
            },
            { jobId: `dlq:${name}:${jobId}` },
          );
          this.logger.warn(
            `moved to DLQ: ${name}/${job.name}#${jobId} (${failedReason})`,
          );
        } catch (err) {
          this.logger.warn(
            `failed to enqueue DLQ for ${name}#${jobId}: ${
              err instanceof Error ? err.message : err
            }`,
          );
        }
      });

      this.listeners.push(events);
    }

    this.logger.log(`DLQ listeners up on: ${this.monitored.join(', ')}`);
  }

  async onApplicationShutdown() {
    await Promise.all(
      this.listeners.map((l) => l.close().catch(() => void 0)),
    );
  }
}
