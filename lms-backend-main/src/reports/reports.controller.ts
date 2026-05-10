import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from '../auth/decorator/roles.decorator';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from '@prisma/client';
import { ReportsService } from './reports.service';
import { GenerateReportJob } from './reports.jobs';

@ApiTags('Reports')
@Controller('admin/reports')
@Roles('CEO', 'admin')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @ApiOperation({
    summary: 'Поставить отчёт в очередь на генерацию',
    description:
      'Возвращает jobId. Клиент polls `/admin/reports/:jobId/status` до state=completed, затем скачивает `/admin/reports/:jobId/download`.',
  })
  @Post()
  async enqueue(@Body() body: GenerateReportJob, @CurrentUser() user: User) {
    if (!body?.kind) {
      throw new BadRequestException('kind is required');
    }
    return this.reports.enqueue({
      ...body,
      requestedBy: user?.id ?? null,
      branchId: body.branchId ?? user?.branch ?? null,
    });
  }

  @ApiOperation({ summary: 'Статус генерации' })
  @Get(':jobId/status')
  async status(@Param('jobId') jobId: string) {
    return this.reports.getStatus(jobId);
  }

  @ApiOperation({ summary: 'Скачать готовый отчёт' })
  @Get(':jobId/download')
  async download(@Param('jobId') jobId: string, @Res() res: Response) {
    const result = await this.reports.getResult(jobId);
    if (!result) {
      throw new NotFoundException('report not ready or expired');
    }
    const buffer = Buffer.from(result.base64, 'base64');
    res.setHeader('Content-Type', result.mime);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer);
  }
}
