import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.constants';

/**
 * Redis-backed storage для `@nestjs/throttler` v5.
 *
 * Почему свой, а не готовый пакет: `@nest-lab/throttler-storage-redis`
 * требует throttler>=6, а проект сейчас на 5.x. Апдейт throttler —
 * отдельный тикет, а rate-limit в кластере нужен уже сейчас.
 *
 * Алгоритм: fixed-window. Ключ `throttle:<name>:<tracker>` инкрементируется
 * с TTL=ttl. Возвращаем `totalHits` + `timeToExpire`, как ожидает интерфейс.
 * В случае проблем с Redis — fallback на in-memory Map, чтобы сайт не лёг.
 *
 * Интерфейс ThrottlerStorage:
 *   increment(key: string, ttl: number): Promise<{ totalHits: number; timeToExpire: number }>
 */
type StorageReturn = { totalHits: number; timeToExpire: number };

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnModuleDestroy {
  private readonly logger = new Logger('RedisThrottlerStorage');
  private readonly fallback = new Map<string, { count: number; expiresAt: number }>();

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(key: string, ttl: number): Promise<StorageReturn> {
    // ttl приходит в ms (throttler v5 считает в ms).
    const ttlSec = Math.ceil(ttl / 1000);

    try {
      const redisKey = `throttle:${key}`;
      // MULTI: INCR + PEXPIRE (если ключ новый) + PTTL
      const pipe = this.redis.multi();
      pipe.incr(redisKey);
      // NX: ставим expire только при первом инкременте,
      // ioredis 5 поддерживает 'NX' через строку.
      pipe.pexpire(redisKey, ttl, 'NX');
      pipe.pttl(redisKey);
      const results = await pipe.exec();

      if (!results) throw new Error('pipeline returned null');

      const totalHits = Number(results[0][1]);
      const pttl = Number(results[2][1]);
      return {
        totalHits,
        timeToExpire: pttl > 0 ? pttl : ttl,
      };
    } catch (err) {
      this.logger.warn(
        `redis throttle failed, using fallback: ${
          err instanceof Error ? err.message : err
        }`,
      );
      return this.fallbackIncrement(key, ttlSec * 1000);
    }
  }

  async onModuleDestroy() {
    // Shared Redis client is closed by RedisService; nothing to do here.
  }

  // ---- in-memory fallback (degraded mode) ----

  private fallbackIncrement(key: string, ttlMs: number): StorageReturn {
    const now = Date.now();
    const entry = this.fallback.get(key);
    if (!entry || entry.expiresAt < now) {
      const next = { count: 1, expiresAt: now + ttlMs };
      this.fallback.set(key, next);
      return { totalHits: 1, timeToExpire: ttlMs };
    }
    entry.count++;
    return { totalHits: entry.count, timeToExpire: entry.expiresAt - now };
  }
}
