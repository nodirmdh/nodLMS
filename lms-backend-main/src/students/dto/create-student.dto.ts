import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty()
  @IsNumber()
  readonly leadId: number;

  @ApiProperty()
  @IsString()
  readonly fio: string;

  @ApiProperty()
  @IsString()
  readonly phone: string;

  @ApiProperty()
  @IsString()
  readonly birthday: string;

  @ApiProperty()
  readonly groups: any;
}
