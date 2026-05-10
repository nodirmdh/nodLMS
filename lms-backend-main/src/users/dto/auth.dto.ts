import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  readonly phone: string;
}

export class ConfirmDto {
  @ApiProperty()
  @IsString()
  readonly phone: string;
  @ApiProperty()
  @IsString()
  readonly code: string;
}
