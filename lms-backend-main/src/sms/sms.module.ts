import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SMSService } from './sms.service';
import { SmsController } from './sms.controller';
import { SmsProcessor } from './sms.processor';
import { QUEUE_NAMES } from '../queues/queue.constants';
import { shouldHostWorkers } from '../queues/worker-context';

/**
 * SMSModule владеет двумя ролями:
 *   - Producer API (SMSService) — его инжектят другие модули.
 *   - Worker (SmsProcessor)     — поднимается только если
 *                                 shouldHostWorkers() === true.
 */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.SMS })],
  providers: [
    SMSService,
    ...(shouldHostWorkers() ? [SmsProcessor] : []),
  ],
  exports: [SMSService],
  controllers: [SmsController],
})
export class SMSModule {}
