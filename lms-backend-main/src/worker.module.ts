import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queues/queue.module';
import { SMSModule } from './sms/sms.module';
import { TelegramModule } from './telegram/telegram.module';
import { NotificationModule } from './notification/notification.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ReportsModule } from './reports/reports.module';
import { envValidationSchema } from './common/config/env.validation';

/**
 * WorkerModule — минимальный NestJS-граф для выделенного worker-процесса.
 *
 * Включает:
 *   - PrismaModule, RedisModule, QueueModule           — инфра.
 *   - SMSModule / NotificationModule / TelegramModule  — с их `@Processor`.
 *   - SchedulerModule                                  — BullMQ repeat.
 *
 * Не включает:
 *   - Контроллеры / Auth / Throttler / Swagger / CORS — это всё задача API-процесса.
 *   - Никаких HTTP-маршрутов.
 *
 * Запуск: `nest start --entryFile worker` или `node dist/src/worker`.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    PrismaModule,
    RedisModule,
    QueueModule,
    SMSModule,
    NotificationModule,
    TelegramModule,
    SchedulerModule,
    ReportsModule,
  ],
})
export class WorkerModule {}
