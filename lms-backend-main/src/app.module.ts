import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
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
import { TasksService } from './tasks.service';

@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
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
    ScheduleModule.forRoot(),
  ],
  providers: [
    TransactionsService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    TasksService,
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
        { path: '/avatars/:imgPath', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
