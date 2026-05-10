import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Журнал отправок.
 *
 * Fire-and-forget: если запись в БД упала, мы логируем warn и не валим
 * основной workflow. Отправка уже произошла (или будет ретрайнута
 * BullMQ), потеря лога не должна ломать бизнес.
 */
@Injectable()
export class NotificationLogService {
  private readonly logger = new Logger('NotificationLogService');

  constructor(private readonly prisma: PrismaService) {}

  async recordQueued(params: {
    templateId?: number | null;
    channel: NotificationChannel;
    recipient: string;
    jobId?: string | null;
    payload?: Prisma.InputJsonValue | null;
  }) {
    try {
      return await this.prisma.notificationLog.create({
        data: {
          templateId: params.templateId ?? null,
          channel: params.channel,
          recipient: params.recipient,
          status: NotificationStatus.queued,
          jobId: params.jobId ?? null,
          payload: params.payload ?? Prisma.DbNull,
        },
      });
    } catch (err) {
      this.logger.warn(
        `log recordQueued failed: ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }

  async markStatus(
    logId: number | null | undefined,
    status: NotificationStatus,
    fields: { error?: string; sentAt?: Date; deliveredAt?: Date } = {},
  ) {
    if (!logId) return;
    try {
      await this.prisma.notificationLog.update({
        where: { id: logId },
        data: {
          status,
          error: fields.error ?? null,
          sentAt: fields.sentAt ?? undefined,
          deliveredAt: fields.deliveredAt ?? undefined,
        },
      });
    } catch (err) {
      this.logger.warn(
        `log markStatus(${status}) failed: ${
          err instanceof Error ? err.message : err
        }`,
      );
    }
  }
}
