import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOB_NAMES, QUEUE_NAMES } from '../queues/queue.constants';

/**
 * Регистрирует BullMQ repeat-jobs при старте приложения.
 *
 * Работает только при `SCHEDULER_VIA_QUEUE=true`. По jobId/pattern
 * BullMQ дедуплицирует, так что перезапуск не плодит дубли.
 *
 * Cron-строки совпадают с прежними @Cron'ами из TasksService, чтобы
 * поведение не менялось:
 *   - closeCompletedGroups: 23:59:59 каждый день
 *   - processSalaries:       01:00 10-го числа
 */
@Injectable()
export class SchedulerBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger('SchedulerBootstrap');

  constructor(
    @InjectQueue(QUEUE_NAMES.SCHEDULER) private readonly queue: Queue,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.SCHEDULER_VIA_QUEUE !== 'true') {
      this.logger.log(
        'SCHEDULER_VIA_QUEUE != true — skipping BullMQ repeat registration',
      );
      return;
    }

    try {
      await Promise.race([
        this.queue.add(
          JOB_NAMES.SCHEDULER.CLOSE_COMPLETED_GROUPS,
          {},
          {
            repeat: { pattern: '59 59 23 * * *' },
            jobId: 'repeat:close-completed-groups',
          },
        ),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('BullMQ add() timed out after 5s')),
            5_000,
          ),
        ),
      ]);

      await this.queue.add(
        JOB_NAMES.SCHEDULER.PROCESS_SALARIES,
        {},
        {
          repeat: { pattern: '0 1 10 * *' },
          jobId: 'repeat:process-salaries',
        },
      );

      this.logger.log('registered repeat jobs: close-groups, process-salaries');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `skipping repeat-job registration (Redis unreachable?): ${message}`,
      );
    }
  }
}
