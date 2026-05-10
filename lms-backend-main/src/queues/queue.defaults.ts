import { JobsOptions } from 'bullmq';
import { QUEUE_NAMES, QueueName } from './queue.constants';

/**
 * Global default job options applied to every queue. Individual queues can
 * override via `PER_QUEUE_DEFAULTS` below.
 *
 * Retry strategy: exponential backoff (2s → 4s → 8s → 16s → 32s) with 5
 * attempts total. Failed jobs are retained for a week; completed jobs are
 * trimmed aggressively to keep Redis small in dev.
 */
export const BASE_JOB_DEFAULTS: JobsOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2_000,
  },
  removeOnComplete: {
    age: 24 * 3600, // 1 day
    count: 1_000,
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // 7 days
  },
};

/**
 * Per-queue tuning. Notifications + SMS get a few more attempts because
 * providers hiccup; reports get fewer because a failed export is usually
 * deterministic.
 */
export const PER_QUEUE_DEFAULTS: Record<QueueName, JobsOptions> = {
  [QUEUE_NAMES.NOTIFICATIONS]: {
    ...BASE_JOB_DEFAULTS,
    attempts: 6,
  },
  [QUEUE_NAMES.SMS]: {
    ...BASE_JOB_DEFAULTS,
    attempts: 6,
    backoff: { type: 'exponential', delay: 5_000 },
  },
  [QUEUE_NAMES.TELEGRAM]: {
    ...BASE_JOB_DEFAULTS,
    attempts: 5,
    backoff: { type: 'exponential', delay: 3_000 },
  },
  [QUEUE_NAMES.REPORTS]: {
    ...BASE_JOB_DEFAULTS,
    attempts: 3,
    backoff: { type: 'exponential', delay: 10_000 },
  },
  [QUEUE_NAMES.SCHEDULER]: {
    // Scheduler jobs are idempotent — одной попытки достаточно.
    // Если упадёт — next cron tick разберётся.
    attempts: 1,
    removeOnComplete: { age: 7 * 24 * 3600, count: 500 },
    removeOnFail: { age: 30 * 24 * 3600 },
  },
  [QUEUE_NAMES.DLQ]: {
    // Dead-letter: одна попытка, храним 30 дней.
    attempts: 1,
    removeOnComplete: { age: 30 * 24 * 3600 },
    removeOnFail: { age: 30 * 24 * 3600 },
  },
};
