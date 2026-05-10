import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SMSModule } from 'src/sms/sms.module';
import { OtpService } from './otp.service';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [SMSModule],
  providers: [AuthService, PrismaService, OtpService, RefreshTokenService],
  controllers: [AuthController],
  exports: [OtpService, RefreshTokenService],
})
export class AuthModule {}
