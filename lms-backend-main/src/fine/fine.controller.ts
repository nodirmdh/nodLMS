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
import { FineService } from './fine.service';
import { Fine, User } from '@prisma/client';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('Fine')
@Controller('fine')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @ApiOperation({ summary: 'Получить все штрафы (таблица)' })
  @Get()
  @Roles('CEO', 'admin')
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filter: { userId: number; authorId: number; date: string },
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<Fine>> {
    return await this.fineService.findAll(paginationDto, filter, user);
  }

  @ApiOperation({ summary: 'Получить штраф по id' })
  @Get(':id')
  @Roles('CEO', 'admin')
  async findOne(@Param('id') id: string): Promise<Fine> {
    return await this.fineService.findOne(+id);
  }

  @ApiOperation({ summary: 'Получить штрафы сотрудника (таблица)' })
  @Get('/user/:userId')
  @Roles('CEO', 'admin')
  async findByUserId(
    @Query() paginationDto: PaginationDto,
    @Param('id') id: string,
  ): Promise<PaginatedResult<Fine>> {
    return await this.fineService.findByUserId(paginationDto, +id);
  }

  @ApiOperation({ summary: 'Создать штраф' })
  @Post()
  @Roles('CEO', 'admin')
  async create(@Body() data: Fine, @CurrentUser() user: User): Promise<Fine> {
    return await this.fineService.create(data, user);
  }

  @ApiOperation({ summary: 'Изменить штраф' })
  @Patch(':id')
  @Roles('CEO', 'admin')
  async update(@Param('id') id: string, @Body() data: Fine): Promise<Fine> {
    return await this.fineService.update(+id, data);
  }

  @ApiOperation({ summary: 'Удалить штраф по id' })
  @Delete(':id')
  @Roles('CEO', 'admin')
  async cancel(@Param('id') id: string): Promise<Fine> {
    return await this.fineService.delete(+id);
  }
}
