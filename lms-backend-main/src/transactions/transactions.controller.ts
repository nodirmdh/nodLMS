import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { Student, Transaction, User } from '@prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

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
  @Post()
  @Roles('CEO', 'admin')
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
  async update(
    @Param('id') id: string,
    @Body() data: Transaction,
  ): Promise<Transaction> {
    return this.transactionsService.update(+id, data);
  }
}
