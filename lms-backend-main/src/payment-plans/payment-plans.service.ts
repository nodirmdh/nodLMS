import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaymentPlan,
  PaymentPlanStatus,
  Prisma,
} from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMonths } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePaymentPlanDto,
  UpdatePaymentPlanItemDto,
} from './dto/payment-plan.dto';

@Injectable()
export class PaymentPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: { studentId?: number; status?: PaymentPlanStatus }) {
    return this.prisma.paymentPlan.findMany({
      where: {
        ...(filter.studentId ? { studentId: filter.studentId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      include: {
        items: { orderBy: { dueDate: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: number) {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id },
      include: { items: { orderBy: { dueDate: 'asc' } } },
    });
    if (!plan) throw new NotFoundException();
    return plan;
  }

  async create(
    dto: CreatePaymentPlanDto,
    createdBy: number | null,
  ): Promise<PaymentPlan> {
    const monthlyAmount = +(dto.totalAmount / dto.monthsCount).toFixed(2);
    const startDate = new Date(dto.startDate);

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.paymentPlan.create({
        data: {
          studentId: dto.studentId,
          totalAmount: dto.totalAmount,
          monthsCount: dto.monthsCount,
          startDate,
          comment: dto.comment ?? null,
          createdBy,
        },
      });

      const items = Array.from({ length: dto.monthsCount }, (_, i) => ({
        planId: plan.id,
        dueDate: addMonths(startDate, i),
        amount: monthlyAmount,
      }));
      // Последнюю итерацию выравниваем, чтобы сумма сошлась 1-в-1.
      const sumSoFar = monthlyAmount * (dto.monthsCount - 1);
      items[items.length - 1].amount = +(dto.totalAmount - sumSoFar).toFixed(
        2,
      );

      await tx.paymentPlanItem.createMany({ data: items });

      return plan;
    });
  }

  async updateItem(itemId: number, dto: UpdatePaymentPlanItemDto) {
    const item = await this.prisma.paymentPlanItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException();

    const data: Prisma.PaymentPlanItemUpdateInput = {};
    if (dto.paidAmount !== undefined) data.paidAmount = dto.paidAmount;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.paidTransactionId !== undefined)
      data.paidTransactionId = dto.paidTransactionId;

    // Auto: если оплачено полностью → status=paid.
    if (
      dto.paidAmount !== undefined &&
      dto.status === undefined &&
      dto.paidAmount >= item.amount
    ) {
      data.status = 'paid';
    }

    const updated = await this.prisma.paymentPlanItem.update({
      where: { id: itemId },
      data,
    });

    // Если все позиции закрыты — план помечаем completed.
    const remaining = await this.prisma.paymentPlanItem.count({
      where: {
        planId: item.planId,
        status: { notIn: ['paid', 'cancelled'] },
      },
    });
    if (remaining === 0) {
      await this.prisma.paymentPlan.update({
        where: { id: item.planId },
        data: { status: 'completed' },
      });
    }

    return updated;
  }

  async cancel(planId: number) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.paymentPlan.update({
        where: { id: planId },
        data: { status: 'cancelled' },
      });
      await tx.paymentPlanItem.updateMany({
        where: {
          planId,
          status: { in: ['pending', 'overdue'] },
        },
        data: { status: 'cancelled' },
      });
      return plan;
    });
  }

  /**
   * Отметить просроченные позиции. Гоняется раз в сутки в 03:00.
   * На multi-instance этот cron дублируется — но `updateMany` идемпотентно.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async markOverdue() {
    const now = new Date();
    await this.prisma.paymentPlanItem.updateMany({
      where: {
        status: 'pending',
        dueDate: { lt: now },
      },
      data: { status: 'overdue' },
    });
  }
}
