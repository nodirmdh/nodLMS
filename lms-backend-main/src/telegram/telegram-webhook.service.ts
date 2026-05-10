import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramLinkService } from './telegram-link.service';
import { JOB_NAMES, QUEUE_NAMES } from '../queues/queue.constants';

/**
 * Обрабатывает входящие Telegram updates.
 *
 * Текущая MVP-версия распознаёт:
 *   /start <linkCode>  — привязать Telegram к студенту через код.
 *   /balance           — прислать баланс студента.
 *   /schedule          — прислать ближайшие уроки.
 *   /help              — подсказка по командам.
 *
 * Реальная отправка идёт через `telegram`-очередь — этот сервис не
 * стучится в Bot API сам, только продюсер.
 */
@Injectable()
export class TelegramWebhookService {
  private readonly logger = new Logger('TelegramWebhookService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly links: TelegramLinkService,
    @InjectQueue(QUEUE_NAMES.TELEGRAM) private readonly tg: Queue,
  ) {}

  async handleUpdate(update: any) {
    const message = update?.message;
    if (!message?.text || !message?.from?.id) return;

    const tgId = String(message.from.id);
    const username: string | null = message.from.username ?? null;
    const chatId = String(message.chat.id);
    const text: string = String(message.text).trim();

    await this.links.touchLastSeen(tgId);

    if (text.startsWith('/start')) {
      return this.handleStart(text, { tgId, username, chatId });
    }
    if (text.startsWith('/balance')) {
      return this.handleBalance({ tgId, chatId });
    }
    if (text.startsWith('/schedule')) {
      return this.handleSchedule({ tgId, chatId });
    }
    if (text.startsWith('/help')) {
      return this.send(chatId, this.helpText());
    }

    return this.send(
      chatId,
      'Не понял команду. Пришлите /help для списка команд.',
    );
  }

  private helpText() {
    return [
      'Доступные команды:',
      '/start <код> — привязать аккаунт по коду от администратора',
      '/balance — показать баланс ребёнка',
      '/schedule — показать ближайшие уроки',
      '/help — эта справка',
    ].join('\n');
  }

  private async handleStart(
    text: string,
    ctx: { tgId: string; username: string | null; chatId: string },
  ) {
    const code = text.replace('/start', '').trim();
    if (!code) {
      return this.send(
        ctx.chatId,
        'Привет! Отправьте /start <код-привязки>, который вам выдали в учебном центре.',
      );
    }

    try {
      const link = await this.links.consumeLinkCode({
        code,
        telegramUserId: ctx.tgId,
        username: ctx.username,
      });
      await this.send(
        ctx.chatId,
        `Готово! Ваш аккаунт привязан. Используйте /balance и /schedule.`,
      );
      return link;
    } catch (err) {
      this.logger.warn(
        `consumeLinkCode failed: ${
          err instanceof Error ? err.message : err
        }`,
      );
      return this.send(
        ctx.chatId,
        'Код не найден или уже использован. Попросите новый код у администратора.',
      );
    }
  }

  private async handleBalance(ctx: { tgId: string; chatId: string }) {
    const link = await this.links.findByTgId(ctx.tgId);
    if (!link?.active || !link.studentId) {
      return this.send(
        ctx.chatId,
        'Сначала привяжите аккаунт: /start <код>.',
      );
    }
    const student = await this.prisma.student.findUnique({
      where: { id: link.studentId },
    });
    if (!student) return this.send(ctx.chatId, 'Студент не найден.');

    const balance = Number(student.balance ?? 0);
    const pretty = balance
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return this.send(
      ctx.chatId,
      `${student.fio}\nБаланс: ${pretty} сум${
        balance < 0 ? ' (есть задолженность)' : ''
      }`,
    );
  }

  private async handleSchedule(ctx: { tgId: string; chatId: string }) {
    const link = await this.links.findByTgId(ctx.tgId);
    if (!link?.active || !link.studentId) {
      return this.send(
        ctx.chatId,
        'Сначала привяжите аккаунт: /start <код>.',
      );
    }

    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 86_400_000);

    const upcoming = await this.prisma.lesson.findMany({
      where: {
        date: { gte: now, lte: weekAhead },
        status: { in: ['waiting', 'waitingConfirm'] },
        group: {
          groupStudents: {
            some: { studentId: link.studentId, status: 'active' },
          },
        },
      },
      include: { group: { include: { course: true } } },
      orderBy: { date: 'asc' },
      take: 7,
    });

    if (!upcoming.length) {
      return this.send(ctx.chatId, 'Ближайших уроков нет.');
    }

    const lines = upcoming.map((l) => {
      const d = new Date(l.date);
      const day = d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
      });
      return `${day} · ${l.startTime}–${l.endTime} · ${
        l.group?.course?.name ?? l.group?.name ?? 'Занятие'
      }`;
    });
    return this.send(
      ctx.chatId,
      `Ближайшие уроки:\n${lines.join('\n')}`,
    );
  }

  private async send(chatId: string, text: string) {
    await this.tg.add(JOB_NAMES.TELEGRAM.SEND_MESSAGE, { chatId, text });
  }
}
