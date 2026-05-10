import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { LessonsService } from 'src/lessons/lessons.service';
import { SMSModule } from 'src/sms/sms.module';

@Module({
  imports: [SMSModule],
  providers: [LessonsService, GroupsService],
  controllers: [GroupsController],
})
export class GroupsModule {}
