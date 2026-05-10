import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Thin wrapper around the shared ioredis client. Provides:
 * - lazy connect on module init
 * - a `ping()` used by /health
 * - a typed `client` getter for future cache/OTP consumers
 *
 * Note: queues do NOT reuse this client. BullMQ manages its own
 * connections per queue/worker — see QueueModule.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('RedisService');
  private connected = false;

  constructor(@Inject(REDIS_CLIENT) public readonly client: Redis) {
    client.on('connect', () => {
      this.connected = true;
      this.logger.log('Redis connected');
    });
    client.on('error', (err) => {
      this.connected = false;
      this.logger.warn(`Redis error: ${err?.message ?? err}`);
    });
    client.on('end', () => {
      this.connected = false;
      this.logger.warn('Redis connection closed');
    });
  }

  async onModuleInit() {
    try {
      // lazyConnect: true means we must connect explicitly.
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Redis not available at boot (${message}). App continues; /health will report status.`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch {
      // ignore — we're shutting down
    }
  }

  /**
   * Issue a PING. Returns `true` if the server answered PONG.
   * Never throws — used by healthcheck.
   */
  async ping(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
    const start = Date.now();
    try {
      const pong = await this.client.ping();
      return { ok: pong === 'PONG', latencyMs: Date.now() - start };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  isConnected(): boolean {
    return this.connected && this.client.status === 'ready';
  }
}
