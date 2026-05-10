import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { HomeworkService } from './homework.service';
import { Roles } from '../auth/decorator/roles.decorator';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { Audit } from '../audit/audit.decorator';
import {
  CreateHomeworkDto,
  ReviewSubmissionDto,
  SubmitHomeworkDto,
  UpdateHomeworkDto,
} from './dto/homework.dto';

@ApiTags('Homework')
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homework: HomeworkService) {}

  @ApiOperation({ summary: 'Список заданий группы' })
  @Get()
  list(
    @Query('groupId') groupId?: string,
    @Query('lessonId') lessonId?: string,
  ) {
    return this.homework.list({
      groupId: groupId != null ? Number(groupId) : undefined,
      lessonId: lessonId != null ? Number(lessonId) : undefined,
    });
  }

  @ApiOperation({ summary: 'Получить задание' })
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const hw = await this.homework.get(id);
    if (!hw) throw new NotFoundException();
    return hw;
  }

  @ApiOperation({ summary: 'Создать задание (ментор)' })
  @Roles('CEO', 'admin', 'mentor')
  @Post()
  @Audit({
    action: 'homework.create',
    entity: 'Homework',
    entityIdFrom: 'result.id',
  })
  create(@Body() dto: CreateHomeworkDto, @CurrentUser() user: User) {
    return this.homework.create(dto, user?.id ?? null);
  }

  @ApiOperation({ summary: 'Изменить задание' })
  @Roles('CEO', 'admin', 'mentor')
  @Patch(':id')
  @Audit({ action: 'homework.update', entity: 'Homework' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHomeworkDto,
  ) {
    return this.homework.update(id, dto);
  }

  @ApiOperation({ summary: 'Удалить задание' })
  @Roles('CEO', 'admin', 'mentor')
  @Delete(':id')
  @Audit({ action: 'homework.delete', entity: 'Homework' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.homework.remove(id);
  }

  @ApiOperation({ summary: 'Сдать домашку (от имени студента)' })
  @Post(':id/submissions')
  @Audit({
    action: 'homework.submit',
    entity: 'HomeworkSubmission',
    entityIdFrom: 'result.id',
  })
  submit(
    @Param('id', ParseIntPipe) homeworkId: number,
    @Body() dto: SubmitHomeworkDto,
  ) {
    return this.homework.submit(homeworkId, dto);
  }

  @ApiOperation({ summary: 'Проверить сдачу (поставить оценку)' })
  @Roles('CEO', 'admin', 'mentor')
  @Patch('submissions/:submissionId')
  @Audit({
    action: 'homework.review',
    entity: 'HomeworkSubmission',
  })
  review(
    @Param('submissionId', ParseIntPipe) id: number,
    @Body() dto: ReviewSubmissionDto,
    @CurrentUser() user: User,
  ) {
    return this.homework.review(id, dto, user?.id ?? null);
  }

  @ApiOperation({ summary: 'Сдачи по заданию' })
  @Roles('CEO', 'admin', 'mentor')
  @Get(':id/submissions')
  listSubmissions(@Param('id', ParseIntPipe) homeworkId: number) {
    return this.homework.listSubmissions(homeworkId);
  }
}
