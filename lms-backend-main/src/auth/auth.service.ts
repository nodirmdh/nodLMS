import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { SMSService } from 'src/sms/sms.service';
import { sign } from 'jsonwebtoken';
import { AccessTokenPayload } from './middleware/auth.middleware';
import { OtpService } from './otp.service';
import {
  RefreshIssueContext,
  RefreshIssueResult,
  RefreshTokenService,
} from './refresh-token.service';

/**
 * AuthService — no longer request-scoped. `getMe()` receives the already
 * resolved user via `@CurrentUser` in the controller.
 *
 * OTP lives in Redis (OtpService). Access + refresh tokens are issued
 * together on successful `confirm()`; the refresh flow is delegated to
 * RefreshTokenService.
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private smsService: SMSService,
    private otpService: OtpService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  createAccessToken({ id, role }: AccessTokenPayload): string {
    return sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d',
    });
  }

  assignTokens(id: number, role: Role[]) {
    // Legacy single-token helper kept for callers that don't want the full
    // pair. New code should use `confirm()` which returns access + refresh.
    return this.createAccessToken({ id, role });
  }

  async login(phone: string): Promise<{ message: string }> {
    const user = await this.findbyPhone(phone);
    if (!user) throw new NotFoundException();
    if (user.status === 'noWork') throw new ForbiddenException();

    await this.otpService.issue(phone);

    if (
      process.env.DEV_OTP_BYPASS === 'true' ||
      process.env.NODE_ENV !== 'production'
    ) {
      return { message: 'success' };
    }

    const smsStatus = await this.smsService.sendAuthSMS(phone);
    if (!smsStatus) {
      throw new ServiceUnavailableException({
        error: 'SMS service not avialable',
      });
    }
    return { message: 'success' };
  }

  async confirm(
    { phone, code }: { phone: string; code: string },
    ctx: RefreshIssueContext = {},
  ): Promise<{
    /** @deprecated use `accessToken`. Kept for backwards compat. */
    token: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const ok = await this.otpService.verify(phone, code);
    if (!ok) throw new ForbiddenException();

    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new NotFoundException();

    const pair = await this.refreshTokenService.issue(user, ctx);
    return {
      token: pair.accessToken,
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      expiresAt: pair.expiresAt,
    };
  }

  async refresh(
    rawToken: string,
    ctx: RefreshIssueContext = {},
  ): Promise<RefreshIssueResult> {
    return this.refreshTokenService.rotate(rawToken, ctx);
  }

  async logout(rawToken: string | null | undefined): Promise<void> {
    if (!rawToken) return;
    await this.refreshTokenService.revoke(rawToken);
  }

  async logoutAll(userId: number): Promise<{ revoked: number }> {
    const revoked = await this.refreshTokenService.revokeAllForUser(userId);
    return { revoked };
  }

  async findbyPhone(phone: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async getMe(user: User): Promise<any> {
    if (!user) throw new ForbiddenException();

    if (user.role?.includes('mentor')) {
      const mentor = await this.prisma.mentor.findUnique({
        where: { userId: user.id },
      });
      return { ...user, mentorId: mentor?.id ?? null };
    }
    return user;
  }
}
