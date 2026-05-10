import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../queues/queue.constants';
import { SchedulerProcessor } from './scheduler.processor';
import { SchedulerBootstrap } from './scheduler.bootstrap';
import { shouldHostWorkers } from '../queues/worker-context';

/**
 * SchedulerModule — BullMQ-based альтернатива @nestjs/schedule.
 *
 * Bootstrap регистрирует repeat-jobs при `SCHEDULER_VIA_QUEUE=true`.
 * Processor поднимается только если shouldHostWorkers() === true.
 */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.SCHEDULER })],
  providers: [
    SchedulerBootstrap,
    ...(shouldHostWorkers() ? [SchedulerProcessor] : []),
  ],
})
export class SchedulerModule {}
