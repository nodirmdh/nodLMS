import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface RefreshIssueContext {
  userAgent?: string | null;
  ip?: string | null;
  deviceId?: string | null;
}

export interface RefreshIssueResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Refresh-token flow — minimal and safe for dev.
 *
 *  - Raw token: 48 random bytes, base64url. Returned to client ONCE.
 *  - Stored in DB as SHA-256 hash, never plaintext.
 *  - Single-use (rotated on every refresh). Old token is marked revoked.
 *  - Revocation list = `RefreshToken.revokedAt != null`.
 *  - On logout: revoke the presented token.
 *  - On "logout everywhere": revoke all tokens for user.
 *
 * Access token TTL stays 1 day (same as before). Refresh token TTL is
 * configurable via `REFRESH_TOKEN_TTL_DAYS` (default 30).
 */
@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  private accessSecret(): string {
    const s = process.env.ACCESS_TOKEN_SECRET;
    if (!s) throw new Error('ACCESS_TOKEN_SECRET missing');
    return s;
  }

  private refreshTtlMs(): number {
    const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30);
    return days * 24 * 60 * 60 * 1000;
  }

  private hash(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  signAccess(user: Pick<User, 'id' | 'role'>): string {
    return sign({ id: user.id, role: user.role }, this.accessSecret(), {
      expiresIn: '1d',
    });
  }

  async issue(
    user: Pick<User, 'id' | 'role'>,
    ctx: RefreshIssueContext = {},
  ): Promise<RefreshIssueResult> {
    const raw = randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + this.refreshTtlMs());

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hash(raw),
        deviceId: ctx.deviceId ?? null,
        userAgent: ctx.userAgent ?? null,
        ip: ctx.ip ?? null,
        expiresAt,
      },
    });

    return {
      accessToken: this.signAccess(user),
      refreshToken: raw,
      expiresAt,
    };
  }

  /**
   * Verify refresh token, rotate it (revoke old, issue new), return the pair.
   */
  async rotate(
    rawToken: string,
    ctx: RefreshIssueContext = {},
  ): Promise<RefreshIssueResult> {
    const tokenHash = this.hash(rawToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (
      !record ||
      record.revokedAt != null ||
      record.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('auth.refreshInvalid');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
    });
    if (!user) throw new UnauthorizedException('auth.refreshInvalid');

    // Revoke old token atomically alongside issuing a new one.
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date(), lastUsedAt: new Date() },
      });

      const newRaw = randomBytes(48).toString('base64url');
      const expiresAt = new Date(Date.now() + this.refreshTtlMs());

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: this.hash(newRaw),
          deviceId: ctx.deviceId ?? record.deviceId ?? null,
          userAgent: ctx.userAgent ?? record.userAgent ?? null,
          ip: ctx.ip ?? null,
          expiresAt,
        },
      });

      return {
        accessToken: this.signAccess(user),
        refreshToken: newRaw,
        expiresAt,
      };
    });

    return result;
  }

  async revoke(rawToken: string): Promise<void> {
    const tokenHash = this.hash(rawToken);
    await this.prisma.refreshToken
      .updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => null);
  }

  async revokeAllForUser(userId: number): Promise<number> {
    const res = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return res.count;
  }
}
