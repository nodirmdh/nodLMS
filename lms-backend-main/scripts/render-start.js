/**
 * render-start.js — entrypoint для Render.
 *
 * 1. Если DIRECT_URL пуст → подставляет DATABASE_URL (нужен Prisma).
 * 2. Запускает `prisma migrate deploy` как дочерний процесс со средой,
 *    в которой DIRECT_URL уже задан.
 * 3. Если миграции ушли успешно — запускает основной API (`dist/src/main`).
 *
 * Всё без внешних зависимостей.
 */

const { spawnSync, spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };

if (!env.DIRECT_URL || env.DIRECT_URL.trim() === '') {
  if (env.DATABASE_URL && env.DATABASE_URL.trim() !== '') {
    env.DIRECT_URL = env.DATABASE_URL;
    console.log('[render-start] DIRECT_URL fallback to DATABASE_URL');
  } else {
    console.error('[render-start] DATABASE_URL is missing. Abort.');
    process.exit(1);
  }
}

// --- 1. migrate deploy ---
console.log('[render-start] running prisma migrate deploy');
const migrate = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['prisma', 'migrate', 'deploy'],
  { env, stdio: 'inherit' },
);
if (migrate.status !== 0) {
  console.error(`[render-start] migrate deploy failed with code ${migrate.status}`);
  process.exit(migrate.status || 1);
}

// --- 2. start API ---
console.log('[render-start] starting API (dist/src/main.js)');
const main = spawn(process.execPath, [path.join(__dirname, '..', 'dist', 'src', 'main.js')], {
  env,
  stdio: 'inherit',
});

// Forward signals so Render can stop us gracefully.
const forward = (signal) => () => {
  if (!main.killed) main.kill(signal);
};
process.on('SIGINT', forward('SIGINT'));
process.on('SIGTERM', forward('SIGTERM'));
main.on('exit', (code) => process.exit(code ?? 0));
