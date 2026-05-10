import { verify } from 'jsonwebtoken';
import {
  NestMiddleware,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  id: number;
  role: Role[];
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UsersService) {}

  async use(req: Request | any, res: Response, next: () => void) {
    const bearerHeader = req.headers.authorization;
    const accessToken = bearerHeader && bearerHeader.split(' ')[1];

    let user: any;

    if (!bearerHeader || !accessToken) {
      throw new UnauthorizedException('auth.notAuth');
    }

    try {
      const { id } = verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;

      user = await this.userService.findOne(id);
    } catch (error) {
      throw new UnauthorizedException('auth.notAuth');
    }

    if (user) {
      req.user = user;
    }
    next();
  }
}
