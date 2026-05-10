import { Module } from '@nestjs/common';
import { PaymentPlansService } from './payment-plans.service';
import { PaymentPlansController } from './payment-plans.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule],
  providers: [PaymentPlansService],
  controllers: [PaymentPlansController],
  exports: [PaymentPlansService],
})
export class PaymentPlansModule {}
