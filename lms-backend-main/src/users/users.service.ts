import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    try {
      const { branches, ...userData } = data;

      const user = await this.prisma.user.create({
        data: userData,
      });

      if (user.role.includes('mentor')) {
        try {
          await this.prisma.mentor.create({
            data: {
              userId: user.id,
            },
          });
        } catch (e) {
          return e;
        }
      }

      if (branches) {
        const userBranches = branches.map((branch) => ({
          userId: user.id,
          branchId: Number(branch),
        }));

        try {
          await this.prisma.userBranch.createMany({
            data: userBranches,
          });
        } catch (e) {
          return e;
        }
      }

      return user;
    } catch (error) {
      return error;
    }
  }

  async findAll(fio: string, filter: any, user: User): Promise<User[]> {
    const where: any = {
      AND: [
        filter.status ? { status: filter.status } : {},
        filter.branchId
          ? { branches: { some: { branchId: +filter.branchId } } }
          : {},
        filter.role ? { role: { hasSome: [filter.role] } } : {},
        fio ? { fio: { contains: fio, mode: 'insensitive' } } : {},
      ],
      branches: {
        some: {
          branchId: user.branch,
        },
      },
    };

    return await this.prisma.user
      .findMany({
        where,
        include: {
          branches: { include: { branch: true } },
        },
        orderBy: {
          id: 'asc',
        },
      })
      .then((users) =>
        users.map((user) => ({
          ...user,
          branches: user.branches.map((branch) => branch.branch),
        })),
      );
  }

  async findOne(id: number): Promise<any> {
    return await this.prisma.user
      .findUnique({
        where: { id },
        include: {
          branches: { include: { branch: true } },
          transactions: { where: { type: 'out' } },
          authorTransactions: true,
          bonusesReceived: true,
          finesReceived: true,
        },
      })
      .then((result) => ({
        ...result,
        branches: result.branches.map((branch) => branch.branch),
      }));
  }

  async findByPhone(phone: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findResponsibles() {
    const users = await this.prisma.user.findMany();

    return users
      .filter((user) => {
        // Check if the role array contains more than just "mentor"
        return !(user.role.length === 1 && user.role.includes('mentor'));
      })
      .map((user) => ({ value: user.id, label: user.fio }));
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    try {
      const { branches, ...userData } = data;

      if (id === 1 && data.role && !data.role.includes('CEO')) {
        throw new ForbiddenException('rolePermisson');
      }

      const user = await this.prisma.user
        .update({
          where: { id },
          data: userData,
        })
        .then(async (result) => {
          if (result.role.includes('mentor')) {
            const mentor = await this.prisma.mentor.findUnique({
              where: {
                userId: result.id,
              },
            });

            if (!mentor) {
              try {
                await this.prisma.mentor.create({
                  data: {
                    userId: result.id,
                  },
                });
              } catch (e) {
                return e;
              }
            } else {
              await this.prisma.mentor.update({
                where: {
                  id: mentor.id,
                },
                data: {
                  status: 'noActive',
                },
              });
            }
          }

          return result;
        })
        .catch((e) => {
          throw new Error('Ошибка обновление сотрудника');
        });

      if (branches) {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.userBranch.deleteMany({
            where: { userId: user.id },
          });

          const userBranches = branches.map((branch: string) => ({
            userId: user.id,
            branchId: Number(branch),
          }));

          await prisma.userBranch.createMany({
            data: userBranches,
          });
        });
      }

      return user;
    } catch (error) {
      return error;
    }
  }

  async updateSettings(
    id: number,
    data: UpdateSettingsDto,
    user: User,
  ): Promise<User> {
    const userDB = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (user.id !== userDB.id) {
      throw new ForbiddenException();
    }

    if (!user) {
      throw new NotFoundException();
    }

    return await this.prisma.user.update({
      where: {
        id: userDB.id,
      },
      data,
    });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
