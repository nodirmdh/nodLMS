import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Branch, Prisma, User } from '@prisma/client';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Branch, user: User): Promise<Branch> {
    return await this.prisma.$transaction(async (prisma) => {
      const branch = await prisma.branch.create({ data });

      if (branch) {
        if (user.id !== 1) {
          await prisma.userBranch.create({
            data: {
              userId: 1,
              branchId: branch.id,
            },
          });

          await prisma.userBranch.create({
            data: {
              userId: user.id,
              branchId: branch.id,
            },
          });
        } else {
          await prisma.userBranch.create({
            data: {
              userId: user.id,
              branchId: branch.id,
            },
          });
        }
      }
      return branch;
    });
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Branch>> {
    const { page = 1 } = paginationDto;
    const skip = (page - 1) * 10;

    const [users, total] = await Promise.all([
      this.prisma.branch.findMany({
        skip,
        take: 10,
        include: {
          users: true,
          courses: true,
        },
      }),
      this.prisma.branch.count(),
    ]);

    return {
      data: users,
      total,
      page,
      limit: 10,
    };
  }

  async findOne(id: number): Promise<Branch> {
    return this.prisma.branch.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.BranchUpdateInput): Promise<Branch> {
    return this.prisma.branch.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Branch> {
    return this.prisma.branch.delete({ where: { id } });
  }
}
