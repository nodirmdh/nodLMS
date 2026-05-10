import { NotificationChannel } from '@prisma/client';

/**
 * Shape всего, что мы кладём в очередь `notifications`. Worker дальше
 * решает, как это превратить в SMS/Telegram job.
 *
 * Поле `logId` проставляется продюсером (`NotificationService`) ПОСЛЕ
 * записи строки в `notification_logs`. Worker обновляет её status.
 */
export interface NotificationSendJob {
  channel: NotificationChannel;
  recipient: string;
  text: string;
  subject?: string | null;
  templateId?: number | null;
  logId?: number | null;
  meta?: Record<string, unknown>;
}

export { NotificationChannel };
