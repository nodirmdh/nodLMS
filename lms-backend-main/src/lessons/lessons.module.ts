import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { SMSModule } from 'src/sms/sms.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [SMSModule, NotificationModule],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonsModule {}
