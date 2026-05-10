import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch, User } from '@prisma/client';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBranchDto } from './dto/create-branch.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @ApiOperation({ summary: 'Создать филиал' })
  @Post()
  @Roles('CEO')
  create(
    @Body() createBranchDto: Branch,
    @CurrentUser() user: User,
  ): Promise<Branch> {
    return this.branchesService.create(createBranchDto, user);
  }

  @ApiOperation({ summary: 'Получить все филиалы (таблица)' })
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Branch>> {
    return this.branchesService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Получить филиал' })
  @Get(':id')
  @Roles('CEO', 'admin')
  findOne(@Param('id') id: string): Promise<Branch> {
    return this.branchesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновить филиал' })
  @Patch(':id')
  @Roles('CEO')
  update(
    @Param('id') id: string,
    @Body() updateBranchDto: CreateBranchDto,
  ): Promise<Branch> {
    return this.branchesService.update(+id, updateBranchDto);
  }

  @ApiOperation({ summary: 'Удалить филиал' })
  @Delete(':id')
  @Roles('CEO')
  remove(@Param('id') id: string): Promise<Branch> {
    return this.branchesService.remove(+id);
  }
}
