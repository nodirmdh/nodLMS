import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { SMSService } from 'src/sms/sms.service';

@Module({
  imports: [],
  controllers: [TransactionsController],
  providers: [TransactionsService, SMSService],
})
export class TransactionsModule {}
