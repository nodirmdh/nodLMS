import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../queues/queue.constants';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsProcessor } from './reports.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { shouldHostWorkers } from '../queues/worker-context';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.REPORTS }),
  ],
  providers: [
    ReportsService,
    ...(shouldHostWorkers() ? [ReportsProcessor] : []),
  ],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
