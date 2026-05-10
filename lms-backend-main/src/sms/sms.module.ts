import { Module } from '@nestjs/common';
import { SMSService } from './sms.service';
import { SmsController } from './sms.controller';

@Module({
  providers: [SMSService],
  exports: [SMSService],
  controllers: [SmsController],
})
export class SMSModule {}
