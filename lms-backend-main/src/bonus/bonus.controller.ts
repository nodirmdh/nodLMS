import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BonusService } from './bonus.service';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Bonus, User } from '@prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('Bonus')
@Controller('bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @ApiOperation({ summary: 'Получить все премии (таблица)' })
  @Get()
  @Roles('CEO', 'admin')
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filter: { userId: number; authorId: number; date: string },
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<Bonus>> {
    return await this.bonusService.findAll(paginationDto, filter, user);
  }

  @ApiOperation({ summary: 'Получить премию по id' })
  @Get(':id')
  @Roles('CEO', 'admin')
  async findOne(@Param('id') id: string): Promise<Bonus> {
    return await this.bonusService.findOne(+id);
  }

  @ApiOperation({ summary: 'Получить премии сотрудника (таблица)' })
  @Get('/user/:userId')
  @Roles('CEO', 'admin')
  async findByUserId(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Bonus>> {
    return await this.bonusService.findByUserId(paginationDto, +id);
  }

  @ApiOperation({ summary: 'Создать премию' })
  @Post()
  @Roles('CEO', 'admin')
  async create(@Body() data: Bonus, @CurrentUser() user: User): Promise<Bonus> {
    return await this.bonusService.create(data, user);
  }

  @ApiOperation({ summary: 'Изменить премию' })
  @Patch(':id')
  @Roles('CEO', 'admin')
  async update(@Param('id') id: string, @Body() data: Bonus): Promise<Bonus> {
    return await this.bonusService.update(+id, data);
  }

  @ApiOperation({ summary: 'Удалить премию по id' })
  @Delete(':id')
  @Roles('CEO', 'admin')
  async cancel(@Param('id') id: string): Promise<Bonus> {
    return await this.bonusService.delete(+id);
  }
}
