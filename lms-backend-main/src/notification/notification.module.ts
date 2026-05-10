import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../queues/queue.constants';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationLogService } from './notification-log.service';
import { NotificationTemplateController } from './notification-template.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { shouldHostWorkers } from '../queues/worker-context';

/**
 * Notification Hub — producer + worker + template/log сервисы.
 */
@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.SMS },
      { name: QUEUE_NAMES.TELEGRAM },
    ),
  ],
  providers: [
    NotificationService,
    NotificationTemplateService,
    NotificationLogService,
    ...(shouldHostWorkers() ? [NotificationProcessor] : []),
  ],
  controllers: [NotificationTemplateController],
  exports: [NotificationService, NotificationTemplateService],
})
export class NotificationModule {}
