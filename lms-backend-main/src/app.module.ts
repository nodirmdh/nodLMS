import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RedisThrottlerStorage } from './common/throttler/redis-throttler.storage';
import { SMSModule } from './sms/sms.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BranchesModule } from './branches/branches.module';
import { CoursesModule } from './courses/courses.module';
import { GroupsModule } from './groups/groups.module';
import { MentorsModule } from './mentors/mentors.module';
import { LeedsModule } from './leeds/leeds.module';
import { StudentsModule } from './students/students.module';
import { LessonsModule } from './lessons/lessons.module';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsModule } from './transactions/transactions.module';
import { FineModule } from './fine/fine.module';
import { BonusModule } from './bonus/bonus.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { RolesGuard } from './auth/guard/role.guard';
import { AvatarModule } from './avatar/avatar.module';
import { ExamModule } from './exam/exam.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronTasksService } from './cron-tasks.service';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queues/queue.module';
import { NotificationModule } from './notification/notification.module';
import { TelegramModule } from './telegram/telegram.module';
import { AuditModule } from './audit/audit.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ReportsModule } from './reports/reports.module';
import { TasksModule } from './tasks/tasks.module';
import { PaymentPlansModule } from './payment-plans/payment-plans.module';
import { HomeworkModule } from './homework/homework.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DebtorsModule } from './debtors/debtors.module';
import { envValidationSchema } from './common/config/env.validation';

@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    // Global rate limiting. Default: 100 req/min per IP.
    // Sensitive endpoints (auth) use tighter limits via @Throttle().
    // Storage: Redis (shared across API instances). Fallback to in-memory
    // when Redis is unreachable — see RedisThrottlerStorage.
    ThrottlerModule.forRootAsync({
      useFactory: (storage: RedisThrottlerStorage) => ({
        throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
        storage,
      }),
      inject: [RedisThrottlerStorage],
    }),
    PrismaModule,
    RedisModule,
    QueueModule,
    AuthModule,
    UsersModule,
    BranchesModule,
    CoursesModule,
    GroupsModule,
    MentorsModule,
    LeedsModule,
    StudentsModule,
    LessonsModule,
    TransactionsModule,
    FineModule,
    BonusModule,
    AvatarModule,
    ExamModule,
    SMSModule,
    NotificationModule,
    TelegramModule,
    AuditModule,
    SchedulerModule,
    ReportsModule,
    TasksModule,
    PaymentPlansModule,
    HomeworkModule,
    DashboardModule,
    DebtorsModule,
    ScheduleModule.forRoot(),
    HealthModule,
  ],
  providers: [
    RedisThrottlerStorage,
    TransactionsService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    CronTasksService,
  ],
  controllers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/auth/login', method: RequestMethod.POST },
        { path: '/auth/confirm', method: RequestMethod.POST },
        { path: '/auth/send-sms', method: RequestMethod.POST },
        { path: '/auth/refresh', method: RequestMethod.POST },
        { path: '/auth/logout', method: RequestMethod.POST },
        { path: '/auth/dev-seed', method: RequestMethod.POST },
        { path: '/avatars/:imgPath', method: RequestMethod.GET },
        { path: '/health', method: RequestMethod.GET },
        { path: '/admin/queues', method: RequestMethod.ALL },
        { path: '/admin/queues/(.*)', method: RequestMethod.ALL },
        { path: '/telegram/webhook', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
