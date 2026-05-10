import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { JOB_NAMES, QUEUE_NAMES } from '../queues/queue.constants';

/**
 * Worker for scheduled housekeeping jobs.
 *
 * Когда-то всё это жило в @nestjs/schedule + TasksService и при
 * multi-instance deploy начнёт срабатывать N раз. BullMQ repeat-jobs
 * гарантируют ровно один запуск по cron-ключу на кластер.
 *
 * Реализации перенесены 1:1 из TasksService — бизнес-логики не меняли.
 */
@Processor(QUEUE_NAMES.SCHEDULER, { concurrency: 1 })
export class SchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger('SchedulerProcessor');

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case JOB_NAMES.SCHEDULER.CLOSE_COMPLETED_GROUPS:
        return this.closeCompletedGroups();
      case JOB_NAMES.SCHEDULER.PROCESS_SALARIES:
        return this.processSalaries();
      default:
        throw new Error(`Unknown scheduler job: ${job.name}`);
    }
  }

  private async closeCompletedGroups() {
    const groups = await this.prisma.group.findMany({
      where: { status: 'active' },
    });

    let closed = 0;
    let deactivatedStudents = 0;

    for (const group of groups) {
      const futureLessons = await this.prisma.lesson.findMany({
        where: {
          groupId: group.id,
          date: { gt: new Date() },
        },
      });

      if (futureLessons.length > 0) continue;

      await this.prisma.$transaction(async (prisma) => {
        await prisma.group.update({
          where: { id: group.id },
          data: { status: 'completed' },
        });
        closed++;

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
            deactivatedStudents++;
          }
        }
      });
    }

    this.logger.log(
      `closeCompletedGroups: closed=${closed} deactivated=${deactivatedStudents}`,
    );
    return { closed, deactivatedStudents };
  }

  private async processSalaries() {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'work',
        OR: [
          { salaryMentorType: { not: 'percentLesson' } },
          { salaryMentorType: null },
        ],
      },
    });

    let processed = 0;
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
      processed++;
    }

    this.logger.log(`processSalaries: processed=${processed}`);
    return { processed };
  }
}
