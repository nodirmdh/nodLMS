import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { SMSModule } from 'src/sms/sms.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ReportsModule } from 'src/reports/reports.module';

@Module({
  imports: [SMSModule, NotificationModule, ReportsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
