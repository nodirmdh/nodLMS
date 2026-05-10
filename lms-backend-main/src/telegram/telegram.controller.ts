import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { TelegramWebhookService } from './telegram-webhook.service';
import { TelegramLinkService } from './telegram-link.service';
import { Roles } from '../auth/decorator/roles.decorator';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger('TelegramController');

  constructor(
    private readonly webhookService: TelegramWebhookService,
    private readonly linkService: TelegramLinkService,
  ) {}

  @ApiOperation({ summary: 'Сгенерировать одноразовый код привязки для студента' })
  @Roles('CEO', 'admin', 'manager')
  @Post('link-codes')
  async issue(@Body() body: { studentId?: number; userId?: number }) {
    return this.linkService.issueLinkCode(body);
  }

  @ApiOperation({
    summary: 'Telegram webhook',
    description:
      'Публичный endpoint для Telegram. Проверяется заголовок X-Telegram-Bot-Api-Secret-Token (если TELEGRAM_WEBHOOK_SECRET задан).',
  })
  @Public()
  @HttpCode(200)
  @Post('webhook')
  async webhook(
    @Headers('x-telegram-bot-api-secret-token') secret: string | undefined,
    @Body() update: unknown,
  ) {
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expected && secret !== expected) {
      this.logger.warn('telegram webhook: invalid secret');
      throw new UnauthorizedException();
    }

    await this.webhookService.handleUpdate(update);
    return { ok: true };
  }
}
