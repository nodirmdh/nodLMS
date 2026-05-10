import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationChannel, NotificationTemplate } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { renderTemplate } from './template.renderer';

export interface RenderedMessage {
  templateId: number;
  channel: NotificationChannel;
  subject?: string | null;
  body: string;
}

/**
 * CRUD-лайт для `notification_templates` + рендер.
 *
 * Rendering идёт через наш minimal engine (template.renderer.ts).
 * UI/админка для редактирования шаблонов — позже, сейчас заводятся
 * сидером или миграцией данных.
 */
@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger('NotificationTemplateService');

  constructor(private readonly prisma: PrismaService) {}

  async findByCode(
    code: string,
    channel: NotificationChannel,
    locale = 'ru',
  ): Promise<NotificationTemplate | null> {
    return this.prisma.notificationTemplate.findUnique({
      where: {
        code_channel_locale: { code, channel, locale },
      },
    });
  }

  async render(
    code: string,
    channel: NotificationChannel,
    variables: Record<string, unknown>,
    locale = 'ru',
  ): Promise<RenderedMessage> {
    const template = await this.findByCode(code, channel, locale);
    if (!template) {
      // Fallback: если локаль не найдена — пробуем `ru`.
      if (locale !== 'ru') {
        return this.render(code, channel, variables, 'ru');
      }
      throw new NotFoundException(
        `Notification template not found: ${code}/${channel}/${locale}`,
      );
    }
    if (!template.enabled) {
      throw new NotFoundException(
        `Notification template disabled: ${code}/${channel}/${locale}`,
      );
    }

    return {
      templateId: template.id,
      channel,
      subject: template.subject
        ? renderTemplate(template.subject, variables)
        : null,
      body: renderTemplate(template.body, variables),
    };
  }
}
