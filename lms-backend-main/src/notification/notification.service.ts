import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationChannel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JOB_NAMES, QUEUE_NAMES } from '../queues/queue.constants';
import { NotificationSendJob } from './notification.types';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationLogService } from './notification-log.service';

/**
 * Producer-фасад Notification Hub.
 *
 * Пути:
 *   - send(job)                       — отправить уже готовый текст.
 *   - sendFromTemplate(code, ...)     — отрендерить шаблон из БД и отправить.
 *   - sendBulk(jobs)                  — массово.
 *
 * Под капотом каждый send пишет `NotificationLog` со статусом `queued`,
 * кладёт job в `notifications` queue, проставляет в лог `jobId`.
 * Worker дальше обновит status на `sent` / `failed` / `skipped`.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger('NotificationService');

  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly queue: Queue,
    private readonly prisma: PrismaService,
    private readonly templates: NotificationTemplateService,
    private readonly logs: NotificationLogService,
  ) {}

  async send(input: Omit<NotificationSendJob, 'logId'>) {
    // Сначала пишем лог — так мы можем подставить logId в payload задачи.
    const log = await this.logs.recordQueued({
      templateId: input.templateId ?? null,
      channel: input.channel,
      recipient: input.recipient,
      payload: {
        text: input.text,
        subject: input.subject ?? null,
        meta: (input.meta ?? null) as unknown as object,
      },
    });

    const data: NotificationSendJob = { ...input, logId: log?.id ?? null };
    const job = await this.queue.add(JOB_NAMES.NOTIFICATIONS.SEND, data);

    // Обновим jobId в логе (best-effort, отдельно от статуса).
    if (log?.id && job?.id) {
      try {
        await this.prisma.notificationLog.update({
          where: { id: log.id },
          data: { jobId: String(job.id) },
        });
      } catch {
        /* ignore */
      }
    }

    return { logId: log?.id ?? null, jobId: job?.id ?? null };
  }

  async sendFromTemplate(params: {
    code: string;
    channel: NotificationChannel;
    recipient: string;
    variables?: Record<string, unknown>;
    locale?: string;
    meta?: Record<string, unknown>;
  }) {
    const rendered = await this.templates.render(
      params.code,
      params.channel,
      params.variables ?? {},
      params.locale ?? 'ru',
    );
    return this.send({
      channel: params.channel,
      recipient: params.recipient,
      text: rendered.body,
      subject: rendered.subject,
      templateId: rendered.templateId,
      meta: {
        code: params.code,
        locale: params.locale ?? 'ru',
        ...(params.meta ?? {}),
      },
    });
  }

  async sendBulk(jobs: Array<Omit<NotificationSendJob, 'logId'>>) {
    if (!jobs.length) return [];
    return Promise.all(jobs.map((j) => this.send(j)));
  }
}
