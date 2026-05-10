import { Injectable } from '@nestjs/common';
import { Bonus, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';

@Injectable()
export class BonusService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    paginationDto: PaginationDto,
    filter: any,
    user: User,
  ): Promise<PaginatedResult<Bonus>> {
    const { page = 1 } = paginationDto;
    const skip = (page - 1) * 10;

    const [students, total] = await Promise.all([
      this.prisma.bonus.findMany({
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
      this.prisma.bonus.count(),
    ]);

    return {
      data: students,
      total,
      page,
      limit: 10,
    };
  }

  async findOne(id: number): Promise<Bonus> {
    return await this.prisma.bonus.findUnique({
      where: { id },
      include: { author: true, user: true },
    });
  }

  async findByUserId(
    paginationDto: PaginationDto,
    id: number,
  ): Promise<PaginatedResult<Bonus>> {
    const { page = 1 } = paginationDto;
    const skip = (page - 1) * 10;

    const [students, total] = await Promise.all([
      this.prisma.bonus.findMany({
        skip,
        take: 10,
        where: {
          userId: id,
        },
      }),
      this.prisma.bonus.count(),
    ]);

    return {
      data: students,
      total,
      page,
      limit: 10,
    };
  }

  async create(data: Bonus, reqUser: User): Promise<Bonus> {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          availableBalance: user.availableBalance + data.amount,
          acceptedBalance:
            user.availableBalance + data.amount <= 0 ? 0 : user.acceptedBalance,
        },
      });

      return await this.prisma.bonus.create({
        data: { ...data, branchId: reqUser.branch },
      });
    });
  }

  async update(id: number, data: Bonus): Promise<Bonus> {
    const bonus = await this.prisma.bonus.findUnique({ where: { id } });
    const user = await this.prisma.user.findUnique({
      where: { id: bonus.userId },
    });
    const balance = user.balance - bonus.amount + data.amount;
    const availableBalance = user.availableBalance - bonus.amount + data.amount;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        availableBalance,
        acceptedBalance: availableBalance <= 0 ? 0 : user.acceptedBalance,
      },
    });

    return await this.prisma.bonus.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Bonus> {
    const bonus = await this.prisma.bonus.findUnique({ where: { id } });

    const user = await this.prisma.user.findUnique({
      where: { id: bonus.userId },
    });

    await this.prisma.user.update({
      where: { id: bonus.userId },
      data: {
        balance: user.balance - bonus.amount,
        availableBalance: user.availableBalance - bonus.amount,
      },
    });

    return await this.prisma.bonus.delete({ where: { id } });
  }
}
