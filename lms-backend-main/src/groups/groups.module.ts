import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { LessonsService } from 'src/lessons/lessons.service';
import { SMSModule } from 'src/sms/sms.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [SMSModule, NotificationModule],
  providers: [LessonsService, GroupsService],
  controllers: [GroupsController],
})
export class GroupsModule {}
