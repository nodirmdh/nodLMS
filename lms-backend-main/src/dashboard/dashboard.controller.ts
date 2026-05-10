import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/decorator/roles.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@Roles('CEO', 'admin')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @ApiOperation({ summary: 'Сводка по всем филиалам за период' })
  @Get('branches')
  branches(
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.dashboard.branches(period);
  }

  @ApiOperation({ summary: 'Общая сводка (карточки KPI для главной)' })
  @Get('summary')
  summary(
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.dashboard.summary(period);
  }
}
