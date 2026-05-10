import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

export interface DebtorRow {
  id: number;
  fio: string;
  phone: string;
  fatherPhone: string | null;
  montherPhone: string | null;
  balance: number;
  /** Сколько дней в долгу — условная оценка. */
  overdueDays: number | null;
  /** Bucket для сегментации: 0-29 / 30-59 / 60-89 / 90+. */
  bucket: '0-29' | '30-59' | '60-89' | '90+';
}

@Injectable()
export class DebtorsService {
  private readonly logger = new Logger('DebtorsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  /**
   * Список должников филиала.
   *
   * `overdueDays` считаем по дате последней входящей транзакции:
   * чем больше дней с последнего платежа, тем старее долг.
   * Если платежей вообще не было — `overdueDays = null`, bucket `30-59`
   * как дефолт (предположение о 30+ днях).
   */
  async list(
    user: { branch?: number | null },
    filter: { bucket?: string; minDebt?: number },
  ): Promise<DebtorRow[]> {
    const threshold = -Math.abs(filter.minDebt ?? 200_000);

    const students = await this.prisma.student.findMany({
      where: {
        balance: { lt: threshold },
        ...(user.branch
          ? { courses: { some: { branchId: user.branch } } }
          : {}),
      },
      orderBy: { balance: 'asc' },
      include: {
        transactions: {
          where: { type: 'in' },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    const now = Date.now();
    const rows = students.map<DebtorRow>((s) => {
      const lastPaid = s.transactions[0]?.date;
      const overdueDays = lastPaid
        ? Math.floor((now - new Date(lastPaid).getTime()) / 86_400_000)
        : null;

      let bucket: DebtorRow['bucket'];
      if (overdueDays == null) bucket = '30-59';
      else if (overdueDays < 30) bucket = '0-29';
      else if (overdueDays < 60) bucket = '30-59';
      else if (overdueDays < 90) bucket = '60-89';
      else bucket = '90+';

      return {
        id: s.id,
        fio: s.fio,
        phone: s.phone,
        fatherPhone: s.fatherPhone ?? null,
        montherPhone: s.montherPhone ?? null,
        balance: Number(s.balance ?? 0),
        overdueDays,
        bucket,
      };
    });

    if (filter.bucket) {
      return rows.filter((r) => r.bucket === filter.bucket);
    }
    return rows;
  }

  /**
   * Массовая рассылка SMS-напоминаний об оплате. Через Notification Hub
   * (шаблон `debt.reminder`). Каждый номер — отдельное сообщение → отдельный
   * job → отдельный retry.
   */
  async sendReminders(
    user: { branch?: number | null },
    input: { studentIds?: number[]; bucket?: string },
  ): Promise<{ enqueued: number; skipped: number }> {
    const students = await this.prisma.student.findMany({
      where: {
        id: input.studentIds?.length
          ? { in: input.studentIds }
          : undefined,
        balance: { lt: 0 },
        ...(user.branch
          ? { courses: { some: { branchId: user.branch } } }
          : {}),
      },
    });

    const jobs: Array<{
      code: string;
      channel: 'sms';
      recipient: string;
      variables: Record<string, unknown>;
      meta: Record<string, unknown>;
    }> = [];

    for (const s of students) {
      const amount = Math.ceil(Math.abs(Number(s.balance ?? 0)) / 1000) * 1000;
      const pretty = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      const vars = {
        student: { fio: s.fio },
        amount: pretty,
      };
      const meta = { kind: 'debt.reminder', studentId: s.id };

      for (const phone of [s.fatherPhone, s.montherPhone, s.phone]) {
        if (!phone) continue;
        jobs.push({
          code: 'debt.reminder',
          channel: 'sms',
          recipient: phone,
          variables: vars,
          meta,
        });
      }
    }

    if (!jobs.length) return { enqueued: 0, skipped: 0 };

    await Promise.all(
      jobs.map((j) =>
        this.notifications
          .sendFromTemplate(j as any)
          .catch((err) =>
            this.logger.warn(
              `debt reminder enqueue failed (${j.recipient}): ${
                err instanceof Error ? err.message : err
              }`,
            ),
          ),
      ),
    );

    return { enqueued: jobs.length, skipped: 0 };
  }
}
