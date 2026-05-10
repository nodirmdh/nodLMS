import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class BranchDto {
  @ApiProperty()
  @IsInt()
  readonly id: number;

  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  readonly address: string;

  @ApiProperty()
  @IsInt()
  readonly usersCount: number;

  @ApiProperty()
  @IsInt()
  readonly coursesCount: number;
}
