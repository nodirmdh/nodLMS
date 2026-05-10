import { RedisOptions } from 'ioredis';

/**
 * Resolve a base ioredis configuration from environment.
 *
 * Supported env:
 *   REDIS_URL           — full connection string (redis://:pass@host:port/db)
 *                         takes precedence over REDIS_HOST/PORT
 *   REDIS_HOST          — default "127.0.0.1"
 *   REDIS_PORT          — default 6379
 *   REDIS_PASSWORD      — optional
 *   REDIS_DB            — default 0
 *   REDIS_TLS           — "true" → enable TLS
 *   REDIS_KEY_PREFIX    — optional, applied to the shared client only
 *                         (BullMQ uses its own prefix — BULL_PREFIX)
 *   BULL_PREFIX         — default "bull", BullMQ key namespace
 *
 * Notes
 * -----
 * BullMQ requires `maxRetriesPerRequest: null` and `enableReadyCheck: false`
 * on any connection it uses for blocking reads. We expose a dedicated
 * `buildBullConnectionOptions()` for that.
 */
export interface ResolvedRedisConfig {
  url?: string;
  host: string;
  port: number;
  password?: string;
  db: number;
  tls: boolean;
  keyPrefix?: string;
  bullPrefix: string;
}

export function resolveRedisConfig(): ResolvedRedisConfig {
  const url = process.env.REDIS_URL?.trim() || undefined;
  let host = process.env.REDIS_HOST?.trim() || '127.0.0.1';
  let port = Number(process.env.REDIS_PORT ?? 6379);
  let password = process.env.REDIS_PASSWORD?.trim() || undefined;
  let db = Number(process.env.REDIS_DB ?? 0);
  let tls = process.env.REDIS_TLS === 'true';
  const keyPrefix = process.env.REDIS_KEY_PREFIX?.trim() || undefined;
  const bullPrefix = process.env.BULL_PREFIX?.trim() || 'bull';

  // If URL is given, parse once so BullMQ (which wants object options) can
  // use the same connection details without manual wiring.
  if (url) {
    try {
      const u = new URL(url);
      if (u.hostname) host = u.hostname;
      if (u.port) port = Number(u.port);
      if (u.password) password = decodeURIComponent(u.password);
      if (u.pathname && u.pathname.length > 1) {
        const parsed = Number(u.pathname.replace(/^\//, ''));
        if (!Number.isNaN(parsed)) db = parsed;
      }
      if (u.protocol === 'rediss:') tls = true;
    } catch {
      // fall through — host/port defaults are used
    }
  }

  return { url, host, port, password, db, tls, keyPrefix, bullPrefix };
}

/**
 * ioredis options for the shared application client (cache / OTP / adhoc).
 * Lazy-connect so boot does not fail if Redis is not available — the
 * /health endpoint surfaces its status instead.
 */
export function buildRedisClientOptions(): RedisOptions {
  const cfg = resolveRedisConfig();

  const opts: RedisOptions = {
    host: cfg.host,
    port: cfg.port,
    password: cfg.password,
    db: cfg.db,
    lazyConnect: true,
    // In dev we prefer visible failures to hanging commands.
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    keyPrefix: cfg.keyPrefix,
    // Retry with capped backoff, give up after ~10 attempts in dev.
    retryStrategy: (times) => {
      if (times > 10) return null;
      return Math.min(times * 200, 2000);
    },
  };

  if (cfg.tls) {
    opts.tls = {};
  }

  return opts;
}

/**
 * Connection options compatible with BullMQ workers/queues.
 * BullMQ docs mandate the two disabled flags below.
 */
export function buildBullConnectionOptions(): RedisOptions {
  const cfg = resolveRedisConfig();

  const base: RedisOptions = {
    host: cfg.host,
    port: cfg.port,
    password: cfg.password,
    db: cfg.db,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };

  if (cfg.tls) {
    base.tls = {};
  }

  return base;
}
