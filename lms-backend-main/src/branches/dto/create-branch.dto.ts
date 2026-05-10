import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  readonly address: string;
}
