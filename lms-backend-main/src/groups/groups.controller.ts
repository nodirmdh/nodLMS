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
import { Group, GroupStatus, User } from '@prisma/client';
import { GroupsService } from './groups.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ summary: 'Создать группу' })
  @Post()
  create(@Body() data: Group) {
    return this.groupsService.create(data);
  }

  @ApiOperation({ summary: 'Получить все группы (таблица)' })
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query()
    filter: {
      status: string;
      mentorId: number;
      courseId: number;
    },
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<Group>> {
    return this.groupsService.findAll(paginationDto, filter, user);
  }

  @ApiOperation({ summary: 'Получить все группы (SELECT)' })
  @Post('/select')
  findAllSelect(
    @Body()
    body: { statuses: GroupStatus[] },
    @CurrentUser() user: User,
  ): Promise<Group[]> {
    return this.groupsService.finAllSelect(body.statuses, user);
  }

  @ApiOperation({ summary: 'Получить группу' })
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Журнал уроков по дате' })
  @Get('/:id/lessons')
  getGroupsLesson(@Param('id') id: string, @Query('date') date: string) {
    return this.groupsService.getGroupsLessons(+id, date);
  }

  @ApiOperation({ summary: 'Получить группу' })
  @Get('/lessons/:id')
  findOneLessons(@Param('id') id: string, @Query('page') page: string) {
    return this.groupsService.findOneLessons(+id, +page);
  }

  @ApiOperation({ summary: 'Изменить группу' })
  @Patch('/:id')
  update(@Param('id') id: string, @Body() data: Group) {
    return this.groupsService.update(+id, data);
  }

  @ApiOperation({ summary: 'Удалить группу' })
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Patch(':id/start-group')
  async startGroup(@Param('id') id: string) {
    return await this.groupsService.activateGroup(+id);
  }

  // @Post("/:id/add-student")
  // async addStudent(@Param("id") id: string, @Body() student: Student) {
  //   return await this.groupsService.addStudent(+id, student)
  // }

  // @Post("/:id/remove-student")
  // async removeStudent(@Param("id") id: string, @Body() student: Student) {
  //   return await this.groupsService.removeStudent(+id, student)
  // }
}
