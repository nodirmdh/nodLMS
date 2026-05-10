import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { Lesson, User } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @ApiOperation({ summary: 'Создать урок' })
  @Post()
  create(@Body() data: Lesson, @CurrentUser() user: User): Promise<Lesson> {
    return this.lessonsService.create(data, user);
  }

  @ApiOperation({ summary: 'Получить все уроки' })
  @Get()
  findAll(@CurrentUser() user: User): Promise<Lesson[]> {
    return this.lessonsService.findAll(user);
  }

  @ApiOperation({ summary: 'Получить урок по ID' })
  @Get('/:id')
  async find(@Param('id') id: string): Promise<any> {
    const { groupId, status } = await this.lessonsService.find(+id);

    if (status === 'waiting' || !groupId) {
      return await this.lessonsService.find(+id);
    } else {
      return await this.lessonsService.getLessonWithAttendance(+id);
    }
  }

  @ApiOperation({ summary: 'Получить все уроки по дате' })
  @Post('/get-lessons-by-date')
  async findByDate(
    @Body() data: { date: string },
    @CurrentUser() user: User,
  ): Promise<Lesson[]> {
    return this.lessonsService.findAllByDate(data, user);
  }

  @ApiOperation({ summary: 'Получить все уроки по дате' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Lesson): Promise<Lesson> {
    return this.lessonsService.update(+id, data);
  }

  @ApiOperation({ summary: 'Перекличка студентов - ментор' })
  @Post('/:id/attendance-mentor')
  async attendanceMentor(
    @Param('id') id: string,
    @Body() data: any,
  ): Promise<Lesson> {
    if (data && data.length === 0) {
      throw new BadRequestException();
    } else {
      return this.lessonsService.attendanceMentor(+id, data);
    }
  }

  @ApiOperation({ summary: 'Перекличка студентов - ответственый' })
  @Post('/:id/attendance-responsible')
  async attendanceResponsible(
    @Param('id') id: string,
    @Body() data: any,
  ): Promise<any> {
    if (data && data.length === 0) {
      throw new BadRequestException();
    } else {
      return await this.lessonsService.confirmLesson(+id, data);
    }
  }
}
