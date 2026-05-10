import { verify } from 'jsonwebtoken';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { Role } from '@prisma/client';
import { UserCacheService } from '../user-cache.service';

export interface AccessTokenPayload {
  id: number;
  role: Role[];
}

/**
 * Auth middleware с Redis-кешем пользователей.
 *
 * До этого каждый запрос делал `SELECT * FROM users`. Теперь:
 *   1. Пробуем взять user из Redis по `user:<id>` (TTL 30с по умолчанию).
 *   2. При промахе — идём в БД, кладём результат в Redis.
 *
 * Эффект на удалённой БД (Neon): горячий путь падает с ~200ms до ~2ms.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UsersService,
    private readonly userCache: UserCacheService,
  ) {}

  async use(req: Request & { user?: unknown }, res: Response, next: () => void) {
    const bearerHeader = req.headers.authorization;
    const accessToken = bearerHeader && bearerHeader.split(' ')[1];

    if (!bearerHeader || !accessToken) {
      throw new UnauthorizedException('auth.notAuth');
    }

    let user: unknown;

    try {
      const { id } = verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;

      // Redis hot path
      user = await this.userCache.get(id);

      if (!user) {
        user = await this.userService.findOne(id);
        if (user) {
          await this.userCache.set(user as never);
        }
      }
    } catch {
      throw new UnauthorizedException('auth.notAuth');
    }

    if (user) {
      req.user = user;
    }
    next();
  }
}
