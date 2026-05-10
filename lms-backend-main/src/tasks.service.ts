import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service'; // Импорт вашего Prisma сервиса

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('59 59 23 * * *')
  async checkLessonsAndGroups() {
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    // const outdatedLessons = await this.prisma.lesson.findMany({
    //   where: { status: 'waiting', date: currentDate },
    // });

    // for (const lesson of outdatedLessons) {
    //   await this.prisma.lesson.update({
    //     where: { id: lesson.id },
    //     data: { status: 'notPassed' },
    //   });
    // }

    const groups = await this.prisma.group.findMany({
      where: { status: 'active' },
    });

    for (const group of groups) {
      const futureLessons = await this.prisma.lesson.findMany({
        where: {
          groupId: group.id,
          date: { gt: new Date() },
        },
      });

      if (futureLessons.length === 0) {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.group.update({
            where: { id: group.id },
            data: { status: 'completed' },
          });

          const groupStudents = await prisma.groupStudent.findMany({
            where: {
              groupId: group.id,
              status: 'active',
            },
            include: { student: true },
          });

          for (const groupStudent of groupStudents) {
            const activeGroupCount = await prisma.groupStudent.count({
              where: {
                studentId: groupStudent.studentId,
                status: 'active',
                group: {
                  status: { not: 'completed' },
                },
              },
            });

            if (activeGroupCount === 0) {
              await prisma.student.update({
                where: { id: groupStudent.studentId },
                data: { status: 'noActive' },
              });
            }
          }
        });
      }
    }
  }

  @Cron('0 1 10 * *')
  async processSalaries() {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'work',
        OR: [
          { salaryMentorType: { not: 'percentLesson' } },
          { salaryMentorType: null },
        ],
      },
    });

    for (const user of users) {
      let total = user.salary;

      if (user.role.includes('mentor') && user.salaryMentorType === 'fixed') {
        total += user.salaryMentor;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          availableBalance: user.balance + total,
        },
      });
    }
  }
}
