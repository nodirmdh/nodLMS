import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { NotificationStatus } from '@prisma/client';
import { JOB_NAMES, QUEUE_NAMES } from '../queues/queue.constants';
import { NotificationSendJob } from './notification.types';
import { NotificationLogService } from './notification-log.service';

/**
 * Фан-аут worker: `notifications` → `sms` | `telegram` | `email` | `push`.
 *
 * Реализованы sms и telegram. Для email/push — лог `skipped`.
 * Worker обновляет NotificationLog.status после диспатча.
 */
@Processor(QUEUE_NAMES.NOTIFICATIONS, { concurrency: 10 })
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger('NotificationProcessor');

  constructor(
    @InjectQueue(QUEUE_NAMES.SMS) private readonly smsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.TELEGRAM) private readonly telegramQueue: Queue,
    private readonly logs: NotificationLogService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    if (job.name !== JOB_NAMES.NOTIFICATIONS.SEND) {
      throw new Error(`Unknown notifications job: ${job.name}`);
    }

    const data = job.data as NotificationSendJob;

    try {
      switch (data.channel) {
        case 'sms':
          await this.smsQueue.add(JOB_NAMES.SMS.SEND, {
            phone: data.recipient,
            text: data.text,
          });
          await this.logs.markStatus(
            data.logId,
            NotificationStatus.sent,
            { sentAt: new Date() },
          );
          return { dispatched: 'sms' };

        case 'telegram':
          await this.telegramQueue.add(JOB_NAMES.TELEGRAM.SEND_MESSAGE, {
            chatId: data.recipient,
            text: data.text,
          });
          await this.logs.markStatus(
            data.logId,
            NotificationStatus.sent,
            { sentAt: new Date() },
          );
          return { dispatched: 'telegram' };

        case 'email':
        case 'push':
          this.logger.warn(
            `channel ${data.channel} not wired yet; skipping (recipient=${data.recipient})`,
          );
          await this.logs.markStatus(data.logId, NotificationStatus.skipped, {
            error: `channel ${data.channel} provider not configured`,
          });
          return { dispatched: 'skipped', channel: data.channel };

        default:
          throw new Error(`Unsupported channel: ${data.channel}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.logs.markStatus(data.logId, NotificationStatus.failed, {
        error: message,
      });
      throw err; // BullMQ обработает retry
    }
  }
}
