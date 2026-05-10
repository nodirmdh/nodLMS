import { BadRequestException, Injectable } from '@nestjs/common';
import { Student } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { PaginatedResult } from 'src/shared/types/paginated-result.type';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateBonusStudentDto } from './dto/create-bonus.student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStudentDto): Promise<Student> {
    const { groups, leadId, ...studentData } = data;
    const student = await this.prisma.student.create({ data: studentData });

    for (const group of groups) {
      const groupId = +group.groupId;

      const groupStudent = await this.prisma.groupStudent.findUnique({
        where: {
          groupId_studentId: {
            groupId,
            studentId: student.id,
          },
        },
      });

      if (!groupStudent) {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.groupStudent.create({
            data: {
              group: { connect: { id: groupId } },
              student: { connect: { id: student.id } },
              discount: group.discount,
              status: 'active',
            },
          });

          const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: {
              groupStudents: {
                connect: {
                  groupId_studentId: {
                    groupId,
                    studentId: student.id,
                  },
                },
              },
            },
          });

          await prisma.course.update({
            where: { id: updatedGroup.courseId },
            data: {
              students: {
                connect: { id: student.id },
              },
            },
          });
        });
      }
    }

    if (leadId) {
      await this.prisma.leed.delete({ where: { id: leadId } });
    }

    return student;
  }

  async findAll(
    paginationDto: PaginationDto,
    filter: any,
  ): Promise<PaginatedResult<Student>> {
    const { page = 1 } = paginationDto;
    const skip = (page - 1) * 10;

    const where: any = {
      AND: [
        filter.status ? { status: filter.status } : {},
        filter.groupId
          ? { groupStudents: { some: { groupId: +filter.groupId } } }
          : {},
        filter.courseId ? { courses: { some: { id: +filter.courseId } } } : {},
        filter.fio
          ? { fio: { contains: filter.fio, mode: 'insensitive' } }
          : {},
        filter.branchId !== 'all'
          ? {
              courses: {
                some: {
                  branchId: +filter.branchId,
                },
              },
            }
          : {},
      ],
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        skip,
        take: 10,
        where,
        include: {
          courses: true,
        },
        orderBy: {
          id: 'desc', // Сортировка по дате создания в обратном порядке
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      total,
      page,
      limit: 10,
    };
  }

  async find(id: number): Promise<any> {
    return await this.prisma.student.findUnique({
      where: { id },
      include: {
        groupStudents: { include: { group: true } },
        courses: true,
        lessons: { include: { lesson: true } },
        examGrades: {
          include: { exam: true },
        },
        transactions: true,
        bonuses: true,
      },
    });
  }

  async update(id: number, data: any): Promise<Student> {
    const { groups, ...studentData } = data;
    // Получить существующие groupStudents из базы данных
    const existingGroupStudents = await this.prisma.groupStudent.findMany({
      where: { studentId: id },
    });

    const actualGroupsIds = groups.map((gs) => +gs.groupId);
    const existingGroupIds = existingGroupStudents.map((gs) => gs.groupId);

    // Обновить статус для тех, которые есть в базе данных, но нет в новом запросе
    for (const groupId of existingGroupIds) {
      if (!actualGroupsIds.includes(groupId)) {
        await this.prisma.groupStudent.update({
          where: {
            groupId_studentId: { groupId, studentId: id },
          },
          data: { status: 'stopped' },
        });
      }
    }

    // Обновить или создать записи для новых групп
    for (const newGroup of groups) {
      const groupStudent = existingGroupStudents.find(
        (gs) => +gs.groupId === +newGroup.groupId,
      );

      if (groupStudent) {
        // Обновить существующую запись
        await this.prisma.groupStudent.update({
          where: {
            groupId_studentId: { groupId: +newGroup.groupId, studentId: id },
          },
          data: { status: 'active', discount: newGroup.discount },
        });
      } else {
        // Создать новую запись
        await this.prisma.$transaction(async (prisma) => {
          const updatedGroup = await prisma.groupStudent.create({
            data: {
              group: { connect: { id: +newGroup.groupId } },
              student: { connect: { id } },
              discount: newGroup.discount,
              status: 'active',
            },
          });

          const getGroup = await prisma.group.findUnique({
            where: { id: updatedGroup.groupId },
          });

          await prisma.course.update({
            where: { id: getGroup.courseId },
            data: {
              students: {
                connect: { id },
              },
            },
          });
        });
      }
    }

    if (groups.length === 0) {
      studentData.status = 'noActive';
    } else {
      studentData.status = 'active';
    }

    return this.prisma.student.update({
      where: { id },
      data: studentData,
    });
  }

  async addBonus(id: number, data: CreateBonusStudentDto): Promise<any> {
    return await this.prisma.$transaction(async (prisma) => {
      const student = await prisma.student.findUnique({
        where: { id },
      });

      if (data.userId) {
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
        });

        if (user.salaryMentorType === 'percentLesson') {
          const bonus = await prisma.studentBonus.create({
            data: {
              ...data,
              studentId: id,
              mentorPercent: user.salaryMentor,
            },
          });

          await prisma.student.update({
            where: { id },
            data: {
              balance: student.balance + data.amount,
            },
          });

          const amount = data.amount * (user.salaryMentor / 100);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              balance: user.balance - amount,
            },
          });

          return bonus;
        } else {
          throw new BadRequestException(
            'Salary Mentor type must be PercentLesson',
          );
        }
      } else {
        const bonus = await prisma.studentBonus.create({
          data: {
            ...data,
            studentId: id,
          },
        });

        await prisma.student.update({
          where: { id },
          data: {
            balance: student.balance + data.amount,
          },
        });

        return bonus;
      }
    });
  }
  async removeBonus(id: number): Promise<any> {
    return await this.prisma.$transaction(async (prisma) => {
      const bonus = await prisma.studentBonus.findUnique({
        where: { id },
      });

      const student = await prisma.student.findUnique({
        where: { id: bonus.studentId },
      });

      await prisma.studentBonus.delete({
        where: { id },
      });

      await prisma.student.update({
        where: { id: student.id },
        data: {
          balance: student.balance - bonus.amount,
        },
      });

      if (bonus.userId) {
        const user = await prisma.user.findUnique({
          where: { id: bonus.userId },
        });

        const amount = bonus.amount * (bonus.mentorPercent / 100);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            balance: user.balance + amount,
          },
        });

        return bonus;
      }

      return bonus;
    });
  }
}
