import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';

/**
 * Legacy @nestjs/schedule-based cron.
 *
 * Если выставлен `SCHEDULER_VIA_QUEUE=true`, эти обработчики no-op'ают,
 * чтобы не запускать ту же работу дважды (BullMQ repeat делает её в
 * SchedulerProcessor). В dev по умолчанию обе опции выставляются явно:
 * `SCHEDULER_VIA_QUEUE=true` → TasksService молчит, BullMQ работает.
 *
 * Почему оставили класс: @nestjs/schedule всё ещё может быть нужен для
 * in-process задач (например, метрик в памяти). Когда все cron'ы
 * переедут, модуль и сервис можно удалить полностью.
 */
@Injectable()
export class CronTasksService {
  private readonly logger = new Logger('CronTasksService');

  constructor(private readonly prisma: PrismaService) {}

  private useQueue(): boolean {
    return process.env.SCHEDULER_VIA_QUEUE === 'true';
  }

  @Cron('59 59 23 * * *')
  async checkLessonsAndGroups() {
    if (this.useQueue()) return; // делает SchedulerProcessor

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
            where: { groupId: group.id, status: 'active' },
            include: { student: true },
          });

          for (const gs of groupStudents) {
            const activeGroupCount = await prisma.groupStudent.count({
              where: {
                studentId: gs.studentId,
                status: 'active',
                group: { status: { not: 'completed' } },
              },
            });

            if (activeGroupCount === 0) {
              await prisma.student.update({
                where: { id: gs.studentId },
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
    if (this.useQueue()) return; // делает SchedulerProcessor

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
      let total = user.salary ?? 0;

      if (user.role.includes('mentor') && user.salaryMentorType === 'fixed') {
        total += user.salaryMentor ?? 0;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          availableBalance: (user.balance ?? 0) + total,
        },
      });
    }
  }
}
