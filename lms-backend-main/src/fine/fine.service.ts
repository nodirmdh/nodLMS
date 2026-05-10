import { Injectable } from '@nestjs/common';
import { Fine, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';

@Injectable()
export class FineService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    paginationDto: PaginationDto,
    filter: any,
    user: User,
  ): Promise<PaginatedResult<Fine>> {
    const { page = 1 } = paginationDto;
    const skip = (page - 1) * 10;

    const [students, total] = await Promise.all([
      this.prisma.fine.findMany({
        where: {
          AND: [
            filter.userId ? { userId: +filter.userId } : {},
            filter.authorId ? { authorId: +filter.authorId } : {},
            filter.date ? { date: filter.date } : {},
          ],
          branchId: user.branch,
        },
        skip,
        take: 10,
        include: {
          user: true,
          author: true,
        },
      }),
      this.prisma.fine.count(),
    ]);

    return {
      data: students.map((fine) => ({
        ...fine,
        user: fine.user.fio,
        author: fine.author.fio,
      })),
      total,
      page,
      limit: 10,
    };
  }

  async findOne(id: number): Promise<Fine> {
    return await this.prisma.fine.findUnique({
      where: { id },
      include: { author: true, user: true },
    });
  }

  async findByUserId(
    paginationDto: PaginationDto,
    id: number,
  ): Promise<PaginatedResult<Fine>> {
    const { page = 1 } = paginationDto;
    const skip = (page - 1) * 10;

    const [students, total] = await Promise.all([
      this.prisma.fine.findMany({
        skip,
        take: 10,
        where: {
          userId: id,
        },
      }),
      this.prisma.fine.count(),
    ]);

    return {
      data: students,
      total,
      page,
      limit: 10,
    };
  }

  async create(data: Fine, reqUser: User): Promise<Fine> {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          availableBalance: user.availableBalance - data.amount,
          acceptedBalance:
            user.availableBalance - data.amount <= 0 ? 0 : user.acceptedBalance,
        },
      });

      return await prisma.fine.create({
        data: { ...data, branchId: reqUser.branch },
      });
    });
  }

  async update(id: number, data: Fine): Promise<Fine> {
    const fine = await this.prisma.fine.findUnique({ where: { id } });
    const user = await this.prisma.user.findUnique({
      where: { id: fine.userId },
    });
    const availableBalance = user.availableBalance + fine.amount - data.amount;

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          availableBalance,
          acceptedBalance: availableBalance <= 0 ? 0 : user.acceptedBalance,
        },
      });

      return await prisma.fine.update({ where: { id }, data });
    });
  }

  async delete(id: number): Promise<Fine> {
    const fine = await this.prisma.fine.findUnique({ where: { id } });

    const user = await this.prisma.user.findUnique({
      where: { id: fine.userId },
    });

    await this.prisma.user.update({
      where: { id: fine.userId },
      data: {
        balance: user.balance + fine.amount,
        availableBalance: user.availableBalance + fine.amount,
      },
    });

    return await this.prisma.fine.delete({ where: { id } });
  }
}
