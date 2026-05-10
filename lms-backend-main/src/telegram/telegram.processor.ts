import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOB_NAMES, QUEUE_NAMES } from '../queues/queue.constants';
import {
  TelegramSendDocumentJob,
  TelegramSendMessageJob,
} from './telegram.jobs';

const BOT_API = 'https://api.telegram.org';

/**
 * Foundation Telegram worker.
 *
 * Если `TELEGRAM_BOT_TOKEN` не задан — job помечается `skipped`,
 * без ошибки. Это позволяет включить Notification Hub в dev до того,
 * как реальный бот-токен будет выписан.
 *
 * Когда токен появится — processor реально дергает Bot API.
 * Retry-логика уже обеспечена BullMQ (5 попыток, exp backoff 3s base).
 */
@Processor(QUEUE_NAMES.TELEGRAM, { concurrency: 5 })
export class TelegramProcessor extends WorkerHost {
  private readonly logger = new Logger('TelegramProcessor');

  async process(job: Job): Promise<unknown> {
    if (!this.hasToken()) {
      this.logger.warn(
        `TELEGRAM_BOT_TOKEN not set — skipping ${job.name} (job ${job.id})`,
      );
      return { skipped: true, reason: 'no-token' };
    }

    switch (job.name) {
      case JOB_NAMES.TELEGRAM.SEND_MESSAGE:
        return this.sendMessage(job.data as TelegramSendMessageJob);
      case JOB_NAMES.TELEGRAM.SEND_DOCUMENT:
        return this.sendDocument(job.data as TelegramSendDocumentJob);
      default:
        throw new Error(`Unknown telegram job: ${job.name}`);
    }
  }

  private async sendMessage(data: TelegramSendMessageJob) {
    return this.callBot('sendMessage', {
      chat_id: data.chatId,
      text: data.text,
      parse_mode: data.parseMode,
      disable_web_page_preview: data.disablePreview ?? false,
    });
  }

  private async sendDocument(data: TelegramSendDocumentJob) {
    return this.callBot('sendDocument', {
      chat_id: data.chatId,
      document: data.fileRef,
      caption: data.caption,
    });
  }

  private hasToken(): boolean {
    return !!process.env.TELEGRAM_BOT_TOKEN;
  }

  private async callBot(method: string, body: Record<string, unknown>) {
    const url = `${BOT_API}/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Telegram ${method} ${res.status}: ${detail.slice(0, 200)}`);
    }
    return res.json();
  }
}
