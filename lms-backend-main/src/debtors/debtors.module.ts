import { Module } from '@nestjs/common';
import { DebtorsService } from './debtors.service';
import { DebtorsController } from './debtors.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [DebtorsService],
  controllers: [DebtorsController],
})
export class DebtorsModule {}
