import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
      where: { phone: '998770421939' },
      update: {},
      create: {
        phone: '998770421939',
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

    return { message: 'Seed completed', phone: '998770421939', otp: '000000' };
  }

  @ApiOperation({ summary: 'Авторизация номер телефона' })
  @Post('/login')
  async login(@Body() data: { phone: string }): Promise<{ message: string }> {
    return await this.authService.login(data.phone);
  }

  @ApiOperation({ summary: 'Потдверждение по смс-коду' })
  @Post('/confirm')
  async confirm(
    @Body() data: { phone: string; code: string },
  ): Promise<{ token: string }> {
    return await this.authService.confirm(data);
  }

  @ApiOperation({ summary: 'Запросить новый смс-код' })
  @Post('/send-sms')
  async sendSMS(@Body() data: { phone: string }): Promise<{ message: string }> {
    return await this.authService.login(data.phone);
  }

  @ApiOperation({ summary: 'Запросить новый смс-код' })
  @Get('/me')
  async getMe(): Promise<User> {
    return await this.authService.getMe();
  }
}
