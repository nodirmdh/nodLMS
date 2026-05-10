import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateBonusStudentDto {
  @ApiProperty()
  @IsNumber()
  readonly amount: number;

  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  readonly comment: string;

  @ApiProperty()
  @IsString()
  readonly date: string;

  @ApiProperty()
  @IsNumber()
  readonly userId: number;
}
