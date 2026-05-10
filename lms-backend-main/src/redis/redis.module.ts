import { Global, Module, Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';
import { buildRedisClientOptions } from './redis.config';

const redisClientProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const options = buildRedisClientOptions();
    const client = new Redis(options);
    // ioredis.lazyConnect means we connect from RedisService.onModuleInit.
    // Attach an early `error` listener so unhandled errors don't crash the
    // process when Redis is unavailable during local dev.
    client.on('error', () => {
      /* logged by RedisService */
    });
    return client;
  },
};

/**
 * Global Redis infrastructure.
 *
 * Exports:
 *   - REDIS_CLIENT (ioredis.Redis) — for ad-hoc cache/OTP consumers.
 *   - RedisService                — wrapper with ping() for healthcheck.
 *
 * BullMQ does NOT reuse this client — it creates its own connections
 * (see QueueModule).
 */
@Global()
@Module({
  providers: [redisClientProvider, RedisService],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
