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
import { Leed, User } from '@prisma/client';
import { LeedsService } from './leeds.service';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('Leeds')
@Controller('leeds')
export class LeedsController {
  constructor(private leedsService: LeedsService) {}

  @ApiOperation({ summary: 'Создать лида' })
  @Post()
  create(@Body() data: Leed): Promise<Leed> {
    return this.leedsService.create(data);
  }

  @ApiOperation({ summary: 'Получить всех лидов' })
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
  findOne(@Param('id') id: string): Promise<Leed> {
    return this.leedsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Изменить лида' })
  @Patch('/:id')
  update(@Param('id') id: string, @Body() data: Leed): Promise<Leed> {
    return this.leedsService.update(+id, data);
  }

  @ApiOperation({ summary: 'Удалить лида' })
  @Delete('/:id')
  remove(@Param('id') id: string): Promise<Leed> {
    return this.leedsService.remove(+id);
  }
}
