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
import { StudentsService } from './students.service';
import { Student, User } from '@prisma/client';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';
import { CreateStudentDto } from './dto/create-student.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { CreateBonusStudentDto } from './dto/create-bonus.student.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @ApiOperation({ summary: 'Создать студента' })
  @Post()
  @Roles('CEO', 'admin')
  create(@Body() data: CreateStudentDto): Promise<Student> {
    return this.studentsService.create(data);
  }

  @ApiOperation({ summary: 'Получить всех студентов (таблица)' })
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query()
    filter: {
      fio: string;
      status: string;
      courseId: number;
      groupId: number;
      branchId: number;
    },
  ): Promise<PaginatedResult<Student>> {
    return this.studentsService.findAll(paginationDto, filter);
  }

  @ApiOperation({ summary: 'Получить студента' })
  @Get('/:id')
  find(@Param('id') id: string): Promise<Student> {
    return this.studentsService.find(+id);
  }

  @ApiOperation({ summary: 'Изменить студента' })
  @Patch('/:id')
  update(@Param('id') id: string, @Body() data: Student): Promise<Student> {
    return this.studentsService.update(+id, data);
  }

  @ApiOperation({ summary: 'Добавить бонус студенту' })
  @Post(`/bonus/:id`)
  @Roles('CEO', 'admin')
  addBones(
    @Param('id') id: string,
    @Body() data: CreateBonusStudentDto,
  ): Promise<Student> {
    return this.studentsService.addBonus(+id, data);
  }

  @ApiOperation({ summary: 'Удалить бонус студента' })
  @Delete(`/bonus/:id`)
  @Roles('CEO', 'admin')
  removeBonus(@Param('id') id: string): Promise<Student> {
    return this.studentsService.removeBonus(+id);
  }
}
