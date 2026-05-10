import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { QueueMonitorService } from '../queues/queue-monitor.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly queues: QueueMonitorService,
  ) {}

  @Get()
  async check() {
    // Database
    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }

    // Redis
    const redisPing = await this.redis.ping();

    // Queues — lightweight: we trust Redis ping; still verify queues respond.
    let queuesOk = false;
    if (redisPing.ok) {
      queuesOk = await this.queues.allReachable();
    }

    const overallOk = dbOk && redisPing.ok && queuesOk;

    return {
      status: overallOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbOk ? 'up' : 'down',
        redis: redisPing.ok ? 'up' : 'down',
        redisLatencyMs: redisPing.latencyMs,
        redisError: redisPing.error,
        queues: queuesOk ? 'up' : 'down',
      },
    };
  }
}
