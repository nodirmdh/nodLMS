import { Injectable } from '@nestjs/common';
import { Leed, LeedStatus, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeedsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Leed): Promise<Leed> {
    return await this.prisma.leed.create({ data });
  }

  async findAll(fio: string, filter: any, user: User): Promise<Leed[]> {
    return await this.prisma.leed.findMany({
      where: {
        fio: {
          contains: fio,
          mode: 'insensitive',
        },
        AND: [
          filter.courseId ? { courseId: filter.courseId } : {},
          filter.authorId ? { authorId: filter.authorId } : {},
          filter.date ? { date: filter.date } : {},
          filter.startTime ? { startTime: filter.startTime } : {},
          filter.endTime ? { endTime: filter.endTime } : {},
        ],
        course: {
          branchId: user.branch,
        },
      },
      include: {
        course: true,
      },
    });
  }

  /**
   * Данные для канбана: для каждой колонки (статус) отдаём уже отсортированные
   * карточки + конверсию. Один-два запроса вместо N.
   */
  async kanban(user: User) {
    const leeds = await this.prisma.leed.findMany({
      where: {
        course: { branchId: user.branch },
      },
      include: { course: true, author: true },
      orderBy: [{ position: 'asc' }, { id: 'desc' }],
    });

    const statuses: LeedStatus[] = [
      'new',
      'waitingGroup',
      'inGroup',
      'finished',
      'refused',
    ];

    const columns = statuses.map((status) => ({
      status,
      count: 0,
      items: [] as typeof leeds,
    }));
    const byStatus = new Map(columns.map((c) => [c.status, c]));

    for (const leed of leeds) {
      const col = byStatus.get(leed.status);
      if (!col) continue;
      col.items.push(leed);
      col.count++;
    }

    return {
      columns,
      total: leeds.length,
    };
  }

  /**
   * Перетаскивание карточки: меняет status и/или position.
   * Если передан `afterPosition` — position = (prev+next)/2 для плавного
   * drag-and-drop. Здесь упрощённо: принимаем position явно от фронта
   * (@hello-pangea/dnd индексы даст).
   */
  async move(
    id: number,
    data: { status?: LeedStatus; position?: number; refusedReason?: string },
  ) {
    return this.prisma.leed.update({
      where: { id },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.position !== undefined ? { position: data.position } : {}),
        ...(data.refusedReason !== undefined
          ? { refusedReason: data.refusedReason }
          : {}),
      },
    });
  }

  async findOne(id: number): Promise<Leed> {
    return await this.prisma.leed.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, data: Leed): Promise<Leed> {
    return await this.prisma.leed.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Leed> {
    return await this.prisma.leed.delete({
      where: { id },
    });
  }
}
