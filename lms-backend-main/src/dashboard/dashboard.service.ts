import { Injectable } from '@nestjs/common';
import { subDays, subMonths, subYears } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';

type Period = 'week' | 'month' | 'year';

function periodStart(period: Period): Date {
  const now = new Date();
  switch (period) {
    case 'week':
      return subDays(now, 7);
    case 'year':
      return subYears(now, 1);
    case 'month':
    default:
      return subMonths(now, 1);
  }
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Per-branch метрики: выручка, расход, прибыль, активные студенты, новые
   * студенты за период, должники.
   */
  async branches(period: Period) {
    const from = periodStart(period);

    const branches = await this.prisma.branch.findMany({
      orderBy: { id: 'asc' },
    });

    const result = await Promise.all(
      branches.map(async (b) => {
        const [inc, exp, activeStudents, debtors, newStudents] =
          await Promise.all([
            this.prisma.transaction.aggregate({
              _sum: { amount: true },
              where: { branchId: b.id, type: 'in', date: { gte: from } },
            }),
            this.prisma.transaction.aggregate({
              _sum: { amount: true },
              where: { branchId: b.id, type: 'out', date: { gte: from } },
            }),
            this.prisma.student.count({
              where: {
                status: 'active',
                courses: { some: { branchId: b.id } },
              },
            }),
            this.prisma.student.count({
              where: {
                balance: { lt: -200_000 },
                courses: { some: { branchId: b.id } },
              },
            }),
            this.prisma.student.count({
              where: {
                courses: { some: { branchId: b.id } },
                transactions: {
                  some: { type: 'in', date: { gte: from } },
                },
              },
            }),
          ]);

        const income = Number(inc._sum.amount ?? 0);
        const expense = Number(exp._sum.amount ?? 0);

        return {
          branchId: b.id,
          branchName: b.name,
          income,
          expense,
          profit: income - expense,
          activeStudents,
          newStudentsInPeriod: newStudents,
          debtors,
        };
      }),
    );

    return { period, from: from.toISOString(), branches: result };
  }

  /**
   * Общая сводка сети.
   */
  async summary(period: Period) {
    const from = periodStart(period);

    const [income, expense, leeds, students, newLeeds] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'in', date: { gte: from } },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'out', date: { gte: from } },
      }),
      this.prisma.leed.count(),
      this.prisma.student.count({ where: { status: 'active' } }),
      this.prisma.leed.count({
        where: { date: { gte: from } },
      }),
    ]);

    const inc = Number(income._sum.amount ?? 0);
    const exp = Number(expense._sum.amount ?? 0);

    return {
      period,
      from: from.toISOString(),
      income: inc,
      expense: exp,
      profit: inc - exp,
      totalLeeds: leeds,
      newLeedsInPeriod: newLeeds,
      activeStudents: students,
    };
  }
}
