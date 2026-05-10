import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { SMSModule } from 'src/sms/sms.module';
import { SMSService } from 'src/sms/sms.service';

@Module({
  imports: [SMSModule],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonsModule {}
