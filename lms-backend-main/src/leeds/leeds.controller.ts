import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Leed, LeedStatus, User } from '@prisma/client';
import { LeedsService } from './leeds.service';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { Audit } from 'src/audit/audit.decorator';

@ApiTags('Leeds')
@Controller('leeds')
export class LeedsController {
  constructor(private leedsService: LeedsService) {}

  @ApiOperation({ summary: 'Создать лида' })
  @Post()
  @Audit({ action: 'leed.create', entity: 'Leed', entityIdFrom: 'result.id' })
  create(@Body() data: Leed): Promise<Leed> {
    return this.leedsService.create(data);
  }

  @ApiOperation({ summary: 'Канбан: карточки, сгруппированные по статусу' })
  @Get('kanban')
  kanban(@CurrentUser() user: User) {
    return this.leedsService.kanban(user);
  }

  @ApiOperation({ summary: 'Получить всех лидов (таблица)' })
  @Get()
  findAll(
    @Query('fio') fio: string,
    @Query()
    filter: {
      courseId: number;
      authorId: number;
      date: string;
      startTime: string;
      endTime: string;
    },
    @CurrentUser() user: User,
  ): Promise<Leed[]> {
    return this.leedsService.findAll(fio, filter, user);
  }

  @ApiOperation({ summary: 'Получить лида' })
  @Get('/:id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Leed> {
    return this.leedsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Переместить карточку в канбане',
    description:
      'Меняет status и/или position. При status=refused можно передать refusedReason.',
  })
  @Patch('/:id/move')
  @Audit({ action: 'leed.move', entity: 'Leed' })
  move(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: { status?: LeedStatus; position?: number; refusedReason?: string },
  ) {
    return this.leedsService.move(id, data);
  }

  @ApiOperation({ summary: 'Изменить лида' })
  @Patch('/:id')
  @Audit({ action: 'leed.update', entity: 'Leed' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Leed,
  ): Promise<Leed> {
    return this.leedsService.update(id, data);
  }

  @ApiOperation({ summary: 'Удалить лида' })
  @Delete('/:id')
  @Audit({ action: 'leed.delete', entity: 'Leed' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<Leed> {
    return this.leedsService.remove(id);
  }
}
