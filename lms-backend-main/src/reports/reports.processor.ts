import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as ExcelJS from 'exceljs';
import Redis from 'ioredis';
import { format, parse } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { JOB_NAMES, QUEUE_NAMES } from '../queues/queue.constants';
import { GenerateReportJob, ReportResult } from './reports.jobs';

const RESULT_TTL_SECONDS = 3600;

/**
 * Reports worker.
 *
 * Генерит xlsx в памяти, кладёт base64 в Redis с TTL 1 час. Скачивание
 * — отдельным API-эндпоинтом `GET /admin/reports/:jobId/download`,
 * который отдаёт файл и удаляет ключ (или нет, если хочется кэш).
 *
 * Сейчас реализован один kind — `transactions.excel`. Остальное в TODO.
 */
@Processor(QUEUE_NAMES.REPORTS, { concurrency: 2 })
export class ReportsProcessor extends WorkerHost {
  private readonly logger = new Logger('ReportsProcessor');

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    if (job.name !== JOB_NAMES.REPORTS.GENERATE) {
      throw new Error(`Unknown reports job: ${job.name}`);
    }

    const data = job.data as GenerateReportJob;

    switch (data.kind) {
      case 'transactions.excel':
        return this.generateTransactionsExcel(job, data);
      default:
        throw new Error(`Report kind not implemented: ${data.kind}`);
    }
  }

  private async generateTransactionsExcel(
    job: Job,
    data: GenerateReportJob,
  ): Promise<{
    kind: string;
    filename: string;
    rowCount: number;
    generatedAt: string;
  }> {
    const { from, to, branchId } = data;

    const where: Record<string, unknown> = {};
    if (branchId != null) where.branchId = branchId;

    if (from || to) {
      const parseDate = (s: string) =>
        parse(s, 'dd.MM.yyyy', new Date(), { weekStartsOn: 1 });
      const fromDate = from ? parseDate(from) : null;
      const toDate = to ? parseDate(to) : null;
      if (fromDate || toDate) {
        where.date = {
          ...(fromDate ? { gte: fromDate } : {}),
          ...(toDate ? { lte: new Date(toDate.getTime() + 86_400_000 - 1) } : {}),
        };
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { author: true, student: true, user: true, branch: true },
      orderBy: { date: 'desc' },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'LMS reports worker';
    const ws = wb.addWorksheet('Transactions');

    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Дата', key: 'date', width: 14 },
      { header: 'Тип', key: 'type', width: 8 },
      { header: 'Сумма', key: 'amount', width: 14 },
      { header: 'Филиал', key: 'branch', width: 20 },
      { header: 'Студент', key: 'student', width: 28 },
      { header: 'Сотрудник', key: 'user', width: 28 },
      { header: 'Автор', key: 'author', width: 28 },
      { header: 'Тип оплаты', key: 'paymentType', width: 14 },
      { header: 'Статья расхода', key: 'expenseType', width: 18 },
      { header: 'Статья дохода', key: 'profitType', width: 18 },
      { header: 'Комментарий', key: 'comment', width: 40 },
    ];
    ws.getRow(1).font = { bold: true };

    for (const t of transactions) {
      ws.addRow({
        id: t.id,
        date: format(t.date, 'dd.MM.yyyy'),
        type: t.type,
        amount: t.amount,
        branch: t.branch?.name ?? '',
        student: t.student?.fio ?? '',
        user: t.user?.fio ?? '',
        author: t.author?.fio ?? '',
        paymentType: t.paymentType ?? '',
        expenseType: t.expenseType ?? '',
        profitType: t.profitType ?? '',
        comment: t.comment ?? '',
      });
    }

    ws.getColumn('amount').numFmt = '#,##0';

    const buffer = await wb.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer as ArrayBuffer).toString('base64');

    const filename = `transactions-${format(new Date(), 'yyyyMMdd-HHmmss')}.xlsx`;
    const result: ReportResult = {
      kind: 'transactions.excel',
      base64,
      filename,
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      generatedAt: new Date().toISOString(),
      rowCount: transactions.length,
    };

    await this.redis
      .set(
        `report:result:${job.id}`,
        JSON.stringify(result),
        'EX',
        RESULT_TTL_SECONDS,
      )
      .catch((err) => {
        this.logger.warn(
          `report result save failed: ${
            err instanceof Error ? err.message : err
          }`,
        );
      });

    this.logger.log(
      `transactions.excel job=${job.id} rows=${transactions.length}`,
    );

    // Return compact metadata (чтобы в Bull Board не хранить MB-base64).
    return {
      kind: result.kind,
      filename: result.filename,
      rowCount: result.rowCount,
      generatedAt: result.generatedAt,
    };
  }
}
