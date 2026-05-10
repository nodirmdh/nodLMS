import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { User } from '@prisma/client';
import { REDIS_CLIENT } from '../redis/redis.constants';

/**
 * Маленький кеш пользователей в Redis.
 *
 * Назначение: `AuthMiddleware` при каждом HTTP-запросе подгружает
 * `req.user` из БД. На удалённой БД (Neon us-east-1) это +200 ms на
 * каждый запрос. С кешем ответ на горячем пути — ~2 ms.
 *
 * TTL намеренно короткий (30 секунд): если сотрудника уволили или
 * поменяли роль, через полминуты изменения всё равно подхватятся.
 * Для более жёсткого инварианта — инвалидация через `invalidate(id)`
 * в местах, где `User` мутируется (UsersService.update, role changes).
 */
@Injectable()
export class UserCacheService {
  private readonly logger = new Logger('UserCacheService');
  private readonly ttlSeconds = Number(process.env.USER_CACHE_TTL ?? 30);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(id: number) {
    return `user:${id}`;
  }

  async get(id: number): Promise<User | null> {
    try {
      const raw = await this.redis.get(this.key(id));
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async set(user: User): Promise<void> {
    try {
      await this.redis.set(
        this.key(user.id),
        JSON.stringify(user),
        'EX',
        this.ttlSeconds,
      );
    } catch (err) {
      this.logger.debug(
        `set failed: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  async invalidate(id: number): Promise<void> {
    try {
      await this.redis.del(this.key(id));
    } catch {
      /* ignore */
    }
  }
}
