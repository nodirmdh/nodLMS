import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { JOB_NAMES, QUEUE_NAMES } from '../queues/queue.constants';
import { GenerateReportJob, ReportResult } from './reports.jobs';

/**
 * Producer-фасад для reports. API-слой дергает `enqueue`, получает jobId,
 * потом клиент polls `getResult(jobId)`. Когда появится websocket — можно
 * пушить готовность.
 */
@Injectable()
export class ReportsService {
  constructor(
    @InjectQueue(QUEUE_NAMES.REPORTS) private readonly queue: Queue,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async enqueue(data: GenerateReportJob): Promise<{ jobId: string }> {
    const job = await this.queue.add(JOB_NAMES.REPORTS.GENERATE, data);
    return { jobId: String(job.id) };
  }

  async getStatus(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) throw new NotFoundException();
    const state = await job.getState();
    return {
      jobId,
      state,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason ?? null,
      finishedOn: job.finishedOn ?? null,
      returnvalue: job.returnvalue ?? null,
    };
  }

  async getResult(jobId: string): Promise<ReportResult | null> {
    const raw = await this.redis.get(`report:result:${jobId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ReportResult;
  }
}
