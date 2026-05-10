import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * RedisModule + QueueModule are registered globally in AppModule, so
 * only Prisma needs an explicit import here.
 */
@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
