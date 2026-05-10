import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Привязка Telegram-аккаунта к студенту/родителю через одноразовый код.
 *
 * UX:
 *   1. Менеджер (или сам студент в ЛК) генерирует linkCode через
 *      POST /telegram/link-codes { studentId }.
 *   2. Пользователь идёт в бота, отправляет /start <code>.
 *   3. Webhook резолвит код → создаёт TelegramLink.
 */
@Injectable()
export class TelegramLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async issueLinkCode(params: { studentId?: number; userId?: number }) {
    if (!params.studentId && !params.userId) {
      throw new Error('studentId or userId is required');
    }
    const code = randomBytes(4).toString('hex').toUpperCase();
    // Один активный link-pending код на студента: старые без telegramUserId
    // превращаются в мусор, но не проблема — уникальность только на tgId.
    return this.prisma.telegramLink.create({
      data: {
        studentId: params.studentId ?? null,
        userId: params.userId ?? null,
        telegramUserId: `pending:${code}`,
        linkCode: code,
        active: false,
      },
    });
  }

  /**
   * Привязать telegramUserId к существующему link-code. Используется из webhook.
   */
  async consumeLinkCode(params: {
    code: string;
    telegramUserId: string;
    username?: string | null;
  }) {
    const pending = await this.prisma.telegramLink.findUnique({
      where: { linkCode: params.code.trim().toUpperCase() },
    });
    if (!pending || pending.active) {
      throw new NotFoundException('link code invalid or already used');
    }
    // Если на этого tg-пользователя уже есть активная привязка — вернём её,
    // чтобы не плодить дубли.
    const existing = await this.prisma.telegramLink.findUnique({
      where: { telegramUserId: params.telegramUserId },
    });
    if (existing) return existing;

    return this.prisma.telegramLink.update({
      where: { id: pending.id },
      data: {
        telegramUserId: params.telegramUserId,
        username: params.username ?? null,
        active: true,
        linkCode: null,
        linkedAt: new Date(),
        lastSeenAt: new Date(),
      },
    });
  }

  async findByTgId(telegramUserId: string) {
    return this.prisma.telegramLink.findUnique({
      where: { telegramUserId },
    });
  }

  async touchLastSeen(telegramUserId: string) {
    await this.prisma.telegramLink
      .update({
        where: { telegramUserId },
        data: { lastSeenAt: new Date() },
      })
      .catch(() => null);
  }
}
