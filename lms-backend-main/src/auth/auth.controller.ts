import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from './decorator/current-user.decorator';

function clientContext(req: Request) {
  return {
    userAgent: (req.headers['user-agent'] as string) ?? null,
    ip: (req.ip as string) ?? null,
    deviceId: (req.headers['x-device-id'] as string) ?? null,
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Seed тестового пользователя (только dev)' })
  @Post('/dev-seed')
  async devSeed(): Promise<any> {
    const branch = await this.prisma.branch.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Главный филиал',
        address: 'Тестовый адрес',
      },
    });

    const user = await this.prisma.user.upsert({
      where: { phone: '998991234567' },
      update: {},
      create: {
        phone: '998991234567',
        fio: 'Admin Test',
        salary: 0,
        role: ['CEO'],
      },
    });

    await this.prisma.userBranch.upsert({
      where: {
        userId_branchId: { userId: user.id, branchId: branch.id },
      },
      update: {},
      create: { userId: user.id, branchId: branch.id },
    });

    return { message: 'Seed completed', phone: '998991234567', otp: '000000' };
  }

  @ApiOperation({ summary: 'Авторизация номер телефона' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('/login')
  async login(@Body() data: { phone: string }): Promise<{ message: string }> {
    return await this.authService.login(data.phone);
  }

  @ApiOperation({ summary: 'Потдверждение по смс-коду' })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('/confirm')
  async confirm(
    @Body() data: { phone: string; code: string },
    @Req() req: Request,
  ) {
    return await this.authService.confirm(data, clientContext(req));
  }

  @ApiOperation({ summary: 'Запросить новый смс-код' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('/send-sms')
  async sendSMS(@Body() data: { phone: string }): Promise<{ message: string }> {
    return await this.authService.login(data.phone);
  }

  @ApiOperation({ summary: 'Обновить access-token по refresh' })
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('/refresh')
  async refresh(
    @Body() data: { refreshToken: string },
    @Req() req: Request,
  ) {
    if (!data?.refreshToken) {
      throw new UnauthorizedException('auth.refreshRequired');
    }
    const pair = await this.authService.refresh(
      data.refreshToken,
      clientContext(req),
    );
    return {
      token: pair.accessToken,
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      expiresAt: pair.expiresAt,
    };
  }

  @ApiOperation({ summary: 'Выход (ревок текущего refresh-token)' })
  @Post('/logout')
  async logout(@Body() data: { refreshToken?: string }) {
    await this.authService.logout(data?.refreshToken ?? null);
    return { message: 'ok' };
  }

  @ApiOperation({ summary: 'Выход со всех устройств' })
  @Post('/logout-all')
  async logoutAll(@CurrentUser() user: User) {
    if (!user) throw new UnauthorizedException('auth.notAuth');
    return this.authService.logoutAll(user.id);
  }

  @ApiOperation({ summary: 'Текущий пользователь' })
  @Get('/me')
  async getMe(@CurrentUser() user: User): Promise<User> {
    return await this.authService.getMe(user);
  }
}
