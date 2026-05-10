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
import { ExamService } from './exam.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Exam, ExamStatus, User } from '@prisma/client';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';
import { addExamDto } from './dto/add-exam.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('Exam')
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @ApiOperation({ summary: 'Создать экзамен' })
  @Post()
  @Roles('CEO', 'admin')
  create(@Body() data: Exam): Promise<Exam> {
    return this.examService.create(data);
  }

  @ApiOperation({ summary: 'Получить все экзамены' })
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filter: { groupId: number; status: ExamStatus },
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<Exam>> {
    return this.examService.findAll(paginationDto, filter, user);
  }

  @ApiOperation({ summary: 'Получить экзамен' })
  @Get('/:id')
  find(@Param('id') id: string): Promise<Exam> {
    return this.examService.find(+id);
  }

  @ApiOperation({ summary: 'Изменить экзамен' })
  @Patch(':id')
  @Roles('CEO', 'admin')
  update(@Param('id') id: string, @Body() data: Exam): Promise<Exam> {
    return this.examService.update(+id, data);
  }

  @ApiOperation({ summary: 'Удалить экзамен' })
  @Delete(':id')
  @Roles('CEO', 'admin')
  remove(@Param('id') id: string): Promise<Exam> {
    return this.examService.remove(+id);
  }

  @Post('/:id/batch-add/')
  async addExamGrade(
    @Param('id') examId: number,
    @Body() studentGrades: addExamDto[],
    @CurrentUser() user: User,
  ) {
    return this.examService.addOrUpdateExamGrades(+examId, studentGrades, user);
  }
}
