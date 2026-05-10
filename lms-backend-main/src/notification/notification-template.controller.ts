import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationChannel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../auth/decorator/roles.decorator';
import { Audit } from '../audit/audit.decorator';
import {
  CreateTemplateDto,
  PreviewTemplateDto,
  UpdateTemplateDto,
} from './dto/upsert-template.dto';
import { renderTemplate } from './template.renderer';

const CHANNELS: NotificationChannel[] = ['sms', 'telegram', 'email', 'push'];

/**
 * CRUD для `notification_templates`.
 *
 * Доступно только ролям CEO / admin. Каждая изменяющая операция
 * пишется в AuditLog (через @Audit). Preview-эндпоинт позволяет
 * увидеть, как шаблон отрисуется с заданными переменными — удобно
 * для админской UI-формы.
 */
@ApiTags('NotificationTemplates')
@Controller('admin/notifications/templates')
@Roles('CEO', 'admin')
export class NotificationTemplateController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Список шаблонов (фильтры по channel/locale)' })
  @Get()
  async list(
    @Query('channel') channel?: string,
    @Query('locale') locale?: string,
  ) {
    if (channel && !CHANNELS.includes(channel as NotificationChannel)) {
      throw new BadRequestException(`channel must be one of ${CHANNELS.join(', ')}`);
    }
    return this.prisma.notificationTemplate.findMany({
      where: {
        ...(channel ? { channel: channel as NotificationChannel } : {}),
        ...(locale ? { locale } : {}),
      },
      orderBy: [{ code: 'asc' }, { channel: 'asc' }, { locale: 'asc' }],
    });
  }

  @ApiOperation({ summary: 'Получить шаблон' })
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const t = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    });
    if (!t) throw new NotFoundException();
    return t;
  }

  @ApiOperation({ summary: 'Создать шаблон' })
  @Post()
  @Audit({
    action: 'notification_template.create',
    entity: 'NotificationTemplate',
    entityIdFrom: 'result.id',
  })
  async create(@Body() dto: CreateTemplateDto) {
    return this.prisma.notificationTemplate.create({
      data: {
        code: dto.code,
        channel: dto.channel,
        locale: dto.locale ?? 'ru',
        subject: dto.subject ?? null,
        body: dto.body,
        enabled: dto.enabled ?? true,
      },
    });
  }

  @ApiOperation({ summary: 'Обновить шаблон' })
  @Patch(':id')
  @Audit({
    action: 'notification_template.update',
    entity: 'NotificationTemplate',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...(dto.subject !== undefined ? { subject: dto.subject } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.enabled !== undefined ? { enabled: dto.enabled } : {}),
      },
    });
  }

  @ApiOperation({ summary: 'Удалить шаблон' })
  @Delete(':id')
  @Audit({
    action: 'notification_template.delete',
    entity: 'NotificationTemplate',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.notificationTemplate.delete({ where: { id } });
  }

  @ApiOperation({
    summary: 'Preview: рендер шаблона без отправки',
    description:
      'Возвращает { subject, body } с подставленными variables. Не пишет в лог, не отправляет.',
  })
  @Post(':id/preview')
  async preview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PreviewTemplateDto,
  ) {
    const t = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    });
    if (!t) throw new NotFoundException();
    return {
      id: t.id,
      code: t.code,
      channel: t.channel,
      locale: t.locale,
      subject: t.subject
        ? renderTemplate(t.subject, dto.variables ?? {})
        : null,
      body: renderTemplate(t.body, dto.variables ?? {}),
    };
  }
}
