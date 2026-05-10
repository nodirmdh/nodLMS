import { ApiProperty } from '@nestjs/swagger';
import { MentorSalaryType, Role, UserStatusType } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fio: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false })
  @IsString()
  phoneSecond?: string;

  @ApiProperty({ required: false })
  @IsString()
  documentSeries?: string;

  @ApiProperty({ required: false })
  @IsString()
  documentNo?: string;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  role: Role[];

  @ApiProperty({
    enum: MentorSalaryType,
    enumName: 'MentorSalaryType',
    required: false,
  })
  @IsOptional()
  @IsEnum(MentorSalaryType)
  salaryMentorType?: MentorSalaryType;

  @ApiProperty({ required: false })
  @IsNumber()
  salaryMentor?: number;

  @ApiProperty()
  @IsArray()
  branches: string[];

  @ApiProperty({ required: true })
  @IsNumber()
  salary: number;

  @ApiProperty({ required: false })
  @IsString()
  telegram?: string;

  @ApiProperty({ required: false })
  @IsString()
  sex?: string;

  @ApiProperty({ required: false })
  @IsString()
  birthday?: string;

  @ApiProperty({ required: false })
  @IsString()
  socialStatus?: string;

  @ApiProperty({ required: false })
  @IsString()
  education?: string;

  @ApiProperty({ required: false })
  @IsString()
  familyStatus?: string;

  @ApiProperty({ required: false })
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  cardNo?: string;

  @ApiProperty({ required: false })
  @IsString()
  cardPlaceholder?: string;
}
