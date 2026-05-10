import { Injectable } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, createdBy: number | null) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        assignedTo: dto.assignedTo ?? null,
        relatedEntity: dto.relatedEntity ?? null,
        relatedId: dto.relatedId ?? null,
        createdBy,
      },
    });
  }

  async update(id: number, dto: UpdateTaskDto) {
    const data: Prisma.TaskUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.dueAt !== undefined) data.dueAt = new Date(dto.dueAt);
    if (dto.assignedTo !== undefined)
      data.assignedTo = dto.assignedTo ?? null;
    if (dto.status !== undefined) data.status = dto.status;
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }

  async find(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async list(filter: {
    assignedTo?: number;
    status?: TaskStatus;
    relatedEntity?: string;
    relatedId?: number;
    mine?: boolean;
    currentUserId?: number;
  }) {
    const where: Prisma.TaskWhereInput = {};
    if (filter.mine && filter.currentUserId) {
      where.assignedTo = filter.currentUserId;
    } else if (filter.assignedTo != null) {
      where.assignedTo = Number(filter.assignedTo);
    }
    if (filter.status) where.status = filter.status;
    if (filter.relatedEntity) {
      where.relatedEntity = filter.relatedEntity;
      if (filter.relatedId != null)
        where.relatedId = Number(filter.relatedId);
    }
    return this.prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { id: 'desc' }],
      take: 200,
    });
  }

  /**
   * Для виджета "Мои задачи на сегодня/завтра".
   */
  async myAgenda(userId: number) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 1);
    end.setHours(23, 59, 59, 999);

    return this.prisma.task.findMany({
      where: {
        assignedTo: userId,
        status: { in: ['pending', 'inProgress'] },
        OR: [{ dueAt: null }, { dueAt: { lte: end } }],
      },
      orderBy: [{ dueAt: 'asc' }],
      take: 50,
    });
  }
}
