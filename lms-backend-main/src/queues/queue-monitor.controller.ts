import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { QueueMonitorService, QueueStats } from './queue-monitor.service';

/**
 * Read-only queue dashboard endpoint.
 *
 * Protected by the global AuthMiddleware + RolesGuard: only CEO / admin
 * can inspect queue state. This is a foundation endpoint — a richer UI
 * (Bull Board / custom dashboard) can be layered on top later.
 */
@ApiTags('Queues')
@Controller('queues')
export class QueueMonitorController {
  constructor(private readonly monitor: QueueMonitorService) {}

  @ApiOperation({ summary: 'Queue counts across all infra queues' })
  @Roles('CEO', 'admin')
  @Get('stats')
  async stats(): Promise<{
    timestamp: string;
    queues: QueueStats[];
  }> {
    return {
      timestamp: new Date().toISOString(),
      queues: await this.monitor.getStats(),
    };
  }
}
