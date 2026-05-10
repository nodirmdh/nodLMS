import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Создать сотрудника' })
  @Post()
  @Roles('CEO')
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Получить всех сотрудников' })
  @Get()
  @Roles('CEO', 'admin', 'manager')
  findAll(
    @Query('fio') fio: string,
    @Query() filter: { branchId: number; status: string; roles: string },
    @CurrentUser() user: User,
  ): Promise<User[]> {
    const rolesArray = filter.roles
      ? JSON.parse(filter.roles)
      : ['CEO', 'admin', 'manager', 'mentor', 'assistent'];

    return this.usersService.findAll(fio, { ...filter, rolesArray }, user);
  }

  @Get('/responsibles')
  @Roles('CEO', 'admin', 'manager')
  findResponsibles() {
    return this.usersService.findResponsibles();
  }

  @ApiOperation({ summary: 'Получить сотрудника' })
  @Get('/:id')
  @Roles('CEO', 'admin', 'manager')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновить сотрудника' })
  @Patch('/:id')
  @Roles('CEO')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: 'Уволить сотрудника' })
  @Patch('/dismiss/:id')
  @Roles('CEO')
  dismiss(@Param('id') id: string): Promise<User> {
    return this.usersService.update(+id, { status: 'noWork' });
  }

  @ApiOperation({ summary: 'Обновить свой настройки' })
  @Patch('/:id/settings')
  // @Roles('CEO')
  updateSettings(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.usersService.updateSettings(+id, updateSettingsDto, user);
  }
}
