import { Injectable } from '@nestjs/common';
import { Leed, User } from '@prisma/client';
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
