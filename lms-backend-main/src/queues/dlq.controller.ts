import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { QueueMonitorService } from './queue-monitor.service';
import { QUEUE_NAMES } from './queue.constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Админский интерфейс к dead-letter queue.
 *
 * - `GET /admin/queues/dlq`        — список "умерших" задач.
 * - `POST /admin/queues/dlq/:id/redrive` — переложить обратно в исходную очередь.
 * - `POST /admin/queues/dlq/:id/drop` — выкинуть совсем.
 */
@ApiTags('Queues.DLQ')
@Controller('admin/queues/dlq')
@Roles('CEO', 'admin')
export class DlqController {
  constructor(
    private readonly monitor: QueueMonitorService,
    @InjectQueue(QUEUE_NAMES.DLQ) private readonly dlq: Queue,
  ) {}

  @ApiOperation({ summary: 'Список задач в DLQ' })
  @Get()
  async list(@Query('limit') limit = '50') {
    const take = Math.min(Number(limit) || 50, 200);
    const jobs = await this.dlq.getJobs(
      ['waiting', 'delayed', 'completed', 'failed'],
      0,
      take - 1,
      false,
    );
    return jobs.map((j) => ({
      id: j.id,
      name: j.name,
      data: j.data,
      timestamp: j.timestamp,
      attemptsMade: j.attemptsMade,
    }));
  }

  @ApiOperation({ summary: 'Вернуть задачу из DLQ обратно в исходную очередь' })
  @Post(':id/redrive')
  async redrive(@Param('id') id: string) {
    const dlqJob = await this.dlq.getJob(id);
    if (!dlqJob) throw new NotFoundException();

    const { originQueue, originName, data } = dlqJob.data as {
      originQueue: string;
      originName: string;
      data: unknown;
    };
    if (!originQueue || !originName) {
      throw new BadRequestException('DLQ job is missing origin metadata');
    }

    const target = this.monitor.getQueue(originQueue as any);
    if (!target) {
      throw new BadRequestException(`Unknown origin queue: ${originQueue}`);
    }

    const redriven = await target.add(originName, data);
    await dlqJob.remove();

    return {
      ok: true,
      redrivenJobId: redriven.id,
      targetQueue: originQueue,
    };
  }

  @ApiOperation({ summary: 'Удалить задачу из DLQ (без восстановления)' })
  @Post(':id/drop')
  async drop(@Param('id') id: string) {
    const job = await this.dlq.getJob(id);
    if (!job) throw new NotFoundException();
    await job.remove();
    return { ok: true };
  }
}
