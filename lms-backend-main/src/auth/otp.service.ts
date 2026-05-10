import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';

/**
 * OTP storage backed by Redis.
 *
 * Why Redis and not CacheModule: `CacheModule.register()` is in-memory, so
 * OTPs are lost on restart and don't work across multiple instances. This
 * service keys OTPs as `otp:<phone>` with a 15-minute TTL (same behaviour
 * as before) and stores them as strings — important, because `000123`
 * must not lose its leading zeros.
 *
 * Dev bypass: when `DEV_OTP_BYPASS=true` or `NODE_ENV !== 'production'`
 * we store the fixed code `000000`.
 *
 * Fallback: if Redis is unreachable, we log a warning and fall back to a
 * process-local Map, so local development without Redis still works
 * end-to-end. /health reports the degraded state.
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger('OtpService');
  private readonly ttlSeconds = 15 * 60; // 900s
  private readonly fallback = new Map<
    string,
    { value: string; expiresAt: number }
  >();

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(phone: string) {
    return `otp:${phone}`;
  }

  /**
   * Generate (or use dev-fixed) OTP, store it with TTL, return the code.
   * The caller decides whether to actually send an SMS — we only manage storage.
   */
  async issue(phone: string): Promise<string> {
    const code = this.isDevBypass()
      ? '000000'
      : String(Math.floor(100000 + Math.random() * 900000)).padStart(6, '0');

    await this.set(phone, code);
    return code;
  }

  /** Overwrite without generating (used when dev-seeding a known value). */
  async set(phone: string, code: string): Promise<void> {
    try {
      await this.redis.set(this.key(phone), code, 'EX', this.ttlSeconds);
      this.fallback.delete(phone); // ensure we read from Redis next time
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Redis set failed, using in-memory fallback: ${message}`);
      this.fallback.set(phone, {
        value: code,
        expiresAt: Date.now() + this.ttlSeconds * 1000,
      });
    }
  }

  /**
   * Verify submitted code. Returns true on match.
   * Consumes (deletes) the OTP on a successful match to prevent replay.
   */
  async verify(phone: string, code: string): Promise<boolean> {
    const stored = await this.get(phone);
    if (stored == null) return false;
    const ok = String(stored).trim() === String(code).trim();
    if (ok) {
      await this.consume(phone);
    }
    return ok;
  }

  async consume(phone: string): Promise<void> {
    try {
      await this.redis.del(this.key(phone));
    } catch {
      // best effort
    }
    this.fallback.delete(phone);
  }

  private async get(phone: string): Promise<string | null> {
    try {
      const val = await this.redis.get(this.key(phone));
      if (val != null) return val;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Redis get failed, reading fallback: ${message}`);
    }

    // fallback
    const entry = this.fallback.get(phone);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.fallback.delete(phone);
      return null;
    }
    return entry.value;
  }

  private isDevBypass(): boolean {
    return (
      process.env.DEV_OTP_BYPASS === 'true' ||
      process.env.NODE_ENV !== 'production'
    );
  }
}
