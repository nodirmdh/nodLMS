import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { PaymentPlansService } from './payment-plans.service';
import { Roles } from '../auth/decorator/roles.decorator';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { Audit } from '../audit/audit.decorator';
import {
  CreatePaymentPlanDto,
  UpdatePaymentPlanItemDto,
} from './dto/payment-plan.dto';

@ApiTags('PaymentPlans')
@Controller('payment-plans')
@Roles('CEO', 'admin', 'manager')
export class PaymentPlansController {
  constructor(private readonly plans: PaymentPlansService) {}

  @ApiOperation({ summary: 'Список планов рассрочки' })
  @Get()
  list(
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    return this.plans.list({
      studentId: studentId != null ? Number(studentId) : undefined,
      status: status as any,
    });
  }

  @ApiOperation({ summary: 'Получить план с графиком' })
  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.plans.get(id);
  }

  @ApiOperation({ summary: 'Создать план рассрочки' })
  @Post()
  @Audit({
    action: 'payment_plan.create',
    entity: 'PaymentPlan',
    entityIdFrom: 'result.id',
  })
  create(@Body() dto: CreatePaymentPlanDto, @CurrentUser() user: User) {
    return this.plans.create(dto, user?.id ?? null);
  }

  @ApiOperation({ summary: 'Обновить позицию графика (отметить оплаченной)' })
  @Patch('items/:itemId')
  @Audit({
    action: 'payment_plan_item.update',
    entity: 'PaymentPlanItem',
  })
  updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdatePaymentPlanItemDto,
  ) {
    return this.plans.updateItem(itemId, dto);
  }

  @ApiOperation({ summary: 'Отменить план рассрочки' })
  @Patch(':id/cancel')
  @Audit({ action: 'payment_plan.cancel', entity: 'PaymentPlan' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.plans.cancel(id);
  }
}
