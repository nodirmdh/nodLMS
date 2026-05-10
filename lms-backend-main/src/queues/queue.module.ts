import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { buildBullConnectionOptions } from '../redis/redis.config';
import { resolveRedisConfig } from '../redis/redis.config';
import { ALL_QUEUE_NAMES, QUEUE_NAMES } from './queue.constants';
import { PER_QUEUE_DEFAULTS } from './queue.defaults';
import { QueueMonitorService } from './queue-monitor.service';
import { QueueMonitorController } from './queue-monitor.controller';
import { DlqService } from './dlq.service';
import { DlqController } from './dlq.controller';
import { shouldHostWorkers } from './worker-context';

/**
 * Infrastructure-only queue module.
 *
 * Registers BullMQ with a shared Redis connection and opens four queues:
 *   - notifications   (fan-out from Notification Hub)
 *   - sms             (external SMS gateway)
 *   - telegram        (bot + mini-app outbound)
 *   - reports         (async Excel/PDF generation)
 *
 * No processors (workers) are wired here yet. Each feature module will
 * provide its own @Processor() when business logic lands.
 *
 * Queues are exported globally so any feature module can `BullModule.
 * registerQueue({ name: ... })` a second time to obtain a typed Queue
 * injection, or inject the Queue directly if the feature is in the same
 * module graph.
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      useFactory: () => {
        const cfg = resolveRedisConfig();
        return {
          connection: buildBullConnectionOptions(),
          prefix: cfg.bullPrefix,
        };
      },
    }),
    BullModule.registerQueue(
      ...ALL_QUEUE_NAMES.map((name) => ({
        name,
        defaultJobOptions: PER_QUEUE_DEFAULTS[name],
      })),
    ),
  ],
  providers: [
    QueueMonitorService,
    ...(shouldHostWorkers() ? [DlqService] : []),
  ],
  controllers: [QueueMonitorController, DlqController],
  exports: [BullModule, QueueMonitorService],
})
export class QueueModule {}

// Re-export well-known names so consumers can:
//   import { QUEUE_NAMES } from '../queues/queue.module';
export { QUEUE_NAMES };
