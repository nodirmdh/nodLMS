import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class addExamDto {
  @ApiProperty()
  @IsInt()
  readonly studentId: number;

  @ApiProperty()
  @IsInt()
  readonly grade: number;

  @ApiProperty()
  @IsString()
  readonly comment: string;
}
