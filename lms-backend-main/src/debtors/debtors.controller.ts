import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { DebtorsService } from './debtors.service';
import { Roles } from '../auth/decorator/roles.decorator';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { Audit } from '../audit/audit.decorator';

@ApiTags('Debtors')
@Controller('debtors')
@Roles('CEO', 'admin', 'manager')
export class DebtorsController {
  constructor(private readonly debtors: DebtorsService) {}

  @ApiOperation({
    summary: 'Список должников (с сегментацией)',
    description:
      'bucket: 0-29 / 30-59 / 60-89 / 90+. minDebt — минимум по абс. значению в сумах.',
  })
  @Get()
  list(
    @CurrentUser() user: User,
    @Query('bucket') bucket?: string,
    @Query('minDebt') minDebt?: string,
  ) {
    return this.debtors.list(user, {
      bucket,
      minDebt: minDebt != null ? Number(minDebt) : undefined,
    });
  }

  @ApiOperation({
    summary: 'Массовая рассылка SMS-напоминаний',
    description:
      'Если передан studentIds — только им. Иначе — всем должникам филиала (опц. фильтр по bucket).',
  })
  @Post('remind')
  @Audit({ action: 'debtors.remind', entity: 'Debtor' })
  remind(
    @CurrentUser() user: User,
    @Body() body: { studentIds?: number[]; bucket?: string },
  ) {
    return this.debtors.sendReminders(user, body ?? {});
  }
}
