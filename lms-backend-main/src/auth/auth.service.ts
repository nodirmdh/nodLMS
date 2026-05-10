import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { SMSService } from 'src/sms/sms.service';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { sign, verify } from 'jsonwebtoken';
import { AccessTokenPayload } from './middleware/auth.middleware';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
    private prisma: PrismaService,
    private smsService: SMSService,
  ) {}

  createAccessToken({ id, role }: AccessTokenPayload): string {
    return sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d',
    });
  }

  assignTokens(id: number, role: Role[]) {
    return this.createAccessToken({ id, role });
  }

  async login(phone: string): Promise<{ message: string }> {
    const user = await this.findbyPhone(phone);

    if (user) {
      if (user.status !== 'noWork') {
        // В dev-режиме ставим фиксированный OTP 000000 и не отправляем SMS
        if (process.env.NODE_ENV !== 'production') {
          await this.cacheManager.set(`otp:${phone}`, 0, 1000 * 900);
          return { message: 'success' };
        }

        await this.cacheManager.set(
          `otp:${phone}`,
          Math.floor(100000 + Math.random() * 900000),
          1000 * 900,
        );
        const smsStatus = await this.smsService.sendAuthSMS(phone);

        if (smsStatus) {
          return { message: 'success' };
        } else {
          throw new ServiceUnavailableException({
            error: 'SMS service not avialable',
          });
        }
      } else {
        throw new ForbiddenException();
      }
    } else {
      throw new NotFoundException();
    }
  }

  async confirm({
    phone,
    code,
  }: {
    phone: string;
    code: string;
  }): Promise<{ token: string }> {
    const cachedOtp = await this.cacheManager.get(`otp:${phone}`);

    if (+code === cachedOtp) {
      const user = await this.prisma.user.findUnique({ where: { phone } });
      return { token: this.assignTokens(user.id, user.role) };
    } else {
      throw new ForbiddenException();
    }
  }

  async findbyPhone(phone: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async getMe(): Promise<any> {
    const request = this.request;

    if (request) {
      // @ts-ignore
      const req = (await this.request.user) as User;

      if (req.role.includes('mentor')) {
        const mentor = await this.prisma.mentor.findUnique({
          where: { userId: req.id },
        });

        return { ...req, mentorId: mentor.id };
      } else {
        return req;
      }
    } else {
      throw new ForbiddenException();
    }
  }
}
