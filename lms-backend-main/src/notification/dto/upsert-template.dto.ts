import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { NotificationChannel } from '@prisma/client';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Машинный код шаблона, например `debt.reminder`' })
  @IsString()
  @Length(2, 100)
  code: string;

  @ApiProperty({
    enum: ['sms', 'telegram', 'email', 'push'],
    description: 'Канал доставки',
  })
  @IsEnum({ sms: 'sms', telegram: 'telegram', email: 'email', push: 'push' })
  channel: NotificationChannel;

  @ApiProperty({ default: 'ru', required: false })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description:
      'Текст. Переменные указываются как {{ path }}, например {{ student.fio }}.',
  })
  @IsString()
  @Length(1, 2000)
  body: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateTemplateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  body?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class PreviewTemplateDto {
  @ApiProperty({
    description:
      'Переменные для подстановки при рендере. Пример: { student: { fio: "Иванов" }, amount: "100 000" }',
    required: false,
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  variables?: Record<string, unknown>;
}
