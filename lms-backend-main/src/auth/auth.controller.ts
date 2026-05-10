import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
