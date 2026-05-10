import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsInt()
  readonly price: number;

  @ApiProperty()
  @IsInt()
  readonly duration: number;

  @ApiProperty()
  @IsInt()
  readonly branchId: number;
}
