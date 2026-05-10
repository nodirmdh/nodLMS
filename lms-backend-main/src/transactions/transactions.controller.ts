import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { Student, Transaction, User } from '@prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Audit } from 'src/audit/audit.decorator';
import { ReportsService } from 'src/reports/reports.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private transactionsService: TransactionsService,
    private reportsService: ReportsService,
  ) {}

  @Get()
  @Roles('CEO', 'admin')
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() type: 'in' | 'out',
    @Query()
    filter: {
      userId: number;
      authorId: number;
      studentId: number;
      date: string;
      expenseType: string;
      profitType: string;
      paymentType: string;
    },
    @CurrentUser() user: User,
  ): Promise<any> {
    return this.transactionsService.findAll(paginationDto, type, filter, user);
  }

  @Get('debtors')
  @Roles('CEO', 'admin')
  async findAllDebtors(@CurrentUser() user: User): Promise<Student[]> {
    return this.transactionsService.findAllDebtors(user);
  }

  @ApiOperation({
    summary: 'Экспорт транзакций в Excel (через очередь)',
    description:
      'Возвращает { jobId }. Клиент далее пуллит `/admin/reports/:jobId/status` и качает `/admin/reports/:jobId/download`.',
  })
  @Post('export.xlsx')
  @Roles('CEO', 'admin')
  async exportExcel(
    @Body() body: { from?: string; to?: string },
    @CurrentUser() user: User,
  ) {
    return this.reportsService.enqueue({
      kind: 'transactions.excel',
      from: body?.from,
      to: body?.to,
      branchId: user?.branch ?? null,
      requestedBy: user?.id ?? null,
    });
  }

  @Post()
  @Roles('CEO', 'admin')
  @Audit({
    action: 'transaction.create',
    entity: 'Transaction',
    entityIdFrom: 'result.id',
  })
  async create(
    @Body() data: Transaction,
    @CurrentUser() user: User,
  ): Promise<Transaction> {
    return this.transactionsService.create(data, user);
  }

  @Get('/:id')
  @Roles('CEO', 'admin')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionsService.findOne(+id);
  }

  @Patch('/:id')
  @Roles('CEO', 'admin')
  @Audit({ action: 'transaction.update', entity: 'Transaction' })
  async update(
    @Param('id') id: string,
    @Body() data: Transaction,
  ): Promise<Transaction> {
    return this.transactionsService.update(+id, data);
  }
}
