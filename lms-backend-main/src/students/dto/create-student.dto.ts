import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  readonly leadId?: number;

  @ApiProperty()
  @IsString()
  readonly fio: string;

  @ApiProperty()
  @IsString()
  readonly phone: string;

  @ApiProperty()
  @IsString()
  readonly birthday: string;

  @ApiProperty({ type: [Object] })
  @IsOptional()
  @IsArray()
  readonly groups?: Array<{
    groupId: number | string;
    discount?: number | string;
    discountComment?: string;
  }>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly sex?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly disability?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly telegram?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly documentSeries?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly documentNo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly pinfl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly fatherFio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly fatherJob?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly fatherPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly montherFio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly montherJob?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly montherPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly avatar?: string;
}
