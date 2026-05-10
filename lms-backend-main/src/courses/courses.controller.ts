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
import { CoursesService } from './courses.service';
import { Course, User } from '@prisma/client';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create-course.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Создать курс' })
  @Post()
  @Roles('CEO')
  create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @ApiOperation({ summary: 'Получить все курсы' })
  @Get()
  findAll(@CurrentUser() user: User): Promise<Course[]> {
    return this.coursesService.findAll(user);
  }

  @ApiOperation({ summary: 'Получить курс' })
  @Get('/:id')
  find(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Изменить курс' })
  @Patch(':id')
  @Roles('CEO')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: Course,
  ): Promise<Course> {
    return this.coursesService.update(+id, updateCourseDto);
  }

  @ApiOperation({ summary: 'Удалить курс' })
  @Delete(':id')
  @Roles('CEO')
  remove(@Param('id') id: string): Promise<Course> {
    return this.coursesService.remove(+id);
  }
}
