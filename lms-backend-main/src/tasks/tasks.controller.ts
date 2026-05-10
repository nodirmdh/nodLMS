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
import { User, TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';
import { Roles } from '../auth/decorator/roles.decorator';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { Audit } from '../audit/audit.decorator';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@ApiTags('Tasks')
@Controller('tasks')
@Roles('CEO', 'admin', 'manager')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @ApiOperation({ summary: 'Список задач (с фильтрами)' })
  @Get()
  list(
    @Query('status') status: TaskStatus | undefined,
    @Query('mine') mine: string | undefined,
    @Query('assignedTo') assignedTo: string | undefined,
    @Query('relatedEntity') relatedEntity: string | undefined,
    @Query('relatedId') relatedId: string | undefined,
    @CurrentUser() user: User,
  ) {
    return this.tasks.list({
      status,
      mine: mine === 'true',
      assignedTo: assignedTo != null ? Number(assignedTo) : undefined,
      relatedEntity,
      relatedId: relatedId != null ? Number(relatedId) : undefined,
      currentUserId: user?.id,
    });
  }

  @ApiOperation({ summary: 'Мои задачи на сегодня-завтра' })
  @Get('agenda')
  agenda(@CurrentUser() user: User) {
    return this.tasks.myAgenda(user.id);
  }

  @ApiOperation({ summary: 'Получить задачу' })
  @Get(':id')
  async find(@Param('id', ParseIntPipe) id: number) {
    const t = await this.tasks.find(id);
    if (!t) throw new NotFoundException();
    return t;
  }

  @ApiOperation({ summary: 'Создать задачу' })
  @Post()
  @Audit({ action: 'task.create', entity: 'Task', entityIdFrom: 'result.id' })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasks.create(dto, user?.id ?? null);
  }

  @ApiOperation({ summary: 'Изменить задачу' })
  @Patch(':id')
  @Audit({ action: 'task.update', entity: 'Task' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(id, dto);
  }

  @ApiOperation({ summary: 'Удалить задачу' })
  @Delete(':id')
  @Audit({ action: 'task.delete', entity: 'Task' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasks.remove(id);
  }
}
