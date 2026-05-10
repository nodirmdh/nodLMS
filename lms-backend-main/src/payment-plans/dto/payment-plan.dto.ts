import { ApiProperty } from '@nestjs/swagger';
import { PaymentPlanItemStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePaymentPlanDto {
  @ApiProperty()
  @IsInt()
  studentId: number;

  @ApiProperty({ description: 'Общая сумма рассрочки (сум)' })
  @IsNumber()
  @Min(1)
  totalAmount: number;

  @ApiProperty({ description: 'Количество месяцев, 1..36' })
  @IsInt()
  @Min(1)
  @Max(36)
  monthsCount: number;

  @ApiProperty({ description: 'ISO дата первого платежа' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdatePaymentPlanItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @ApiProperty({ required: false, enum: ['pending', 'paid', 'overdue', 'cancelled'] })
  @IsOptional()
  @IsEnum({
    pending: 'pending',
    paid: 'paid',
    overdue: 'overdue',
    cancelled: 'cancelled',
  })
  status?: PaymentPlanItemStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  paidTransactionId?: number;
}
