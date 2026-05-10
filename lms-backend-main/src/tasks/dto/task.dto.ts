import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @ApiProperty({ required: false, description: 'ISO datetime' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  assignedTo?: number;

  @ApiProperty({
    required: false,
    description: 'student | leed | group | transaction',
  })
  @IsOptional()
  @IsString()
  relatedEntity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  relatedId?: number;
}

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  assignedTo?: number;

  @ApiProperty({
    required: false,
    enum: ['pending', 'inProgress', 'done', 'cancelled'],
  })
  @IsOptional()
  @IsEnum({
    pending: 'pending',
    inProgress: 'inProgress',
    done: 'done',
    cancelled: 'cancelled',
  })
  status?: TaskStatus;
}
