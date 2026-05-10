import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ALL_QUEUE_NAMES, QueueName, QUEUE_NAMES } from './queue.constants';

export interface QueueStats {
  name: QueueName;
  /** queue.isPaused() */
  paused: boolean;
  counts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    prioritized: number;
    waitingChildren: number;
  };
  /** Queue is "reachable" via Redis right now. */
  reachable: boolean;
  error?: string;
}

/**
 * Foundation for queue monitoring. Aggregates `getJobCounts()` across the
 * four infrastructure queues and exposes them via /queues/stats.
 *
 * This is intentionally read-only. Admin actions (retry/clean/pause) can
 * be added once proper RBAC around `CEO`/`admin` is wired up at the
 * controller layer.
 */
@Injectable()
export class QueueMonitorService {
  private readonly logger = new Logger('QueueMonitor');
  private readonly queues: Record<QueueName, Queue>;

  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) notifications: Queue,
    @InjectQueue(QUEUE_NAMES.SMS) sms: Queue,
    @InjectQueue(QUEUE_NAMES.TELEGRAM) telegram: Queue,
    @InjectQueue(QUEUE_NAMES.REPORTS) reports: Queue,
    @InjectQueue(QUEUE_NAMES.SCHEDULER) scheduler: Queue,
    @InjectQueue(QUEUE_NAMES.DLQ) dlq: Queue,
  ) {
    this.queues = {
      [QUEUE_NAMES.NOTIFICATIONS]: notifications,
      [QUEUE_NAMES.SMS]: sms,
      [QUEUE_NAMES.TELEGRAM]: telegram,
      [QUEUE_NAMES.REPORTS]: reports,
      [QUEUE_NAMES.SCHEDULER]: scheduler,
      [QUEUE_NAMES.DLQ]: dlq,
    };
  }

  getQueue(name: QueueName): Queue {
    return this.queues[name];
  }

  async getStats(): Promise<QueueStats[]> {
    return Promise.all(ALL_QUEUE_NAMES.map((n) => this.statsFor(n)));
  }

  private async statsFor(name: QueueName): Promise<QueueStats> {
    const queue = this.queues[name];
    try {
      const [counts, paused] = await Promise.all([
        queue.getJobCounts(
          'waiting',
          'active',
          'completed',
          'failed',
          'delayed',
          'prioritized',
          'waiting-children',
        ),
        queue.isPaused(),
      ]);

      return {
        name,
        paused,
        reachable: true,
        counts: {
          waiting: counts.waiting ?? 0,
          active: counts.active ?? 0,
          completed: counts.completed ?? 0,
          failed: counts.failed ?? 0,
          delayed: counts.delayed ?? 0,
          prioritized: counts.prioritized ?? 0,
          waitingChildren: (counts as Record<string, number>)['waiting-children'] ?? 0,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Log at debug level only — a broken Redis is already surfaced by /health.
      this.logger.debug(`stats(${name}) failed: ${message}`);
      return {
        name,
        paused: false,
        reachable: false,
        error: message,
        counts: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          prioritized: 0,
          waitingChildren: 0,
        },
      };
    }
  }

  /**
   * Best-effort probe used by the /health endpoint. Returns true if every
   * queue responded, false otherwise. Never throws.
   */
  async allReachable(): Promise<boolean> {
    const stats = await this.getStats();
    return stats.every((s) => s.reachable);
  }
}
