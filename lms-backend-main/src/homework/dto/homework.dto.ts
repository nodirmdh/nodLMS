import { ApiProperty } from '@nestjs/swagger';
import { HomeworkSubmissionStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHomeworkDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  lessonId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class UpdateHomeworkDto {
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
  dueDate?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class SubmitHomeworkDto {
  @ApiProperty()
  @IsInt()
  studentId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}

export class ReviewSubmissionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  grade?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reviewerComment?: string;

  @ApiProperty({
    required: false,
    enum: ['submitted', 'reviewed', 'returned'],
  })
  @IsOptional()
  @IsEnum({
    submitted: 'submitted',
    reviewed: 'reviewed',
    returned: 'returned',
  })
  status?: HomeworkSubmissionStatus;
}
