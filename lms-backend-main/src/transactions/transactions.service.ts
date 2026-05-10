import { BadRequestException, Injectable } from '@nestjs/common';
import { Mentor, Student, Transaction, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { parse } from 'date-fns';

import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { SMSService } from 'src/sms/sms.service';
@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private smsService: SMSService,
  ) {}

  async findAllDebtors(user: User): Promise<Student[]> {
    const result = await this.prisma.student.findMany({
      where: {
        balance: {
          lt: -200000,
        },
        courses: {
          some: {
            branchId: user.branch,
          },
        },
      },
      orderBy: {
        balance: 'asc',
      },
    });

    return result;
  }

  async findAll(
    paginationDto: PaginationDto,
    type: any,
    filter: any,
    user: User,
  ): Promise<any> {
    const { page = 1 } = paginationDto;
    const skip = (page - 1) * 10;

    if (type.type !== 'in' && type.type !== 'out') {
      throw new BadRequestException(`type can be IN or OUT`);
    }

    let dateFilter = {};

    if (filter.date) {
      const parsedDate = parse(filter.date, 'dd.MM.yyyy', new Date());

      const dateAtMidnight = new Date(
        Date.UTC(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate(),
        ),
      );

      const startDateUTC = new Date(
        Date.UTC(
          dateAtMidnight.getUTCFullYear(),
          dateAtMidnight.getUTCMonth(),
          1,
          0,
          0,
          0,
          0,
        ),
      );
      const endDateUTC = new Date(
        Date.UTC(
          dateAtMidnight.getUTCFullYear(),
          dateAtMidnight.getUTCMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        ),
      );

      dateFilter = { date: { gte: startDateUTC, lte: endDateUTC } };
    }

    const where = {
      AND: [
        filter.userId ? { userId: filter.userId } : {},
        filter.authorId ? { authorId: filter.authorId } : {},
        type ? { type: type.type } : {},
        dateFilter,
        filter.expenseType ? { expenseType: filter.expenseType } : {},
        filter.profitType ? { profitType: filter.profitType } : {},
        filter.paymentType ? { paymentType: filter.paymentType } : {},
      ],
      branchId: user.branch,
    };

    const [transactions, total] = await Promise.all([
      await this.prisma.transaction.findMany({
        skip,
        take: 10,
        where,
        include: {
          author: true,
          student: true,
          user: true,
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const totalIncome = await this.prisma.transaction.aggregate({
      _sum: {
        amount: true, // Замените "amount" на поле, которое хранит сумму транзакции
      },
      where: {
        AND: [
          { type: 'in' },
          dateFilter,
          { branchId: user.branch },
          filter.userId ? { userId: filter.userId } : {},
          filter.authorId ? { authorId: filter.authorId } : {},
        ],
      },
    });

    // Суммирование расходов (type: 'out')
    const totalExpense = await this.prisma.transaction.aggregate({
      _sum: {
        amount: true, // Замените "amount" на поле, которое хранит сумму транзакции
      },
      where: {
        AND: [
          { type: 'out' },
          dateFilter,
          { branchId: user.branch },
          filter.userId ? { userId: filter.userId } : {},
          filter.authorId ? { authorId: filter.authorId } : {},
        ],
      },
    });

    return {
      data: transactions,
      total,
      page,
      limit: 10,
      in: totalIncome._sum.amount,
      out: totalExpense._sum.amount,
      balance: totalIncome._sum.amount - totalExpense._sum.amount,
    };
  }

  async findOne(id: number): Promise<Transaction> {
    return await this.prisma.transaction.findUnique({
      where: { id },
      include: { author: true, student: true, user: true },
    });
  }

  async create(data: Transaction, user: User): Promise<Transaction> {
    const trans = await this.prisma.transaction.create({
      data: { ...data, branchId: user.branch },
    });

    if (data.profitType === 'payment') {
      const student = await this.prisma.student.findUnique({
        where: { id: data.studentId },
      });

      return await this.prisma.$transaction(async (prisma) => {
        const updatedStudent = await prisma.student.update({
          where: {
            id: student.id,
          },
          data: {
            balance: student.balance + data.amount,
          },
        });

        // Взнос толеди
        if (data.userId && data.userId !== null) {
          const user = await prisma.user.findUnique({
            where: { id: data.userId },
          });

          const amount = data.amount * (user.salaryMentor / 100);

          const availableBalance = user.availableBalance;
          const acceptedBalance = user.acceptedBalance;
          const balance = user.balance;

          if (availableBalance < 0 && availableBalance + amount >= 0) {
            await prisma.user.update({
              where: { id: data.userId },
              data: {
                availableBalance: availableBalance + amount,
                acceptedBalance:
                  ((availableBalance + amount) * 100) / user.salaryMentor,
                balance: balance - amount,
              },
            });
          } else {
            await prisma.user.update({
              where: { id: data.userId },
              data: {
                availableBalance: availableBalance + amount,
                acceptedBalance: acceptedBalance + data.amount,
                balance: balance - amount,
              },
            });
          }

          return await this.smsService.sendPayment({
            ...updatedStudent,
            amount: data.amount,
            date: data.date,
          });
        } else {
          return await this.smsService.sendPayment({
            ...updatedStudent,
            amount: data.amount,
            date: data.date,
          });
        }
      });
    } else if (data.expenseType === 'salary') {
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (user.salaryMentorType === 'percentLesson') {
        const acceptedAmount =
          user.acceptedBalance - (data.amount * 100) / user.salaryMentor;

        // Айлык алып атр
        if (user.availableBalance - data.amount === 0) {
          await this.prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              availableBalance: 0,
              acceptedBalance: 0,
            },
          });
        } else {
          await this.prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              availableBalance: user.availableBalance - data.amount,
              acceptedBalance: acceptedAmount <= 0 ? 0 : acceptedAmount,
            },
          });
        }
      } else {
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            availableBalance: user.availableBalance - data.amount,
          },
        });
      }
    }

    return trans;
  }

  async update(id: number, data: Transaction): Promise<Transaction> {
    const trans = await this.prisma.transaction.findUnique({ where: { id } });

    if (trans.type === 'in') {
      if (trans.profitType === 'payment') {
        const student = await this.prisma.student.findUnique({
          where: { id: trans.studentId },
        });
        const studentBalance = student.balance - trans.amount + data.amount;

        return await this.prisma.$transaction(async (prisma) => {
          await prisma.student.update({
            where: { id: student.id },
            data: {
              balance: studentBalance,
            },
          });

          if (trans.userId && trans.userId !== null) {
            const user = await prisma.user.findUnique({
              where: { id: trans.userId },
            });
            const amount = data.amount * (user.salaryMentor / 100);

            const acceptedBalance =
              user.acceptedBalance - trans.amount + data.amount;
            const balance =
              user.balance + trans.amount * (user.salaryMentor / 100) - amount;
            const availableBalance =
              user.availableBalance -
              trans.amount * (user.salaryMentor / 100) +
              amount;

            await prisma.user.update({
              where: { id: user.id },
              data: {
                balance,
                availableBalance,
                acceptedBalance: availableBalance === 0 ? 0 : acceptedBalance,
              },
            });

            return await prisma.transaction.update({ where: { id }, data });
          } else {
            return await prisma.transaction.update({ where: { id }, data });
          }
        });
      } else {
        return await this.prisma.transaction.update({ where: { id }, data });
      }
    } else if (trans.type === 'out') {
      if (trans.expenseType === 'salary') {
        return await this.prisma.$transaction(async (prisma) => {
          const user = await prisma.user.findUnique({
            where: { id: trans.userId },
          });

          const oldAvailableBalance = user.availableBalance + trans.amount;

          const acceptedAmount =
            user.acceptedBalance - (data.amount * 100) / user.salaryMentor;

          // Айлык алып атр
          if (oldAvailableBalance - data.amount === 0) {
            await this.prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                availableBalance: 0,
                acceptedBalance: 0,
              },
            });
          } else {
            await this.prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                availableBalance: oldAvailableBalance - data.amount,
                acceptedBalance: acceptedAmount <= 0 ? 0 : acceptedAmount,
              },
            });
          }
          return await prisma.transaction.update({ where: { id }, data });
        });
      } else {
        return await this.prisma.transaction.update({ where: { id }, data });
      }
    }
  }
}
