import { ForbiddenException, Injectable } from '@nestjs/common';
import { Mentor, MentorStatus, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MentorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: any, user: User): Promise<Mentor[]> {
    const where: any = {
      AND: [
        filter.courseId ? { courses: { some: { id: +filter.courseId } } } : {},
        filter.status !== undefined ? { status: filter.status } : {},
        filter.branchId
          ? { user: { branches: { some: { branchId: +filter.branchId } } } }
          : {},
        filter.fio
          ? { user: { fio: { contains: filter.fio, mode: 'insensitive' } } }
          : {},
      ].filter((condition) => Object.keys(condition).length > 0),
      user: {
        branches: {
          some: {
            branchId: user.branch,
          },
        },
      },
    };

    return await this.prisma.mentor.findMany({
      where,
      include: { user: true, groups: { include: { course: true } } },
    });
  }

  async findOne(id: number, user: User): Promise<any> {
    const reqUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    const mentor = await this.prisma.mentor.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            bonusesReceived: true,
            finesReceived: true,
            transactions: { where: { type: 'out' } },
          },
        },
        groups: true,
        courses: true,
      },
    });

    if (
      reqUser.role.length === 1 &&
      reqUser.role.includes('mentor') &&
      reqUser.id === id
    ) {
      throw new ForbiddenException();
    } else {
      const lessons = await this.prisma.mentor.findUnique({
        where: { id },
        include: {
          lessons: { include: { mentor: true } },
          user: true,
        },
      });

      const studentBonuses = await this.prisma.studentBonus.findMany({
        where: { userId: mentor.userId },
      });

      return { ...mentor, lessons: lessons.lessons, studentBonuses };
    }
  }

  async changeStatus(id: string): Promise<Mentor> {
    return await this.prisma.mentor.update({
      where: { id: Number(id) },
      data: {},
    });
  }

  async getPercentMentors(user: User): Promise<any> {
    const result = await this.prisma.mentor.findMany({
      where: {
        user: {
          salaryMentorType: 'percentLesson',
          branches: {
            some: {
              branchId: user.branch,
            },
          },
        },
      },
      include: {
        user: true,
        courses: true,
      },
    });

    if (result.length !== 0) {
      return result.map((mentor) => ({
        value: mentor.userId,
        label: `${mentor.user.fio} - (${mentor.courses.map((course) => course.name).join(', ')})`,
      }));
    } else {
      return result;
    }
  }

  async getSelect(status: MentorStatus, user: User): Promise<any> {
    const mentors = await this.prisma.mentor.findMany({
      where: {
        AND: [status ? { status } : {}],
      },
      include: {
        user: true,
      },
    });

    return mentors.map((mentor) => ({
      value: mentor.id,
      label: mentor.user.fio,
    }));
  }
}
