import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../queues/queue.constants';
import { TelegramProcessor } from './telegram.processor';
import { TelegramController } from './telegram.controller';
import { TelegramLinkService } from './telegram-link.service';
import { TelegramWebhookService } from './telegram-webhook.service';
import { shouldHostWorkers } from '../queues/worker-context';

/**
 * TelegramModule.
 *
 * Публичная сторона:
 *   - `POST /telegram/webhook` — входящие updates от Telegram.
 *   - `POST /telegram/link-codes` — генерация кода привязки (CEO/admin/manager).
 *
 * Рабочая сторона:
 *   - `TelegramProcessor` (за флагом shouldHostWorkers) — исходящие сообщения.
 */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.TELEGRAM })],
  controllers: [TelegramController],
  providers: [
    TelegramLinkService,
    TelegramWebhookService,
    ...(shouldHostWorkers() ? [TelegramProcessor] : []),
  ],
  exports: [TelegramLinkService],
})
export class TelegramModule {}
